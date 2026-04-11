// Plain Text Audit Report Generator
// Generates professional, industry-standard audit reports in plain text format

import { AnalysisResult } from '@/types';
import { getEthTrustLevelDefinition } from './ethtrust';

// ============================================================================
// HELPER FUNCTIONS (Defined First)
// ============================================================================

function calculateContractMetrics(code: string, language: string) {
  const loc = code.split('\n').length;
  
  // Basic pattern matching for different languages
  let functions = 0;
  let stateVariables = 0;
  let externalCalls = 0;
  let compilerVersion = null;

  if (language.toLowerCase() === 'solidity') {
    functions = (code.match(/function\s+\w+\s*\(/g) || []).length;
    stateVariables = (code.match(/^\s*(?:public|private|internal|protected)?\s+\w+\s+\w+\s*[=;]/gm) || []).length;
    externalCalls = (code.match(/\.\s*call|\.transfer|\.send/g) || []).length;
    const versionMatch = code.match(/pragma\s+solidity\s+(\^?[\d\.]+)?/);
    compilerVersion = versionMatch ? versionMatch[1] : null;
  } else if (language.toLowerCase() === 'vyper') {
    functions = (code.match(/@external|@internal|def\s+\w+\s*\(/g) || []).length;
    stateVariables = (code.match(/^\s*\w+\s*:\s*\w+/gm) || []).length;
    externalCalls = (code.match(/send|call/g) || []).length;
    const versionMatch = code.match(/#\s*@version\s+(.+)/);
    compilerVersion = versionMatch ? versionMatch[1] : null;
  } else if (language.toLowerCase() === 'cairo') {
    functions = (code.match(/fn\s+\w+/g) || []).length;
    stateVariables = (code.match(/#\[storage_var\]/g) || []).length;
    externalCalls = (code.match(/call_contract|send_message/g) || []).length;
  }

  return {
    loc,
    functions,
    stateVariables,
    externalCalls,
    compilerVersion
  };
}

function groupVulnerabilitiesBySeverity(vulns: any[]) {
  return vulns.reduce((acc, vuln) => {
    if (!acc[vuln.severity]) {
      acc[vuln.severity] = [];
    }
    acc[vuln.severity].push(vuln);
    return acc;
  }, {} as Record<string, any[]>);
}

function groupBySwcId(vulns: any[]) {
  return vulns.reduce((acc, vuln) => {
    if (!acc[vuln.swcId]) {
      acc[vuln.swcId] = [];
    }
    acc[vuln.swcId].push(vuln);
    return acc;
  }, {} as Record<string, any[]>);
}

function groupByConfidence(vulns: any[]) {
  return vulns.reduce((acc, vuln) => {
    const conf = vuln.confidence || 'Low';
    acc[conf] = (acc[conf] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function calculateAverageConfidence(vulns: any[]): string {
  if (vulns.length === 0) return 'N/A';
  
  const confidenceScores: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
  const totalScore = vulns.reduce((sum, v) => sum + (confidenceScores[v.confidence] || 1), 0);
  const avgScore = totalScore / vulns.length;
  
  if (avgScore >= 2.5) return 'High';
  if (avgScore >= 1.5) return 'Medium';
  return 'Low';
}

function calculateRiskBreakdown(result: any) {
  const total = result.statistics.total || 1;
  return {
    Critical: {
      count: result.statistics.critical,
      percentage: (result.statistics.critical / total) * 100
    },
    High: {
      count: result.statistics.high,
      percentage: (result.statistics.high / total) * 100
    },
    Medium: {
      count: result.statistics.medium,
      percentage: (result.statistics.medium / total) * 100
    },
    Low: {
      count: result.statistics.low,
      percentage: (result.statistics.low / total) * 100
    },
    Info: {
      count: result.statistics.info,
      percentage: (result.statistics.info / total) * 100
    }
  };
}

function formatRiskChart(breakdown: Record<string, any>): string {
  const chart: string[] = [];

  Object.entries(breakdown).forEach(([severity, data]) => {
    const label = severity.padEnd(8);
    const percentage = data.percentage.toFixed(1).padStart(5);
    const count = data.count;
    chart.push(`  ${label} │ ${String(count).padEnd(5)} │ ${percentage}%`);
  });

  return chart.join('\n');
}

function wrapText(text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const words = text.split(' ');
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > maxWidth) {
      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  });

  if (currentLine.trim()) {
    lines.push(currentLine.trim());
  }

  return lines;
}

function centerText(text: string, width: number): string {
  const padding = Math.max(0, Math.floor((width - text.length) / 2));
  return ' '.repeat(padding) + text + ' '.repeat(width - padding - text.length);
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatKeyValue(label: string, value: string | number, labelWidth: number = 30, lineWidth: number = 80): string[] {
  const labelLine = `${label.padEnd(labelWidth)} : `;
  const valueStr = String(value);
  const availableWidth = lineWidth - labelLine.length;
  
  // If value fits on the same line, return single line
  if (valueStr.length <= availableWidth) {
    return [labelLine + valueStr];
  }
  
  // If value is too long, wrap it to next lines with proper indentation
  const words = valueStr.split(/\s+/).filter(w => w.length > 0);
  const indent = ' '.repeat(labelLine.length); // Align with the start of value
  const result: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word;
    
    if (result.length === 0) {
      // First line (after the label)
      if (testLine.length <= availableWidth) {
        currentLine = testLine;
      } else {
        // Word doesn't fit, push current line and start new
        result.push(labelLine + currentLine);
        currentLine = word;
      }
    } else {
      // Subsequent lines
      if (testLine.length <= (lineWidth - indent.length)) {
        currentLine = testLine;
      } else {
        result.push(indent + currentLine);
        currentLine = word;
      }
    }
  }
  
  // Add remaining content
  if (result.length === 0) {
    // No wrapping happened yet, add first line
    result.push(labelLine + currentLine);
  } else if (currentLine) {
    // Add remaining wrapped line
    result.push(indent + currentLine);
  }
  
  return result;
}

function addKeyValue(label: string, value: string | number, lines: string[], labelWidth: number = 30): void {
  const formatted = formatKeyValue(label, value, labelWidth);
  formatted.forEach(line => lines.push(line));
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function cleanText(text: string, maxWidth: number = 80): string {
  const words = text.split(/\s+/).filter(w => w.length > 0);
  let line = '';
  const lines = [];
  
  for (const word of words) {
    if ((line + word).length > maxWidth && line.length > 0) {
      lines.push(line.trim());
      line = word + ' ';
    } else {
      line += word + ' ';
    }
  }
  if (line.trim()) {
    lines.push(line.trim());
  }
  
  return lines.join(' ');
}

function getScoreRating(score: number): string {
  if (score >= 90) return 'Excellent - Contract meets highest security standards';
  if (score >= 75) return 'Good - Contract is generally secure with minor concerns';
  if (score >= 60) return 'Fair - Contract has moderate security concerns';
  if (score >= 40) return 'Poor - Contract has significant security issues';
  return 'Critical - Contract requires immediate remediation';
}

function getImpactDescription(severity: string): string {
  const impacts: Record<string, string> = {
    Critical: 'complete loss of funds or contract control',
    High: 'significant loss of funds or contract compromise',
    Medium: 'moderate financial loss or unexpected behavior',
    Low: 'minor financial loss or optimization opportunity',
    Info: 'best practice recommendation or informational finding'
  };
  return impacts[severity] || 'undefined impact';
}

// ============================================================================
// MAIN REPORT GENERATOR
// ============================================================================

export function generateTextAuditReport(result: AnalysisResult): string {
  const lines: string[] = [];
  const separator = '-'.repeat(80);
  const thinDivider = '-'.repeat(80);
  let sectionNumber = 0;

  // Helper functions
  const addLine = (text: string = '') => lines.push(text);
  const addSpacing = (lines_count: number = 1) => {
    for (let i = 0; i < lines_count; i++) addLine();
  };
  const addBullet = (text: string) => {
    addLine(`  • ${text}`);
  };
  const addKeyValue = (label: string, value: string | number, labelWidth: number = 30) => {
    const formatted = formatKeyValue(label, value, labelWidth);
    formatted.forEach(line => addLine(line));
  };
  const toTitleCase = (str: string) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };
  const addSection = (title: string) => {
    addSpacing(2);
    sectionNumber++;
    addLine(`${sectionNumber}. ${toTitleCase(title)}`);
    addLine(thinDivider);
    addSpacing(1);
  };
  const addSubsection = (title: string) => {
    addSpacing(1);
    addLine(`${title}`);
  };

  // Calculate contract metrics
  const contractMetrics = calculateContractMetrics(result.contractCode, result.language || 'unknown');
  const ethTrustDef = getEthTrustLevelDefinition(result.ethTrustLevel);

  // ============================================================================
  // TITLE & HEADER
  // ============================================================================
  addLine();
  addLine(centerText('SMART CONTRACT SECURITY AUDIT REPORT', 80));
  addLine(thinDivider);
  addSpacing(2);

  // ============================================================================
  // EXECUTIVE SUMMARY
  // ============================================================================
  addSection('EXECUTIVE SUMMARY');
  addKeyValue('Security Score', `${result.securityScore}/100`);
  addKeyValue('Risk Level', result.riskLevel.toUpperCase());
  addKeyValue('Analysis Date', formatDate(new Date(result.timestamp)));
  addKeyValue('Analysis Time', new Date(result.timestamp).toLocaleTimeString());
  addKeyValue('Audit Duration', `${(result.analysisTime / 1000).toFixed(2)}s`);
  addLine();
  addKeyValue('Contract Language', result.language?.toUpperCase() || 'UNKNOWN');
  addKeyValue('Audit ID', result.analysisId);
  addLine();
  addLine('FINDINGS SUMMARY:');
  addBullet(`Critical Issues        : ${result.statistics.critical}`);
  addBullet(`High Severity Issues   : ${result.statistics.high}`);
  addBullet(`Medium Severity Issues : ${result.statistics.medium}`);
  addBullet(`Low Severity Issues    : ${result.statistics.low}`);
  addBullet(`Informational Findings : ${result.statistics.info}`);
  addBullet(`Total Findings         : ${result.statistics.total}`);

  // ============================================================================
  // CONTRACT DETAILS
  // ============================================================================
  addSection('CONTRACT DETAILS');
  addKeyValue('File Name', result.fileName);
  addKeyValue('File Size', `${(result.contractCode.length / 1024).toFixed(2)} KB`);
  addKeyValue('Language', result.language?.toUpperCase() || 'UNKNOWN');
  addLine();
  addLine('CODE METRICS:');
  addBullet(`Lines of Code (LOC)      : ${contractMetrics.loc}`);
  addBullet(`Number of Functions      : ${contractMetrics.functions}`);
  addBullet(`External Calls           : ${contractMetrics.externalCalls}`);
  addBullet(`State Variables          : ${contractMetrics.stateVariables}`);
  addBullet(`Compiler Version         : ${contractMetrics.compilerVersion || 'N/A'}`);

  // ============================================================================
  // SECURITY ASSESSMENT
  // ============================================================================
  addSection('SECURITY ASSESSMENT');
  
  const scoreRating = getScoreRating(result.securityScore);
  addKeyValue('Overall Risk Assessment', scoreRating);
  addKeyValue('Security Score', `${result.securityScore}/100`);
  addKeyValue('Primary Risk Level', result.riskLevel.toUpperCase());
  addLine();
  addLine('This security assessment combines static analysis, dynamic inspection, and');
  addLine('artificial intelligence-powered semantic analysis to identify vulnerabilities.');
  addLine('Detailed compliance metrics are available in the Compliance Metrics section.');

  // ============================================================================
  // DETAILED VULNERABILITY REPORT
  // ============================================================================
  if (result.vulnerabilities.length > 0) {
    addSection('DETAILED VULNERABILITY REPORT');
    addLine(`Total Vulnerabilities Found: ${result.vulnerabilities.length}`);
    addLine();

    // Group vulnerabilities by severity
    const vulnBySeverity = groupVulnerabilitiesBySeverity(result.vulnerabilities);
    const severityOrder = ['Critical', 'High', 'Medium', 'Low', 'Info'];

    severityOrder.forEach((severity: string) => {
      const vulns = vulnBySeverity[severity] || [];
      if (vulns.length > 0) {
        addSubsection(`${severity.toUpperCase()} SEVERITY VULNERABILITIES (${vulns.length})`);
        
        vulns.forEach((vuln: any, index: number) => {
          addLine();
          addLine(`[${index + 1}] ${vuln.name}`);
          addKeyValue('    Severity Level', vuln.severity, 20);
          addKeyValue('    Confidence Score', vuln.confidence, 20);
          addKeyValue('    Location', `Line ${vuln.lineNumber}${vuln.lineRange ? ` (Range: ${vuln.lineRange.start}-${vuln.lineRange.end})` : ''}`, 20);
          addKeyValue('    Detection Method', capitalizeFirst(vuln.detectionMethod), 20);
          addKeyValue('    SWC Identifier', vuln.swcId || 'N/A', 20);
          
          if (vuln.cweIds && vuln.cweIds.length > 0) {
            addKeyValue('    CWE References', vuln.cweIds.join(', '), 20);
          }
          
          addLine();
          addLine('    VULNERABILITY DESCRIPTION:');
          wrapText(vuln.description, 75).forEach((line: string) => addLine(`    ${line}`));
          
          addLine();
          addLine('    EXPLOITATION SCENARIO:');
          const exploitScenario = vuln.exploitationScenario && vuln.exploitationScenario !== vuln.description 
            ? vuln.exploitationScenario 
            : `An attacker could potentially exploit this vulnerability to manipulate contract security controls and trigger ${getImpactDescription(vuln.severity).toLowerCase()}.`;
          wrapText(exploitScenario, 75).forEach((line: string) => addLine(`    ${line}`));
          
          addLine();
          addLine('    POTENTIAL IMPACT:');
          addLine(`    This finding could result in ${getImpactDescription(vuln.severity).toLowerCase()}.`);
          
          addLine();
          addLine('    REMEDIATION RECOMMENDATION:');
          
          // Handle examples on new line with proper wrapping
          if (vuln.recommendation.includes('Example:')) {
            const [mainText, examplePart] = vuln.recommendation.split('Example:');
            wrapText(mainText.trim(), 75).forEach((line: string) => addLine(`    ${line}`));
            addLine();
            addLine('    Example:');
            wrapText(examplePart.trim(), 75).forEach((line: string) => addLine(`    ${line}`));
          } else {
            wrapText(vuln.recommendation, 75).forEach((line: string) => addLine(`    ${line}`));
          }
          
          if (vuln.references && vuln.references.length > 0) {
            addLine();
            addLine('    REFERENCES & RESOURCES:');
            vuln.references.forEach((ref: string) => addLine(`    • ${ref}`));
          }
          
          addLine();
        });
      }
    });
  } else {
    addSection('DETAILED VULNERABILITY REPORT');
    addLine();
    addLine('✓ NO VULNERABILITIES DETECTED');
    addLine();
    addLine('This smart contract has successfully passed comprehensive security assessments.');
    addLine('No vulnerabilities or security issues were identified during this audit engagement.');
  }

  // ============================================================================
  // AI INSIGHTS & CONFIDENCE ANALYSIS
  // ============================================================================
  addSection('AI INSIGHTS & CONFIDENCE ANALYSIS');
  
  const aiVulns = result.vulnerabilities.filter(v => v.detectionMethod === 'ai' || v.detectionMethod === 'hybrid');
  const confidence = calculateAverageConfidence(result.vulnerabilities);
  
  addKeyValue('AI-Identified Issues', aiVulns.length);
  addKeyValue('Average Confidence Score', confidence);
  addLine();
  addLine('CONFIDENCE DISTRIBUTION:');
  
  const confidenceByLevel = groupByConfidence(result.vulnerabilities);
  Object.entries(confidenceByLevel).forEach(([level, count]) => {
    addLine(`  • ${level.padEnd(10)} : ${count as number} findings`);
  });
  
  addLine();
  addLine('MACHINE LEARNING ANALYSIS METHODOLOGY:');
  addBullet('Advanced artificial intelligence models trained on extensive vulnerability');
  addLine('  pattern libraries and semantic code analysis techniques are implemented.');
  addSpacing(1);
  addBullet('Confidence scores represent the classifier\'s statistical certainty level for');
  addLine('  individual findings based on training data patterns and feature extraction.');
  addSpacing(1);
  addBullet('All AI-identified vulnerabilities undergo validation against authoritative');
  addLine('  security standards including SWC Registry, CWE Database, and OWASP guidelines.');

  // ============================================================================
  // COMPLIANCE METRICS
  // ============================================================================
  addSection('COMPLIANCE METRICS');
  
  addSubsection('Smart Contract Weakness Classification (SWC) Registry');
  const swcVulns = groupBySwcId(result.vulnerabilities);
  if (Object.keys(swcVulns).length > 0) {
    Object.entries(swcVulns).forEach(([swcId, vulns]) => {
      addLine(`  • ${swcId}: ${(vulns as any[]).length} finding(s)`);
    });
  } else {
    addLine('  No SWC-mapped vulnerabilities detected.');
  }

  addSubsection('Secure Coding Verification Standard (SCSVS) v2');
  addKeyValue('Overall Compliance Rate', `${result.scsvCompliance.percentage}%`);
  addKeyValue('Controls Passed', result.scsvCompliance.passed);
  addKeyValue('Controls Failed', result.scsvCompliance.failed);
  addLine();
  
  if (result.scsvCompliance.checklist && result.scsvCompliance.checklist.length > 0) {
    const failedControls = result.scsvCompliance.checklist.filter(c => !c.passed);
    
    if (failedControls.length > 0) {
      addLine('NON-COMPLIANT CONTROLS (by Category):');
      addLine();
      
      // Group failed controls by category
      const controlsByCategory = new Map<string, typeof failedControls>();
      failedControls.forEach(control => {
        if (!controlsByCategory.has(control.category)) {
          controlsByCategory.set(control.category, []);
        }
        controlsByCategory.get(control.category)!.push(control);
      });
      
      // Display each category with its failed controls
      controlsByCategory.forEach((controls, category) => {
        addLine(`${category}:`);
        controls.forEach(control => {
          addBullet(`[${control.controlId}] ${control.title} (${control.severity})`);
          if (control.findings && control.findings.length > 0) {
            control.findings.slice(0, 2).forEach(finding => {
              addLine(`      Issues: ${finding}`);
            });
            if (control.findings.length > 2) {
              addLine(`      ... and ${control.findings.length - 2} more`);
            }
          }
        });
        addLine();
      });
      
      if (failedControls.length > 15) {
        addLine(`Note: Showing ${Math.min(15, failedControls.length)} of ${failedControls.length} failed controls`);
      }
    } else {
      addLine('✓ All SCSVS v2 controls have been successfully validated.');
    }
  }

  addSubsection('EthTrust Framework');
  addKeyValue('Security Level', `Level ${ethTrustDef.level}`);
  addKeyValue('Classification', ethTrustDef.name);
  addKeyValue('Risk Rating', ethTrustDef.risk);
  addLine();
  addLine('Framework Details:');
  addLine(`  • Description:             ${ethTrustDef.description}`);

  // ============================================================================
  // RISK BREAKDOWN ANALYSIS
  // ============================================================================
  addSection('RISK BREAKDOWN ANALYSIS');
  
  const riskBreakdown = calculateRiskBreakdown(result);
  addLine('Risk Distribution by Severity:');
  addLine();
  
  Object.entries(riskBreakdown).forEach(([severity, { count, percentage }]) => {
    const impact = getImpactDescription(severity);
    addLine(`${severity.padEnd(12)} : ${String(count).padStart(2)} findings (${percentage.toFixed(1)}%) - ${impact}`);
  });

  // ============================================================================
  // RECOMMENDATIONS SUMMARY
  // ============================================================================
  addSection('RECOMMENDATIONS SUMMARY');
  
  if (result.recommendations && result.recommendations.length > 0) {
    addLine(`Total Recommendations: ${result.recommendations.length}`);
    addLine();
    result.recommendations.forEach((rec, index) => {
      addLine(`${index + 1}. ${rec}`);
      addLine();
    });
  } else {
    addLine('No specific recommendations required at this time. Continue adhering to industry-standard');
  addLine('security best practices and maintain vigilant monitoring of contract activity.');
  }

  addSubsection('RECOMMENDED SECURITY PRACTICES');
  addLine();
  addLine('1. Comprehensive Code Review');
  addLine('   Conduct formal security audits by qualified professionals. Engage specialized');
  addLine('   security firms experienced in smart contract vulnerability assessment and');
  addLine('   mitigation strategies.');
  addLine();
  addLine('2. Rigorous Testing & Verification');
  addLine('   Implement comprehensive unit testing, integration testing, and fuzzing');
  addLine('   protocols. Employ formal verification methods for critical contract');
  addLine('   components and state-critical logic.');
  addLine();
  addLine('3. Secure Deployment Practices');
  addLine('   Conduct thorough testing on testnet environments prior to mainnet');
  addLine('   deployment. Implement staged rollout procedures with circuit breakers,');
  addLine('   pause mechanisms, and emergency response protocols.');
  addLine();
  addLine('4. Runtime Monitoring & Incident Response');
  addLine('   Establish continuous monitoring of contract activity and transaction');
  addLine('   flows. Develop and maintain a comprehensive incident response plan with');
  addLine('   defined escalation procedures and communication protocols.');
  addLine();
  addLine('5. Documentation & Governance');
  addLine('   Maintain meticulous documentation of contract architecture, design');
  addLine('   rationale, and potential risk vectors. Establish governance procedures');
  addLine('   for code changes and security updates.');

  // ============================================================================
  // COMPLIANCE STATEMENT
  // ============================================================================
  addSection('COMPLIANCE STATEMENT');
  addLine();
  addLine('This audit report has been generated by the SmartAudit Agentic Framework, which');
  addLine('combines the following analysis methodologies:');
  addLine();
  addBullet('Static Code Analysis       : Pattern-based vulnerability detection and identification');
  addSpacing(1);
  addBullet('AI-Powered Analysis        : Machine learning-based semantic code analysis');
  addSpacing(1);
  addBullet('Standards Compliance       : Verification against SWC, CWE, SCSVS, and EthTrust');
  addSpacing(1);
  addBullet('Confidence Assessment      : Trust scoring and reliability metrics for findings');
  addLine();
  addLine('This audit framework adheres to industry standards and best practices for');
  addLine('comprehensive smart contract security assessment and vulnerability identification.');

  // ============================================================================
  // DISCLAIMER & IMPORTANT NOTICE
  // ============================================================================
  addSection('DISCLAIMER & IMPORTANT NOTICE');
  addLine();
  addLine('LIMITATION OF LIABILITY:');
  addLine('This security audit is provided as-is and represents a point-in-time assessment');
  addLine('of the submitted smart contract code. This audit does not guarantee the complete');
  addLine('absence of vulnerabilities or the contract\'s fitness for any particular purpose');
  addLine('or use case.');
  addLine();
  addLine('SCOPE & METHODOLOGY:');
  addLine('This audit was performed using automated analysis tools integrated with AI-powered');
  addLine('semantic analysis techniques. While comprehensive in scope, automated analysis may');
  addLine('not identify all vulnerability classes, particularly those requiring specialized');
  addLine('domain expertise or detailed business logic comprehension.');
  addLine();
  addLine('RECOMMENDATIONS FOR USE:');
  addBullet('This report should not be interpreted as financial, legal, or investment advice.');
  addSpacing(1);
  addBullet('All recommendations should be independently reviewed and thoroughly tested by');
  addLine('  qualified developers before implementation in any environment.');
  addSpacing(1);
  addBullet('For production-grade contracts, engagement with multiple specialized security');
  addLine('  firms is strongly recommended.');
  addSpacing(1);
  addBullet('Implementation of security best practices is required beyond this audit\'s scope.');
  addLine();
  addLine('INFORMATION SECURITY:');
  addLine('This report contains sensitive security information and should be handled as');
  addLine('confidential. Distribution should be limited to authorized personnel only.');

  // ============================================================================
  // FOOTER
  // ============================================================================

  return lines.join('\n');
}
