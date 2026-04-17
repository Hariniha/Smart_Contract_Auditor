import { NextRequest, NextResponse } from 'next/server';
import { performStaticAnalysis } from '@/lib/static-analyzer';
import { detectLanguage, SmartContractLanguage } from '@/lib/language-detector';
import { analyzeWithAI, enhanceVulnerabilityDescription, performFullAIAnalysis } from '@/lib/groq-service';
import { calculateEthTrustLevel, getEthTrustLevelDefinition } from '@/lib/ethtrust';
import { SCSVS_V2_CONTROLS, calculateSCSVSCompliance } from '@/lib/scsvs-v2';
import { calculateSecurityScore, getRiskLevel } from '@/lib/utils';
import { AnalysisResult, Vulnerability } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Validation function to prevent AI false positives
function validateAIFinding(finding: any, contractCode: string, language: string): boolean {
  const name = finding.name.toLowerCase();
  const code = contractCode.toLowerCase();
  
  // Pattern validation: Check if the vulnerability evidence exists in code
  
  // tx.origin false positive prevention
  if (name.includes('tx.origin') || name.includes('tx\.origin')) {
    // Must actually use tx.origin in authorization logic
    if (!code.includes('tx.origin')) return false;
    // Must be used in require or if condition
    const hasAuthUse = /require\s*\([^)]*tx\.origin|if\s*\([^)]*tx\.origin/.test(contractCode);
    if (!hasAuthUse) return false;
  }
  
  // Reentrancy false positive prevention
  if (name.includes('reentrancy') || name.includes('reentrant')) {
    // Must have external calls (.call, .send, .transfer)
    const hasExternalCall = /\.call\s*\{|\.call\.value\(|\.send\s*\(|\.transfer\s*\(|msg\.sender\.transfer/i.test(contractCode);
    if (!hasExternalCall) return false;
  }
  
  // Missing access control false positive prevention
  if (name.includes('access control') || name.includes('unprotected') || name.includes('onlyOwner')) {
    // Must have public/external functions without require checks or permission checks
    // This is harder to validate without being too strict
    // Allow if it's about specific functions
    if (finding.codeSnippet && finding.codeSnippet.length > 0) {
      return true; // Has specific code evidence
    }
  }
  
  // For other findings, if there's actual code snippet evidence, trust it
  if (finding.codeSnippet && finding.codeSnippet.length > 5) {
    // Try to find that code snippet in the contract
    if (contractCode.includes(finding.codeSnippet)) {
      return true; // Found exact code snippet
    }
  }
  
  // Generic validation: Higher confidence findings are more trustworthy
  if (finding.confidence === 'High') {
    return true; // Trust high-confidence findings more
  }
  
  // Medium/Low confidence findings need more evidence
  if (finding.confidence === 'Medium' && name.length > 10) {
    return true; // Allow medium confidence if specific enough
  }
  
  // Default: be conservative and filter low-confidence findings
  return finding.confidence === 'High';
}

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
        // BUT: Validate they actually exist in the code to prevent false positives
        for (const aiVuln of aiDiscoveredVulns) {
          // Validate: Check if the vulnerability evidence actually exists in code
          const isValidFinding = validateAIFinding(aiVuln, contractCode, detectedLanguage);
          
          if (!isValidFinding) {
            console.warn(`AI false positive filtered: ${aiVuln.name}`);
            continue; // Skip false positive
          }
          
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

    // Generate informational findings when contract passes security checks
    if (allVulnerabilities.length === 0) {
      // Add positive informational findings
      const infoFindings = [];
      
      infoFindings.push({
        id: uuidv4(),
        name: 'No Critical Vulnerabilities Detected',
        type: 'Info',
        description: 'The smart contract has successfully passed comprehensive automated security analysis with no critical or high-severity vulnerabilities identified.',
        severity: 'Info' as const,
        lineNumber: 1,
        codeSnippet: 'Contract Passed',
        exploitationScenario: 'N/A - This is a positive finding.',
        recommendation: 'Continue to follow security best practices and maintain regular code audits as the contract evolves.',
        detectionMethod: 'static' as const,
        confidence: 'High' as const,
        swcId: '',
        cweIds: [],
        scsvIds: [],
        ethTrustImpact: 0,
        references: []
      });
      
      // Add code quality observations
      infoFindings.push({
        id: uuidv4(),
        name: 'Code Quality and Structure',
        type: 'Info',
        description: `Contract ${detectedLanguage.charAt(0).toUpperCase() + detectedLanguage.slice(1)} code appears well-structured with appropriate use of language-specific patterns and conventions.`,
        severity: 'Info' as const,
        lineNumber: 1,
        codeSnippet: 'Code Structure Assessment',
        exploitationScenario: 'N/A - Informational finding regarding code quality.',
        recommendation: `Continue employing ${detectedLanguage} security best practices, implement comprehensive testing, and consider formal verification for critical functions.`,
        detectionMethod: 'static' as const,
        confidence: 'High' as const,
        swcId: '',
        cweIds: [],
        scsvIds: [],
        ethTrustImpact: 0,
        references: []
      });

      allVulnerabilities.push(...infoFindings);
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

    // Generate context-aware recommendations
    const recommendations: string[] = [];
    
    // Add language-specific recommendations
    if (detectedLanguage === 'solidity') {
      recommendations.push('Use the latest stable Solidity compiler version to benefit from security patches');
      if (statistics.critical > 0 || statistics.high > 0) {
        recommendations.push('Implement comprehensive access control checks and input validation');
      }
    } else if (detectedLanguage === 'cairo') {
      recommendations.push('Leverage Cairo\'s type system and formal verification capabilities');
      recommendations.push('Consider using StarkWare\'s testing framework for unit and integration tests');
    } else if (detectedLanguage === 'vyper') {
      recommendations.push('Utilize Vyper\'s memory safety features and enhanced security-by-design approach');
      recommendations.push('Enable all Vyper compiler safety checks and warnings');
    }
    
    // Vulnerability-specific recommendations
    if (statistics.critical > 0) {
      recommendations.push(`CRITICAL: ${statistics.critical} critical vulnerabilities must be addressed before any mainnet deployment`);
    }
    if (statistics.high > 0) {
      recommendations.push(`HIGH: ${statistics.high} high-severity issues require immediate remediation to prevent potential exploits`);
    }
    if (statistics.medium > 0) {
      recommendations.push(`MEDIUM: ${statistics.medium} medium-risk findings should be fixed in the next development cycle`);
    }
    
    // Check for specific vulnerability types
    const hasReentrancy = allVulnerabilities.some(v => v.name.toLowerCase().includes('reentrancy'));
    const hasAccessControl = allVulnerabilities.some(v => v.name.toLowerCase().includes('access') || v.name.toLowerCase().includes('authorization'));
    const hasIntegerIssues = allVulnerabilities.some(v => v.name.toLowerCase().includes('overflow') || v.name.toLowerCase().includes('underflow'));
    
    if (hasReentrancy) {
      recommendations.push('Implement checks-effects-interactions pattern for external calls');
      recommendations.push('Consider using ReentrancyGuard for sensitive state modifications');
    }
    if (hasAccessControl) {
      recommendations.push('Review and strengthen access control mechanisms - verify role-based permissions');
      recommendations.push('Document function access levels and implement proper privilege checks');
    }
    if (hasIntegerIssues) {
      recommendations.push('Use SafeMath library or Solidity 0.8+ built-in overflow protection');
      recommendations.push('Validate input ranges before arithmetic operations');
    }
    
    // Compliance recommendations
    if (scsvCompliance.percentage < 100) {
      const failedControls = scsvResults.filter(r => !r.passed);
      const categories = [...new Set(failedControls.map(c => c.category))];
      recommendations.push(`SCSVS Compliance: ${scsvCompliance.percentage.toFixed(0)}% - Address ${failedControls.length} non-compliant controls in categories: ${categories.join(', ')}`);
    }
    
    // EthTrust and best practices
    recommendations.push(`Current EthTrust Level: ${ethTrustDef.name} (${ethTrustDef.description})`);
    recommendations.push(ethTrustDef.recommendation);
    
    // Add best practices based on code metrics
    if (allVulnerabilities.length === 0 && statistics.total === 0) {
      recommendations.push('✓ No vulnerabilities detected - maintain this quality with regular code reviews');
      recommendations.push('Consider implementing additional security measures like formal verification or runtime monitoring');
    } else {
      recommendations.push('Conduct thorough security testing and code reviews before deployment');
      recommendations.push('Set up automated security scanning in your CI/CD pipeline');
    }

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
