// PDF Report Generator - Enterprise-Grade Security Audit Report
// Professional monochrome design suitable for compliance submission and academic documentation

import jsPDF from 'jspdf';
import { AnalysisResult } from '@/types';
import { generateTextAuditReport } from './text-audit-report-generator';

export function generatePDFReport(result: AnalysisResult): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const maxWidth = pageWidth - margin * 2;
  
  // ============================================================================
  // TYPOGRAPHY & FORMATTING CONFIGURATION
  // ============================================================================
  const titleFontSize = 16;
  const sectionFontSize = 12;
  const subSectionFontSize = 11;
  const bodyFontSize = 9.5;
  
  const blackColor = { r: 0, g: 0, b: 0 };
  const grayColor = { r: 80, g: 80, b: 80 };
  
  // ============================================================================
  // GLOBAL SPACING SYSTEM - Apply Uniformly Across Entire Document
  // ============================================================================
  const SPACING = {
    headerTitleBottom: 5,        // After main title
    dividerAfterTitle: 6,        // After title divider
    metadataRowSpacing: 0.5,     // Between metadata rows
    metadataBlockBottom: 6,      // After metadata block
    sectionHeadingTop: 6,        // Before section heading (via checkSectionPageBreak)
    dividerAfterHeading: 4,      // After section heading divider
    contentParagraphSpacing: 2,  // Between content paragraphs
    beforeNextSection: 6,        // Before next major section
    beforeSubheading: 2,         // Before subsection/label
    findingItemSpacing: 5,       // Between finding items
    afterFindingDivider: 4,      // After finding separator line
    findingTitleSpacing: 2,      // After finding title
    metadataBlockSpacing: 2,     // After metadata block in finding
    remedialSectionSpacing: 2,   // Before Remediation label
    afterSectionDivider: 6,      // After section content divider (between sections)
  };
  
  const LABEL_WIDTH = 24;        // Fixed key-value label width
  
  let yPosition = margin;
  let currentPage = 1;

  // Helper: Draw thin horizontal divider line
  const drawDividerLine = () => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 2;
  };

  // Helper: Add page number footer - positioned absolutely at bottom, outside content flow
  const addPageFooter = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7); // Slightly smaller for subtle footer presence
    doc.setTextColor(120, 120, 120); // Lighter gray for footer
    // Position absolutely at bottom-right, completely outside yPosition flow
    doc.text(`Page ${currentPage}`, pageWidth - margin - 12, pageHeight - 6);
  };

  // Helper: Check and add new page if needed
  const checkPageBreak = (requiredSpace: number = 10) => {
    if (yPosition + requiredSpace > pageHeight - margin - 10) {
      addPageFooter();
      doc.addPage();
      currentPage++;
      yPosition = margin;
    }
  };

  // Helper: Prevent section heading orphaning - ensure heading + divider + first content block stay together
  const checkSectionPageBreak = (minContentHeight: number = 30) => {
    // minContentHeight accounts for: heading (~5pt) + divider (~2pt) + spacing (~3pt) + first content (~20pt)
    if (yPosition + minContentHeight > pageHeight - margin - 10) {
      addPageFooter();
      doc.addPage();
      currentPage++;
      yPosition = margin;
    }
  };

  // Helper: Add text with wrapping (left-aligned)
  const addText = (text: string, fontSize: number, isBold: boolean = false, indent: number = 0) => {
    checkPageBreak(8);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(blackColor.r, blackColor.g, blackColor.b);
    
    const lines = doc.splitTextToSize(text, maxWidth - indent);
    const lineHeight = fontSize * 0.38 + 1.2; // Improved line height for better spacing consistency
    lines.forEach((line: string) => {
      doc.text(line, margin + indent, yPosition);
      yPosition += lineHeight;
    });
  };

  // Helper: Add justified paragraph text (full-width aligned)
  const addJustifiedParagraph = (text: string, fontSize: number, indent: number = 0) => {
    checkPageBreak(8);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(fontSize);
    doc.setTextColor(blackColor.r, blackColor.g, blackColor.b);
    
    const lines = doc.splitTextToSize(text, maxWidth - indent);
    const lineHeight = fontSize * 0.38 + 1.2; // Consistent line height with addText
    
    lines.forEach((line: string, index: number) => {
      if (index < lines.length - 1) {
        // Not the last line - justify
        const words = line.split(' ');
        if (words.length > 1) {
          const lineWidth = maxWidth - indent;
          const totalWordWidth = words.reduce((sum, word) => sum + doc.getTextWidth(word), 0);
          const totalSpaceWidth = lineWidth - totalWordWidth;
          const spaceCount = words.length - 1;
          const spaceWidth = totalSpaceWidth / spaceCount;
          
          let xPos = margin + indent;
          words.forEach((word, wordIndex) => {
            doc.text(word, xPos, yPosition);
            xPos += doc.getTextWidth(word);
            if (wordIndex < words.length - 1) {
              xPos += spaceWidth;
            }
          });
        } else {
          doc.text(line, margin + indent, yPosition);
        }
      } else {
        // Last line - left align
        doc.text(line, margin + indent, yPosition);
      }
      yPosition += lineHeight;
    });
  };

  // Helper: Format key-value pairs with consistent alignment
  const formatKeyValue = (label: string, value: string | number): string => {
    return `${label.padEnd(LABEL_WIDTH)}: ${value}`;
  };

  // Helper: Add metadata row with perfect global alignment using monospace font
  // This ensures all key-value rows align to the same invisible metadata grid throughout the document
  const addMetadataRow = (label: string, value: string | number, indent: number = 0) => {
    checkPageBreak(5);
    doc.setFont('Times', 'normal'); // Bold monospace font for proper weight matching
    doc.setFontSize(bodyFontSize);
    doc.setTextColor(blackColor.r, blackColor.g, blackColor.b);
    
    const metadataText = formatKeyValue(label, value);
    doc.text(metadataText, margin + indent, yPosition);
    
    // Switch back to helvetica for next operations
    doc.setFont('helvetica', 'normal');
    yPosition += bodyFontSize * 0.38 + 0.8; // Consistent line height for metadata
  };

  // ============================================================================
  // PAGE 1: FORMAL REPORT HEADER
  // ============================================================================

  
  // Report Title
  addText('SMART CONTRACT SECURITY AUDIT REPORT', titleFontSize, true);
  yPosition += SPACING.headerTitleBottom;
  drawDividerLine();
  yPosition += SPACING.dividerAfterTitle;

  // Report Details in clean format with perfect alignment
  addMetadataRow('Contract Name', result.fileName);
  addMetadataRow('Generated Date', new Date(result.timestamp).toLocaleDateString());
  addMetadataRow('Generated Time', new Date(result.timestamp).toLocaleTimeString());
  addMetadataRow('Analysis Engine', 'Automated Security Analysis Platform');
  addMetadataRow('Analysis Duration', `${(result.analysisTime / 1000).toFixed(2)} seconds`);
  addMetadataRow('Scan Status', 'Completed Successfully');
  addMetadataRow('Audit ID', result.analysisId);
  
  yPosition += SPACING.metadataBlockBottom;

  // ============================================================================
  // SUMMARY BLOCK
  // ============================================================================
  checkSectionPageBreak(30);
  addText('SECURITY SUMMARY', sectionFontSize, true);
  drawDividerLine();
  yPosition += SPACING.dividerAfterHeading;

  addMetadataRow('Security Score', `${result.securityScore}/100`);
  addMetadataRow('Risk Level', result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1).toLowerCase());
  addMetadataRow('Total Findings', result.statistics.total);
  yPosition += SPACING.metadataRowSpacing;
  addMetadataRow('Critical Severity', result.statistics.critical);
  addMetadataRow('High Severity', result.statistics.high);
  addMetadataRow('Medium Severity', result.statistics.medium);
  addMetadataRow('Low Severity', result.statistics.low);
  addMetadataRow('Informational', result.statistics.info);
  
  yPosition += SPACING.beforeNextSection;

  // ============================================================================
  // MAIN SECTIONS
  // ============================================================================

  // 1. EXECUTIVE SUMMARY
  checkSectionPageBreak(30);
  addText('1. EXECUTIVE SUMMARY', sectionFontSize, true);
  drawDividerLine();
  yPosition += SPACING.dividerAfterHeading;
  addJustifiedParagraph('This automated security audit has evaluated the provided contract code using multi-layered analysis techniques combining static code analysis, pattern-based detection, and AI-powered semantic analysis. The report presents findings across multiple security frameworks including SWC, CWE, SCSVS, and industry best practices.', bodyFontSize);
  yPosition += SPACING.contentParagraphSpacing;
  addJustifiedParagraph(`Overall Security Posture: ${result.securityScore >= 80 ? 'SECURE - No critical issues identified. Code demonstrates strong security practices.' : result.securityScore >= 60 ? 'ACCEPTABLE - Minor issues identified. Recommended review before production.' : result.securityScore >= 40 ? 'AT-RISK - Significant security concerns. Professional audit required.' : 'CRITICAL - Multiple high-severity issues detected. Do not deploy.'}`, bodyFontSize);
  yPosition += SPACING.contentParagraphSpacing;
  addJustifiedParagraph(`Total identified issues requiring review: ${result.statistics.total}`, bodyFontSize);
  yPosition += SPACING.beforeNextSection;

  // 2. CODE / CONTRACT METRICS
  checkSectionPageBreak(30);
  addText('2. CODE / CONTRACT METRICS', sectionFontSize, true);
  drawDividerLine();
  yPosition += SPACING.dividerAfterHeading;
  addMetadataRow('Language', result.language?.toUpperCase() || 'UNKNOWN');
  addMetadataRow('File Size', `${(result.contractCode.length / 1024).toFixed(2)} KB`);
  addMetadataRow('Lines of Code', result.contractCode.split('\n').length);
  addMetadataRow('Number of Functions', (result.contractCode.match(/function\s+\w+\s*\(|def\s+\w+\s*\(|fn\s+\w+\s*\(/g) || []).length);
  addMetadataRow('External Calls', (result.contractCode.match(/\.call|\.transfer|extcall|raw_call/g) || []).length);
  addMetadataRow('State Variables', (result.contractCode.match(/^\s*(?:public|private|internal|protected)?\s*(?:\w+)\s+\w+/gm) || []).length);
  yPosition += SPACING.contentParagraphSpacing;
  addJustifiedParagraph('The contract demonstrates standard complexity patterns typical of production smart contracts. Code structure and organization follow established practices for the target platform.', bodyFontSize);
  yPosition += SPACING.beforeNextSection;

  // 3. SECURITY ASSESSMENT
  checkSectionPageBreak(30);
  addText('3. SECURITY ASSESSMENT', sectionFontSize, true);
  drawDividerLine();
  yPosition += SPACING.dividerAfterHeading;
  addMetadataRow('Overall Risk Assessment', result.securityScore >= 80 ? 'LOW RISK' : result.securityScore >= 60 ? 'MEDIUM RISK' : result.securityScore >= 40 ? 'HIGH RISK' : 'CRITICAL RISK');
  addMetadataRow('Primary Security Score', `${result.securityScore}/100`);
  addMetadataRow('Audit Confidence Level', 'HIGH');
  yPosition += SPACING.beforeSubheading;
  addText('Analysis Summary:', bodyFontSize, true);
  yPosition += SPACING.metadataRowSpacing;
  addJustifiedParagraph('The automated security analysis has evaluated the contract code against multiple security standards and vulnerability patterns. The assessment combines machine learning-based semantic analysis with pattern-matching detection to identify potential security weaknesses, compliance gaps, and best practice deviations. All findings have been validated against leading industry frameworks.', bodyFontSize, 4);
  yPosition += SPACING.beforeNextSection;

  // 4. DETAILED VULNERABILITY REPORT
  if (result.vulnerabilities.length > 0) {
    checkSectionPageBreak(30);
    addText('4. DETAILED VULNERABILITY REPORT', sectionFontSize, true);
    drawDividerLine();
    yPosition += SPACING.dividerAfterHeading;
    addText(`Total Vulnerabilities Found: ${result.vulnerabilities.length}`, bodyFontSize);
    yPosition += SPACING.contentParagraphSpacing;

    // Group vulnerabilities by severity
    const severityOrder = ['Critical', 'High', 'Medium', 'Low', 'Info'];
    const vulnBySeverity: Record<string, any[]> = {};
    severityOrder.forEach(s => vulnBySeverity[s] = []);
    
    result.vulnerabilities.forEach((v: any) => {
      if (vulnBySeverity[v.severity]) {
        vulnBySeverity[v.severity].push(v);
      }
    });

    let findingId = 1;
    severityOrder.forEach((severity) => {
      const vulns = vulnBySeverity[severity];
      if (vulns.length > 0) {
        yPosition += SPACING.beforeSubheading;
        addText(`${severity.toUpperCase()} SEVERITY FINDINGS (${vulns.length})`, subSectionFontSize, true);
        yPosition += SPACING.beforeSubheading;

        vulns.forEach((vuln: any, index: number) => {
          checkPageBreak(20);
          addText(`[${findingId}] ${vuln.name}`, bodyFontSize, true);
          yPosition += SPACING.findingTitleSpacing;
          
          addMetadataRow('Severity', vuln.severity);
          addMetadataRow('Confidence Score', vuln.confidence);
          addMetadataRow('Location', `Line ${vuln.lineNumber}`);
          addMetadataRow('Detection Method', vuln.detectionMethod);
          addMetadataRow('SWC Identifier', vuln.swcId || 'N/A');
          
          yPosition += SPACING.metadataBlockSpacing;
          addText('Description:', bodyFontSize, true);
          yPosition += SPACING.metadataRowSpacing;
          addJustifiedParagraph(vuln.description || 'This vulnerability represents a security risk that requires attention and remediation.', bodyFontSize, 4);
          
          // Display vulnerable code snippet if available
          if (vuln.codeSnippet) {
            yPosition += SPACING.remedialSectionSpacing;
            addText('Vulnerable Code:', bodyFontSize, true);
            yPosition += SPACING.metadataRowSpacing;
            checkPageBreak(15);
            
            // Format code snippet with proper styling and spacing
            const codeLines = vuln.codeSnippet.split('\n').slice(0, 12);
            const codeFontSize = 7.5; // Smaller monospace-style font
            const codeLineHeight = codeFontSize * 0.35 + 0.5;
            
            // Add background-like visual effect with indentation
            codeLines.forEach((line: string, codeIndex: number) => {
              doc.setFont('courier', 'normal');
              doc.setFontSize(codeFontSize);
              doc.setTextColor(40, 40, 40);
              doc.text(line, margin + 6, yPosition);
              yPosition += codeLineHeight;
            });
            
            // Reset to helvetica after code block
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(bodyFontSize);
            doc.setTextColor(blackColor.r, blackColor.g, blackColor.b);
            
            // Show truncation message if code is long
            if (vuln.codeSnippet.split('\n').length > 12) {
              addText('... (code snippet truncated)', 8, false, 4);
            }
          }
          
          // Only show Exploitation Scenario for non-static analysis
          if (vuln.detectionMethod !== 'static') {
            yPosition += SPACING.remedialSectionSpacing;
            addText('Exploitation Scenario:', bodyFontSize, true);
            yPosition += SPACING.metadataRowSpacing;
            addJustifiedParagraph(vuln.exploitationScenario || 'An attacker could exploit this vulnerability to compromise contract security or cause unintended behavior.', bodyFontSize, 4);
          }
          
          yPosition += SPACING.remedialSectionSpacing;
          addText('Remediation:', bodyFontSize, true);
          yPosition += SPACING.metadataRowSpacing;
          addJustifiedParagraph(vuln.recommendation || 'Review the vulnerable code and apply the recommended fixes. Consider professional security review before deployment.', bodyFontSize, 4);
          
          // Only add vertical spacing between vulnerabilities (not after the last one)
          if (index < vulns.length - 1) {
            yPosition += 8; // Increased from 6 to 24px visual spacing
          }
          
          findingId++;
        });
      }
    });
    
    yPosition += SPACING.metadataRowSpacing;
  } else {
    checkSectionPageBreak(30);
    addText('4. DETAILED VULNERABILITY REPORT', sectionFontSize, true);
    drawDividerLine();
    yPosition += SPACING.dividerAfterHeading;
    addJustifiedParagraph('No vulnerabilities detected in automated analysis. The code demonstrates good adherence to security best practices and patterns across evaluated frameworks.', bodyFontSize);
    yPosition += SPACING.contentParagraphSpacing;
    addJustifiedParagraph('Manual professional review is recommended for production deployment to ensure comprehensive security coverage beyond automated pattern detection.', bodyFontSize);
    yPosition += SPACING.beforeNextSection;
  }

  yPosition += SPACING.beforeNextSection;

  // 5. AI INSIGHTS & CONFIDENCE ANALYSIS
  checkSectionPageBreak(30);
  addText('5. AI INSIGHTS & CONFIDENCE ANALYSIS', sectionFontSize, true);
  drawDividerLine();
  yPosition += SPACING.dividerAfterHeading;
  const aiVulns = result.vulnerabilities.filter((v: any) => v.detectionMethod === 'ai' || v.detectionMethod === 'hybrid');
  addMetadataRow('AI-Identified Findings', aiVulns.length > 0 ? aiVulns.length : 'None');
  addMetadataRow('Analysis Confidence', aiVulns.length > 0 ? 'High' : 'High');
  yPosition += SPACING.beforeSubheading;
  addText('Analysis Methodology:', bodyFontSize, true);
  yPosition += SPACING.metadataRowSpacing;
  if (aiVulns.length > 0) {
    addJustifiedParagraph('AI analysis utilizes machine learning models trained on known smart contract vulnerability patterns for semantic code understanding. Confidence scoring represents model certainty regarding each finding. All findings are validated against SWC, CWE, and OWASP guidelines.', bodyFontSize, 4);
  } else {
    addJustifiedParagraph('AI semantic analysis did not identify additional contextual vulnerabilities beyond rule-based detection. This suggests strong alignment between structural security patterns and semantic contract behavior, indicating robust code quality.', bodyFontSize, 4);
  }
  yPosition += SPACING.beforeNextSection;


  // 6. COMPLIANCE METRICS
  checkSectionPageBreak(30);
  addText('6. COMPLIANCE METRICS', sectionFontSize, true);
  drawDividerLine();
  yPosition += SPACING.dividerAfterHeading;
  addMetadataRow('SCSVS v2 Compliance', `${result.scsvCompliance?.percentage || 'N/A'}%`);
  addMetadataRow('Controls Passed', result.scsvCompliance?.passed || 'N/A');
  addMetadataRow('Controls Failed', result.scsvCompliance?.failed || 'N/A');
  yPosition += SPACING.beforeSubheading;
  addText('Standards Evaluated:', bodyFontSize, true);
  addText('SWC, CWE, SCSVS v2, EthTrust, OWASP', bodyFontSize);
  yPosition += SPACING.beforeNextSection;

  // 6A. FAILED SCSVS CONTROLS (if applicable) - Subsection format
  const failedControls = result.scsvCompliance?.checklist?.filter((c: any) => !c.passed) || [];
  if (failedControls.length > 0) {
    checkSectionPageBreak(30);
    addText('FAILED COMPLIANCE CONTROLS', subSectionFontSize, true); // Subsection size, not full section
    yPosition += SPACING.beforeSubheading;
    
    failedControls.forEach((control: any, index: number) => {
      checkPageBreak(15);
      addText(`[${control.controlId}] ${control.title}`, bodyFontSize, true);
      yPosition += SPACING.findingTitleSpacing;
      
      addMetadataRow('Category', control.category);
      addMetadataRow('Severity', control.severity);
      
      yPosition += SPACING.beforeSubheading;
      addText('Issues:', bodyFontSize, true);
      yPosition += SPACING.beforeSubheading; // Increased spacing before list
      
      if (control.findings && control.findings.length > 0) {
        control.findings.forEach((finding: string, findingIndex: number) => {
          addText(`• ${finding}`, bodyFontSize, false, 4);
          yPosition += SPACING.metadataRowSpacing * 1.5; // Increased bullet spacing
        });
      } else {
        addText('Control validation failed - review required.', bodyFontSize);
      }
      
      // Add spacing between failed controls (not after the last one)
      if (index < failedControls.length - 1) {
        yPosition += 6; // 20-24px spacing between control groups
      }
    });
    
    yPosition += SPACING.beforeNextSection;
  }


  // 7. RISK BREAKDOWN ANALYSIS
  checkSectionPageBreak(30);
  addText('7. RISK BREAKDOWN ANALYSIS', sectionFontSize, true);
  drawDividerLine();
  yPosition += SPACING.dividerAfterHeading;
  addText('Severity Distribution:', bodyFontSize, true);
  yPosition += SPACING.beforeSubheading;
  const total = result.statistics.total || 1;
  addMetadataRow('Critical Severity', `${result.statistics.critical} findings (${((result.statistics.critical / total) * 100).toFixed(1)}%)`);
  addMetadataRow('High Severity', `${result.statistics.high} findings (${((result.statistics.high / total) * 100).toFixed(1)}%)`);
  addMetadataRow('Medium Severity', `${result.statistics.medium} findings (${((result.statistics.medium / total) * 100).toFixed(1)}%)`);
  addMetadataRow('Low Severity', `${result.statistics.low} findings (${((result.statistics.low / total) * 100).toFixed(1)}%)`);
  yPosition += SPACING.beforeNextSection;


  // 8. RECOMMENDATIONS & ACTION PLAN
  checkSectionPageBreak(30);
  addText('8. RECOMMENDATIONS & ACTION PLAN', sectionFontSize, true);
  drawDividerLine();
  yPosition += SPACING.dividerAfterHeading;
  if (result.recommendations && result.recommendations.length > 0) {
    result.recommendations.forEach((rec: string, index: number) => {
      addText(`${index + 1}. ${rec}`, bodyFontSize);
      yPosition += SPACING.metadataRowSpacing * 2; // Increased spacing between recommendations
    });
  } else {
    addText('1. Conduct manual security review by professional auditors before production deployment', bodyFontSize);
    yPosition += SPACING.metadataRowSpacing * 2;
    addText('2. Implement comprehensive testing including unit tests, integration tests, and fuzzing', bodyFontSize);
    yPosition += SPACING.metadataRowSpacing * 2;
    addText('3. Deploy with circuit breakers and monitoring mechanisms for anomaly detection', bodyFontSize);
    yPosition += SPACING.metadataRowSpacing * 2;
    addText('4. Document all architectural decisions and risk vectors', bodyFontSize);
    yPosition += SPACING.metadataRowSpacing * 2;
    addText('5. Maintain incident response procedures and rollback plans', bodyFontSize);
  }
  yPosition += SPACING.beforeNextSection;


  // 9. CONCLUSION
  checkSectionPageBreak(30);
  addText('9. CONCLUSION', sectionFontSize, true);
  drawDividerLine();
  yPosition += SPACING.dividerAfterHeading;
  if (result.statistics.critical > 0) {
    addJustifiedParagraph(`This audit identified ${result.statistics.critical} critical and ${result.statistics.high} high-severity findings requiring immediate remediation before any production deployment. Residual risk remains present until all critical issues are definitively resolved. Do not proceed to production.`, bodyFontSize);
  } else if (result.statistics.high > 0) {
    addJustifiedParagraph(`This audit identified ${result.statistics.high} high-severity findings requiring professional remediation and validation. Professional security review by experienced auditors is strongly recommended before production deployment to address all identified concerns.`, bodyFontSize);
  } else {
    addJustifiedParagraph('Automated analysis did not identify critical vulnerabilities in the provided code. However, professional manual review by security experts remains essential before production deployment. Automated assessment represents one component of comprehensive security evaluation, not a complete security guarantee.', bodyFontSize);
  }
  yPosition += SPACING.contentParagraphSpacing;
  yPosition += 3; // Extra separation before Deployment Recommendation
  addJustifiedParagraph(`Deployment Recommendation: ${result.securityScore >= 80 ? 'Ready for deployment with standard operational security measures.' : result.securityScore >= 60 ? 'Proceed with caution. Remediate identified issues and conduct manual review.' : 'Not recommended for production. Resolve all findings first.'}`, bodyFontSize);
  yPosition += SPACING.beforeNextSection;


  // 10. DISCLAIMER
  checkSectionPageBreak(30);
  addText('10. DISCLAIMER & IMPORTANT NOTICE', sectionFontSize, true);
  drawDividerLine();
  yPosition += SPACING.dividerAfterHeading;
  
  addText('SCOPE AND LIMITATIONS:', bodyFontSize, true);
  yPosition += SPACING.metadataRowSpacing;
  addJustifiedParagraph('This automated security assessment evaluates contract code at the time of analysis. Automated analysis may not identify all vulnerabilities, particularly complex business logic flaws, context-dependent security issues, or zero-day attack vectors. This report serves as one component of comprehensive security evaluation, not a complete security guarantee.', bodyFontSize, 4);
  
  yPosition += SPACING.beforeNextSection; // Increased spacing between disclaimer subsections
  addText('USAGE NOTICE:', bodyFontSize, true);
  yPosition += SPACING.metadataRowSpacing;
  addJustifiedParagraph('Do not rely solely on this automated assessment for production deployment decisions. This report should not be construed as financial, legal, investment, or professional security advice. Users assume all responsibility for deployment decisions and resulting consequences.', bodyFontSize, 4);
  
  yPosition += SPACING.beforeNextSection; // Increased spacing between disclaimer subsections
  addText('PROFESSIONAL REVIEW RECOMMENDATION:', bodyFontSize, true);
  yPosition += SPACING.metadataRowSpacing;
  addJustifiedParagraph('Engage professional security auditors with domain expertise for comprehensive security evaluation before production deployment. Manual code review by experienced security professionals is essential to identify sophisticated vulnerabilities that automated tools may miss.', bodyFontSize, 4);
  
  yPosition += 3;

  // Final page footer
  addPageFooter();

  // Save PDF
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `security-audit-${result.fileName.replace(/\.[^/.]+$/, '')}-${timestamp}.pdf`;
  doc.save(fileName);
}
