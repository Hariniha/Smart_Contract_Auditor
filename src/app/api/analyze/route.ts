import { NextRequest, NextResponse } from 'next/server';
import { performStaticAnalysis } from '@/lib/static-analyzer';
import { detectLanguage, SmartContractLanguage } from '@/lib/language-detector';
import { analyzeWithAI, enhanceVulnerabilityDescription, performFullAIAnalysis } from '@/lib/groq-service';
import { calculateEthTrustLevel, getEthTrustLevelDefinition } from '@/lib/ethtrust';
import { SCSVS_V2_CONTROLS, calculateSCSVSCompliance } from '@/lib/scsvs-v2';
import { calculateSecurityScore, getRiskLevel } from '@/lib/utils';
import { AnalysisResult, Vulnerability } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractCode, fileName, analysisTypes, severity } = body;
    const validFileNamePattern = /^[^\\/:*?"<>|]+\.(sol|vy|cairo)$/i;

    if (typeof contractCode !== 'string' || !contractCode.trim()) {
      return NextResponse.json(
        { error: 'Contract code is required and must be a string' },
        { status: 400 }
      );
    }

    if (typeof fileName !== 'string' || !validFileNamePattern.test(fileName.trim())) {
      return NextResponse.json(
        { error: 'File name is required and must end with .sol, .vy, or .cairo' },
        { status: 400 }
      );
    }

    const normalizedFileName = fileName.trim();
    const extension = normalizedFileName.split('.').pop()?.toLowerCase();
    const extensionToLanguage: Record<string, SmartContractLanguage> = {
      sol: 'solidity',
      vy: 'vyper',
      cairo: 'cairo'
    };

    const expectedLanguage = extension ? extensionToLanguage[extension] : undefined;
    const detectedFromContent = detectLanguage(contractCode, normalizedFileName);

    if (
      expectedLanguage &&
      detectedFromContent.language !== 'unknown' &&
      detectedFromContent.language !== expectedLanguage
    ) {
      return NextResponse.json(
        {
          error: `File extension mismatch: provided .${extension} but code appears to be ${detectedFromContent.language}. Please use a matching extension.`
        },
        { status: 400 }
      );
    }

    const startTime = Date.now();
    const analysisId = uuidv4();
    let allVulnerabilities: Vulnerability[] = [];
    let detectedLanguage: string = 'solidity';

    // Static Analysis
    if (!analysisTypes || analysisTypes.includes('static')) {
      const staticResult = await performStaticAnalysis(contractCode, fileName);
      allVulnerabilities = [...allVulnerabilities, ...staticResult.vulnerabilities];
      detectedLanguage = staticResult.language || 'solidity';
    }

    // Full AI Analysis - Scans code for ADDITIONAL vulnerabilities
    if (!analysisTypes || analysisTypes.includes('ai')) {
      try {
        const aiDiscoveredVulns = await performFullAIAnalysis(contractCode, detectedLanguage);
        
        // Add AI-discovered vulnerabilities and mark them as 'ai-detected'
        for (const aiVuln of aiDiscoveredVulns) {
          // Avoid duplicate detection - check if similar vulnerability already exists
          const isDuplicate = allVulnerabilities.some(
            v => v.name.toLowerCase() === aiVuln.name.toLowerCase() && 
                 Math.abs(v.lineNumber - aiVuln.lineNumber) < 3 // Within 3 lines
          );
          
          if (!isDuplicate) {
            allVulnerabilities.push({
              id: uuidv4(),
              name: aiVuln.name,
              type: 'AI-Discovered',
              description: aiVuln.description,
              severity: aiVuln.severity,
              lineNumber: aiVuln.lineNumber,
              codeSnippet: aiVuln.codeSnippet,
              exploitationScenario: aiVuln.exploitationScenario,
              recommendation: aiVuln.recommendation,
              detectionMethod: 'ai-detected', // Mark as AI-found
              confidence: aiVuln.confidence,
              cweIds: aiVuln.cweIds,
              swcId: aiVuln.cweIds[0] || 'N/A',
              references: [],
              scsvIds: []
            });
          }
        }
      } catch (error) {
        console.error('Error performing full AI analysis:', error);
        // Continue with static results if AI analysis fails
      }
    }

    // AI Enhancement for top Critical/High vulnerabilities
    const topVulnerabilities = allVulnerabilities
      .filter(v => v.severity === 'Critical' || v.severity === 'High')
      .slice(0, 3);

    for (const vuln of topVulnerabilities) {
      try {
        const enhanced = await enhanceVulnerabilityDescription({
          name: vuln.name,
          type: vuln.type,
          codeSnippet: vuln.codeSnippet,
          lineNumber: vuln.lineNumber
        });

        // Only update if we got valid responses
        if (enhanced.enhancedDescription && enhanced.enhancedDescription !== vuln.name) {
          vuln.description = enhanced.enhancedDescription;
        }
        if (enhanced.exploitationScenario) {
          vuln.exploitationScenario = enhanced.exploitationScenario;
        }
        if (enhanced.recommendation) {
          vuln.recommendation = enhanced.recommendation;
        }
        
        // Update detection method for already-static vulns, or mark AI-detected as 'ai-enhanced'
        if (vuln.detectionMethod === 'static') {
          vuln.detectionMethod = 'hybrid'; // Static + AI enhancement
        } else if (vuln.detectionMethod === 'ai-detected') {
          vuln.detectionMethod = 'ai-optimized'; // AI-detected + further enhanced
        }
      } catch (error) {
        console.error('Error enhancing vulnerability:', error);
        // Continue with current results - don't fail the entire request
      }
    }

    // Filter by severity if specified
    if (severity && severity !== 'all') {
      const severityMap: Record<string, string[]> = {
        critical: ['Critical'],
        high: ['Critical', 'High'],
        medium: ['Critical', 'High', 'Medium'],
        low: ['Critical', 'High', 'Medium', 'Low']
      };
      const allowedSeverities = severityMap[severity] || [];
      allVulnerabilities = allVulnerabilities.filter(v =>
        allowedSeverities.includes(v.severity)
      );
    }

    // Calculate statistics
    const statistics = {
      total: allVulnerabilities.length,
      critical: allVulnerabilities.filter(v => v.severity === 'Critical').length,
      high: allVulnerabilities.filter(v => v.severity === 'High').length,
      medium: allVulnerabilities.filter(v => v.severity === 'Medium').length,
      low: allVulnerabilities.filter(v => v.severity === 'Low').length,
      info: allVulnerabilities.filter(v => v.severity === 'Info').length
    };

    // Calculate security score
    const securityScore = calculateSecurityScore(statistics);
    const riskLevel = getRiskLevel(securityScore);

    // Calculate EthTrust Level
    const ethTrustLevel = calculateEthTrustLevel(statistics);
    const ethTrustDef = getEthTrustLevelDefinition(ethTrustLevel);

    // SCSVS v2 Compliance Check
    const scsvResults = SCSVS_V2_CONTROLS.map(control => {
      // Simple compliance check based on vulnerabilities
      const relatedVulns = allVulnerabilities.filter(v =>
        v.scsvIds?.includes(control.id)
      );

      return {
        controlId: control.id,
        category: control.category,
        title: control.title,
        passed: relatedVulns.length === 0,
        findings: relatedVulns.map(v => v.name),
        severity: relatedVulns.length > 0 ? relatedVulns[0].severity : 'Info'
      };
    });

    const scsvCompliance = {
      ...calculateSCSVSCompliance(
        scsvResults.map(r => ({ controlId: r.controlId, passed: r.passed, findings: r.findings }))
      ),
      checklist: scsvResults
    };

    // Generate recommendations
    const recommendations: string[] = [];
    if (statistics.critical > 0) {
      recommendations.push('Address critical vulnerabilities immediately before deployment');
    }
    if (statistics.high > 0) {
      recommendations.push('Fix high severity issues to prevent potential exploits');
    }
    if (scsvCompliance.percentage < 80) {
      recommendations.push('Improve SCSVS v2 compliance to meet security standards');
    }
    recommendations.push(`Current EthTrust Level: ${ethTrustDef.name}`);
    recommendations.push(ethTrustDef.recommendation);

    const analysisTime = Date.now() - startTime;

    const result: AnalysisResult = {
      analysisId,
      timestamp: new Date().toISOString(),
      contractCode,
      fileName: normalizedFileName,
      language: detectedLanguage,
      securityScore,
      riskLevel,
      vulnerabilities: allVulnerabilities,
      statistics,
      scsvCompliance,
      ethTrustLevel,
      recommendations,
      analysisTime
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
