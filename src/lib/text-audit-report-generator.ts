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
    // Match: function name(, public function name(, etc.
    functions = (code.match(/function\s+\w+\s*\(/g) || []).length;
    // Match state variables: mapping(, uint x, address owner, etc.
    // This includes mappings, enums, structs, and basic types
    stateVariables = (code.match(/^\s*(?:public|private|internal|protected)?\s*(?:mapping\s*\(|uint|int|bool|address|string|bytes\d*)\s+\w+/gm) || []).length;
    // External calls: .call, .transfer, .send
    externalCalls = (code.match(/\.\s*call(?!\w)|\.transfer|\.send/g) || []).length;
    const versionMatch = code.match(/pragma\s+solidity\s+(\^?[\d\.]+)?/);
    compilerVersion = versionMatch ? versionMatch[1] : null;
  } else if (language.toLowerCase() === 'vyper') {
    // Match: @external def func(, @internal def func(, def func(
    functions = (code.match(/(?:@external|@internal)?\s*def\s+\w+\s*\(/g) || []).length;
    // State variables: name: uint256, owner: address
    stateVariables = (code.match(/^\s*\w+\s*:\s*(?:uint|int|bool|address|String|bytes)/gm) || []).length;
    // External calls: extcall or raw_call
    externalCalls = (code.match(/extcall|raw_call/g) || []).length;
    const versionMatch = code.match(/#\s*@version\s+(.+)/);
    compilerVersion = versionMatch ? versionMatch[1] : null;
  } else if (language.toLowerCase() === 'cairo') {
    // Match: fn name(
    functions = (code.match(/fn\s+\w+\s*\(/g) || []).length;
    // Storage variables: name: LegacyMap or name: Map
    stateVariables = (code.match(/\w+\s*:\s*(?:LegacyMap|Map)</g) || []).length;
    // External calls: call_contract or send_message
    externalCalls = (code.match(/call_contract|send_message/g) || []).length;
    // Cairo doesn't have a standard version pragma in code
    compilerVersion = null;
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
  if (score >= 90) return 'Excellent - This contract looks solid';
  if (score >= 75) return 'Good - Generally secure, just a few minor things to fix';
  if (score >= 60) return 'Fair - Has some security concerns worth addressing';
  if (score >= 40) return 'Poor - Significant issues that need fixing';
  return 'Critical - Serious problems. Fix these before deploying.';
}

function getImpactDescription(severity: string): string {
  const impacts: Record<string, string> = {
    Critical: 'total fund loss or loss of contract control',
    High: 'significant fund loss or serious contract issues',
    Medium: 'moderate fund loss or weird behavior',
    Low: 'minor fund loss or performance issues',
    Info: 'best practice suggestions'
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
  addLine('We analyzed this contract using three approaches: static code pattern detection,');
  addLine('runtime behavior analysis, and AI-powered code understanding. Check the Compliance');
  addLine('Metrics section below for more details on what we tested.');

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
            : `An attacker could exploit this to cause ${getImpactDescription(vuln.severity).toLowerCase()}.`;
          wrapText(exploitScenario, 75).forEach((line: string) => addLine(`    ${line}`));
          
          addLine();
          addLine('    POTENTIAL IMPACT:');
          addLine(`    If exploited, this could result in ${getImpactDescription(vuln.severity).toLowerCase()}.`);
          
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
    addLine('Great news! We didn\'t find any security issues in this contract.');
    addLine('It passed our analysis without flags.');
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
  addLine('HOW THE AI WORKS:');
  addBullet('Our AI model has been trained on thousands of real vulnerability patterns to');
  addLine('  recognize security issues in your code.');
  addSpacing(1);
  addBullet('The confidence score tells you how sure the AI is about each finding. A high');
  addLine('  score means the issue is more likely to be real.');
  addSpacing(1);
  addBullet('Every finding gets double-checked against industry standards like the SWC Registry,');
  addLine('  CWE Database, and OWASP guidelines to make sure it\'s legit.');

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
    addLine('No specific issues found. Keep following security best practices and monitor your');
  addLine('contract regularly.');
  }

  addSubsection('RECOMMENDED SECURITY PRACTICES');
  addLine();
  addLine('1. Code Review');
  addLine('   Have someone experienced in smart contract security review your code.');
  addLine('   Consider hiring a specialized security firm for production contracts.');
  addLine();
  addLine('2. Testing');
  addLine('   Write unit tests, integration tests, and try fuzzing. Use formal');
  addLine('   verification for critical parts of your contract.');
  addLine();
  addLine('3. Deployment Strategy');
  addLine('   Always test thoroughly on a testnet first. Roll out slowly to mainnet');
  addLine('   with circuit breakers and pause mechanisms in place.');
  addLine();
  addLine('4. Monitoring');
  addLine('   Watch your contract closely for unusual activity. Have a plan for what');
  addLine('   to do if something goes wrong.');
  addLine();
  addLine('5. Documentation');
  addLine('   Write clear docs about how your contract works and what could go wrong.');
  addLine('   Make it easy for people to understand your architecture and risk vectors.');

  // ============================================================================
  // COMPLIANCE STATEMENT
  // ============================================================================
  addSection('COMPLIANCE STATEMENT');
  addLine();
  addLine('This report was generated by SmartAudit, which combines multiple testing methods:');
  addLine();
  addBullet('Pattern-based detection: Looks for known vulnerability patterns in your code');
  addSpacing(1);
  addBullet('AI analysis: Uses machine learning to understand the code semantically');
  addSpacing(1);
  addBullet('Standards validation: Checks findings against SWC, CWE, SCSVS, and EthTrust');
  addSpacing(1);
  addBullet('Confidence scoring: Rates how confident we are about each finding');
  addLine();
  addLine('We follow industry best practices to make sure our audits are thorough and reliable.');

  // ============================================================================
  // DISCLAIMER & IMPORTANT NOTICE
  // ============================================================================
  addSection('DISCLAIMER & IMPORTANT NOTICE');
  addLine();
  addLine('WHAT THIS AUDIT COVERS:');
  addLine('This is an automated security assessment of your contract at this specific point in');
  addLine('time. We can\'t promise we\'ll catch every possible issue, especially ones that need');
  addLine('deep understanding of your business logic.');
  addLine();
  addLine('HOW TO USE THIS REPORT:');
  addBullet('Don\'t treat this as financial or legal advice.');
  addSpacing(1);
  addBullet('Review each finding carefully and test any fixes thoroughly before deploying.');
  addSpacing(1);
  addBullet('For production contracts, consider getting a manual security review from a');
  addLine('  professional audit firm too.');
  addSpacing(1);
  addBullet('This report is just one part of a complete security strategy.');
  addLine();
  addLine('KEEP THIS PRIVATE:');
  addLine('This report contains sensitive security details. Only share it with people who');
  addLine('need to see it.');

  // ============================================================================
  // FOOTER
  // ============================================================================

  return lines.join('\n');
}
