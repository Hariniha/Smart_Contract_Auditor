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
  if (score >= 90) return 'Excellent - Contract demonstrates strong security practices';
  if (score >= 75) return 'Good - Contract is generally secure with minor improvements recommended';
  if (score >= 60) return 'Fair - Contract has security concerns requiring attention';
  if (score >= 40) return 'Poor - Contract has significant security issues requiring remediation';
  return 'Critical - Contract requires substantial improvements before deployment';
}

function getImpactDescription(severity: string): string {
  const impacts: Record<string, string> = {
    Critical: 'complete loss of funds or complete loss of contract control',
    High: 'significant loss of funds or severe functional compromise',
    Medium: 'moderate loss of funds or unexpected contract behavior',
    Low: 'limited impact on functionality or minor resource inefficiency',
    Info: 'operational best practice recommendations'
  };
  return impacts[severity] || 'undefined impact';
}

function extractContractName(code: string, language: string): string {
  const lang = language.toLowerCase();
  
  if (lang === 'solidity') {
    // Match: contract ContractName { or contract ContractName is ...
    const match = code.match(/contract\s+(\w+)\s*(?:\{|is\s|;)/);
    return match ? match[1] : 'Unknown';
  } else if (lang === 'vyper') {
    // Vyper contracts don't have explicit contract names, use filename or @external
    const match = code.match(/@external|@internal|def\s+\w+/);
    return match ? 'VyperContract' : 'Unknown';
  } else if (lang === 'cairo') {
    // Cairo contracts have a contract or module declaration
    const match = code.match(/contract\s+(\w+)\s*\{|module\s+(\w+)/);
    return match ? (match[1] || match[2]) : 'CairoContract';
  }
  
  return 'Unknown';
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
  const contractName = extractContractName(result.contractCode, result.language || 'unknown');

  // ============================================================================
  // TITLE & HEADER
  // ============================================================================
  addLine();
  addLine(centerText('SMART CONTRACT SECURITY AUDIT REPORT', 80));
  addLine(thinDivider);
  addSpacing(1);

  // ============================================================================
  // EXECUTIVE SUMMARY
  // ============================================================================
  addSection('EXECUTIVE SUMMARY');
  addKeyValue('Contract Name', contractName);
  addKeyValue('Security Score', `${result.securityScore}/100`);
  const riskLevelFormatted = result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1).toLowerCase();
  addKeyValue('Risk Level', riskLevelFormatted);
  addKeyValue('Analysis Date', formatDate(new Date(result.timestamp)));
  addKeyValue('Analysis Time', new Date(result.timestamp).toLocaleTimeString());
  addKeyValue('Audit Duration', `${(result.analysisTime / 1000).toFixed(2)} seconds`);
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
  
  // Display contract name and file information
  addKeyValue('Contract Name', contractName);
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
  const riskLevel2 = result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1).toLowerCase();
  addKeyValue('Primary Risk Level', riskLevel2);
  addLine();
  addLine('The smart contract was analyzed using a multi-layered security assessment approach');
  addLine('combining static code analysis, pattern-based detection, and AI-powered semantic analysis.');
  addLine();

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
    addLine('The automated security analysis did not identify vulnerabilities in the provided contract.');
    addLine('Manual security review by professionals is still recommended for production deployments.');
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
  addLine('AI ANALYSIS METHODOLOGY:');
  addBullet('The AI-assisted analysis model leverages machine learning trained on known smart');
  addLine('  contract vulnerability patterns for semantic code understanding.');
  addSpacing(1);
  addBullet('Confidence scoring represents the model\'s certainty regarding each identified finding.');
  addLine('  Higher confidence scores indicate greater likelihood of valid security issues.');
  addSpacing(1);
  addBullet('All findings are validated against recognized industry security standards');
  addLine('  including SWC, CWE, and OWASP guidelines.');

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
    addLine('No specific issues found. Keep following security best practices and monitor your contract regularly.');
  }

  // ============================================================================
  // AUDIT CONCLUSION
  // ============================================================================
  addSection('AUDIT CONCLUSION');
  
  if (result.vulnerabilities.length > 0) {
    const criticalCount = result.statistics.critical;
    const highCount = result.statistics.high;
    addLine(`This audit identified ${criticalCount} critical and ${highCount} high-severity vulnerabilities`);
    addLine('requiring immediate remediation before production deployment. Addressing these security');
    addLine('issues will substantially improve the contract\'s overall security posture.');
  } else {
    addLine('The automated analysis did not identify significant vulnerabilities in the provided contract.');
    addLine('However, comprehensive manual security review is recommended before production deployment.');
  }

  // ============================================================================
  // DISCLAIMER & IMPORTANT NOTICE
  // ============================================================================
  addSection('DISCLAIMER & IMPORTANT NOTICE');
  addLine();
  addLine('AUDIT SCOPE AND LIMITATIONS:');
  addLine('This automated security assessment evaluates the provided contract source code at the');
  addLine('time of analysis. Automated analysis may not identify all vulnerabilities, particularly');
  addLine('complex business logic flaws or context-dependent security issues.');
  addLine();
  addLine('RECOMMENDATIONS FOR REPORT USAGE:');
  addBullet('This report should not be construed as financial, legal, or investment advice.');
  addSpacing(1);
  addBullet('Each identified finding requires careful review and comprehensive testing of remediation');
  addLine('  before production deployment.');
  addSpacing(1);
  addBullet('For contracts intended for production, professional security audit from specialized');
  addLine('  smart contract security firms is strongly recommended.');
  addSpacing(1);
  addBullet('This automated assessment constitutes one component of comprehensive security evaluation');
  addLine('  and should not be used as the sole security validation mechanism.');
  addLine();
  addLine('KEEP THIS PRIVATE:');
  addLine('This report contains sensitive security details. Only share it with people who');
  addLine('need to see it.');

  // ============================================================================
  // FOOTER
  // ============================================================================

  return lines.join('\n');
}
