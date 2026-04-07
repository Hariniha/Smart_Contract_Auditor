// PDF Report Generator

import jsPDF from 'jspdf';
import { AnalysisResult } from '@/types';
import { getEthTrustLevelDefinition } from './ethtrust';
import { getSWCById } from './swc-registry';

export function generatePDFReport(result: AnalysisResult): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add new page if needed
  const checkAndAddPage = (requiredSpace = 20) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Helper function to add text with wrapping
  const addWrappedText = (text: string, x: number, maxWidth: number, fontSize = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      checkAndAddPage();
      doc.text(line, x, yPosition);
      yPosition += fontSize * 0.5;
    });
  };

  // Title with gradient effect simulation
  doc.setFillColor(239, 246, 255); // Light blue background
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setFontSize(26);
  doc.setTextColor(37, 99, 235); // Blue
  doc.setFont('helvetica', 'bold');
  doc.text('SMART CONTRACT SECURITY AUDIT', pageWidth / 2, yPosition, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Comprehensive Security Analysis Report', pageWidth / 2, yPosition + 6, { align: 'center' });
  yPosition += 20;

  // Contract Info with styled box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(20, yPosition, pageWidth - 40, 22, 2, 2, 'FD');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`📄 File: ${result.fileName}`, 25, yPosition + 6);
  doc.text(`📅 Analysis Date: ${new Date(result.timestamp).toLocaleString()}`, 25, yPosition + 12);
  doc.text(`🔑 Analysis ID: ${result.analysisId}`, 25, yPosition + 18);
  yPosition += 28;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;

  // === EXECUTIVE SUMMARY ===
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Executive Summary', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  yPosition += 12;

  // Security Score Box with enhanced styling
  const scoreColor: [number, number, number] = result.securityScore >= 80 ? [34, 197, 94] : result.securityScore >= 60 ? [234, 179, 8] : result.securityScore >= 40 ? [251, 146, 60] : [239, 68, 68];
  const scoreBgColor: [number, number, number] = result.securityScore >= 80 ? [240, 253, 244] : result.securityScore >= 60 ? [254, 252, 232] : result.securityScore >= 40 ? [255, 247, 237] : [254, 242, 242];
  
  doc.setFillColor(scoreBgColor[0], scoreBgColor[1], scoreBgColor[2]);
  doc.setDrawColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, yPosition, 85, 40, 4, 4, 'FD');
  doc.setLineWidth(0.2);
  
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text('Security Score', 30, yPosition + 10);
  doc.setFontSize(32);
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`${result.securityScore}`, 62, yPosition + 28, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('/100', 72, yPosition + 28);

  // Risk Level Box with enhanced styling
  const riskColor: [number, number, number] = result.riskLevel === 'Critical' ? [220, 38, 38] : result.riskLevel === 'High' ? [245, 158, 11] : result.riskLevel === 'Medium' ? [234, 179, 8] : [34, 197, 94];
  const riskBgColor: [number, number, number] = result.riskLevel === 'Critical' ? [254, 242, 242] : result.riskLevel === 'High' ? [255, 247, 237] : result.riskLevel === 'Medium' ? [254, 252, 232] : [240, 253, 244];
  
  doc.setFillColor(riskBgColor[0], riskBgColor[1], riskBgColor[2]);
  doc.setDrawColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(110, yPosition, 80, 40, 4, 4, 'FD');
  doc.setLineWidth(0.2);
  
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text('Risk Assessment', 120, yPosition + 10);
  doc.setFontSize(18);
  doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(result.riskLevel.toUpperCase(), 150, yPosition + 26, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  yPosition += 50;

  // EthTrust Level with enhanced styling
  const ethTrustDef = getEthTrustLevelDefinition(result.ethTrustLevel);
  const ethTrustColor: [number, number, number] = result.ethTrustLevel >= 4 ? [34, 197, 94] : result.ethTrustLevel >= 3 ? [234, 179, 8] : [239, 68, 68];
  const ethTrustBgColor: [number, number, number] = result.ethTrustLevel >= 4 ? [240, 253, 244] : result.ethTrustLevel >= 3 ? [254, 252, 232] : [254, 242, 242];
  
  doc.setFillColor(ethTrustBgColor[0], ethTrustBgColor[1], ethTrustBgColor[2]);
  doc.setDrawColor(ethTrustColor[0], ethTrustColor[1], ethTrustColor[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, yPosition, pageWidth - 40, 35, 4, 4, 'FD');
  doc.setLineWidth(0.2);
  
  doc.setFontSize(13);
  doc.setTextColor(ethTrustColor[0], ethTrustColor[1], ethTrustColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`EthTrust Security Level: ${ethTrustDef.level}`, 30, yPosition + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`${ethTrustDef.name} - ${ethTrustDef.risk}`, 30, yPosition + 18);
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  const descLines = doc.splitTextToSize(ethTrustDef.description, pageWidth - 60);
  doc.text(descLines[0], 30, yPosition + 26);
  yPosition += 45;

  // === VULNERABILITY STATISTICS ===
  checkAndAddPage(60);
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Vulnerability Analysis', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  yPosition += 12;

  const stats = [
    { label: 'Total Issues', count: result.statistics.total, color: [71, 85, 105], bgColor: [248, 250, 252] },
    { label: 'Critical', count: result.statistics.critical, color: [220, 38, 38], bgColor: [254, 242, 242] },
    { label: 'High', count: result.statistics.high, color: [245, 158, 11], bgColor: [255, 247, 237] },
    { label: 'Medium', count: result.statistics.medium, color: [234, 179, 8], bgColor: [254, 252, 232] },
    { label: 'Low', count: result.statistics.low, color: [59, 130, 246], bgColor: [239, 246, 255] },
    { label: 'Info', count: result.statistics.info, color: [107, 114, 128], bgColor: [249, 250, 251] }
  ];

  stats.forEach((stat, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = 20 + col * 57;
    const y = yPosition + row * 22;
    
    // Styled stat box
    doc.setFillColor(stat.bgColor[0], stat.bgColor[1], stat.bgColor[2]);
    doc.setDrawColor(stat.color[0], stat.color[1], stat.color[2]);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, 53, 18, 2, 2, 'FD');
    doc.setLineWidth(0.2);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(stat.label, x + 4, y + 6);
    
    doc.setFontSize(16);
    doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
    doc.setFont('helvetica', 'bold');
    doc.text(stat.count.toString(), x + 45, y + 13, { align: 'right' });
    doc.setFont('helvetica', 'normal');
  });
  yPosition += 50;

  // === SCSVS COMPLIANCE ===
  checkAndAddPage(40);
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('SCSVS v2 Compliance', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  yPosition += 12;

  const complianceColor: [number, number, number] = result.scsvCompliance.percentage >= 90 ? [34, 197, 94] : result.scsvCompliance.percentage >= 70 ? [234, 179, 8] : [239, 68, 68];
  const complianceBg: [number, number, number] = result.scsvCompliance.percentage >= 90 ? [240, 253, 244] : result.scsvCompliance.percentage >= 70 ? [254, 252, 232] : [254, 242, 242];
  
  doc.setFillColor(complianceBg[0], complianceBg[1], complianceBg[2]);
  doc.setDrawColor(complianceColor[0], complianceColor[1], complianceColor[2]);
  doc.setLineWidth(0.5);
  doc.roundedRect(20, yPosition, pageWidth - 40, 28, 4, 4, 'FD');
  doc.setLineWidth(0.2);
  
  doc.setFontSize(12);
  doc.setTextColor(complianceColor[0], complianceColor[1], complianceColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`${result.scsvCompliance.percentage}% Compliant`, 30, yPosition + 10);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Passed: ${result.scsvCompliance.passed} checks | Failed: ${result.scsvCompliance.failed} checks`, 30, yPosition + 18);
  
  // Enhanced progress bar
  const barWidth = pageWidth - 60;
  const barX = 30;
  const barY = yPosition + 22;
  doc.setFillColor(229, 231, 235);
  doc.roundedRect(barX, barY, barWidth, 4, 2, 2, 'F');
  doc.setFillColor(complianceColor[0], complianceColor[1], complianceColor[2]);
  doc.roundedRect(barX, barY, (barWidth * result.scsvCompliance.percentage) / 100, 4, 2, 2, 'F');
  yPosition += 38;

  // === VULNERABILITIES DETAIL ===
  if (result.vulnerabilities.length > 0) {
    checkAndAddPage(50);
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Vulnerability Report', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`${result.vulnerabilities.length} issue${result.vulnerabilities.length > 1 ? 's' : ''} detected and analyzed`, 20, yPosition + 6);
    yPosition += 15;

    // Group by severity
    const criticalVulns = result.vulnerabilities.filter(v => v.severity === 'Critical');
    const highVulns = result.vulnerabilities.filter(v => v.severity === 'High');
    const mediumVulns = result.vulnerabilities.filter(v => v.severity === 'Medium');
    const lowVulns = result.vulnerabilities.filter(v => v.severity === 'Low');

    const vulnGroups = [
      { label: 'Critical Vulnerabilities', vulns: criticalVulns, color: [220, 38, 38] },
      { label: 'High Severity Vulnerabilities', vulns: highVulns, color: [245, 158, 11] },
      { label: 'Medium Severity Vulnerabilities', vulns: mediumVulns, color: [234, 179, 8] },
      { label: 'Low Severity Vulnerabilities', vulns: lowVulns, color: [59, 130, 246] }
    ];

    vulnGroups.forEach(group => {
      if (group.vulns.length > 0) {
        checkAndAddPage(30);
        
        const isCritical = group.label.includes('Critical');
        
        // Section header with colored background
        if (isCritical) {
          doc.setFillColor(254, 242, 242); // Light red background for critical
          doc.roundedRect(20, yPosition - 2, pageWidth - 40, 12, 2, 2, 'F');
        }
        
        doc.setFontSize(14);
        doc.setTextColor(group.color[0], group.color[1], group.color[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(`${group.label} (${group.vulns.length})`, 25, yPosition + 6);
        doc.setFont('helvetica', 'normal');
        yPosition += 15;

        group.vulns.forEach((vuln, index) => {
          checkAndAddPage(55);
          
          // Vulnerability box with colored border for critical
          const boxHeight = 50;
          
          if (isCritical) {
            // Red border and light red background for critical
            doc.setFillColor(254, 242, 242);
            doc.setDrawColor(220, 38, 38);
            doc.setLineWidth(0.8);
            doc.roundedRect(20, yPosition, pageWidth - 40, boxHeight, 3, 3, 'FD');
            doc.setLineWidth(0.2);
          } else {
            // Standard styling for non-critical
            doc.setFillColor(249, 250, 251);
            doc.setDrawColor(209, 213, 219);
            doc.roundedRect(20, yPosition, pageWidth - 40, boxHeight, 3, 3, 'FD');
          }
          
          // Severity badge
          const badgeWidth = 18;
          const badgeHeight = 6;
          doc.setFillColor(group.color[0], group.color[1], group.color[2]);
          doc.roundedRect(25, yPosition + 4, badgeWidth, badgeHeight, 1, 1, 'F');
          doc.setFontSize(7);
          doc.setTextColor(255, 255, 255);
          doc.text(vuln.severity.toUpperCase(), 25 + badgeWidth/2, yPosition + 7.5, { align: 'center' });
          
          // Title
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          doc.setFont('helvetica', 'bold');
          doc.text(`${vuln.name}`, 46, yPosition + 8);
          doc.setFont('helvetica', 'normal');
          
          // Metadata
          doc.setFontSize(8);
          doc.setTextColor(107, 114, 128);
          doc.text(`${vuln.swcId} • Line ${vuln.lineNumber} • Detected by ${vuln.detectionMethod}`, 25, yPosition + 15);
          
          // Description
          doc.setFontSize(9);
          doc.setTextColor(55, 65, 81);
          const descLines = doc.splitTextToSize(vuln.description.substring(0, 200), pageWidth - 50);
          doc.text(descLines.slice(0, 2), 25, yPosition + 22);
          
          // Recommendation with icon
          doc.setFontSize(8);
          doc.setTextColor(16, 185, 129);
          doc.setFont('helvetica', 'bold');
          doc.text('✓ RECOMMENDED FIX:', 25, yPosition + 37);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          const recLines = doc.splitTextToSize(vuln.recommendation.substring(0, 150), pageWidth - 50);
          doc.text(recLines[0], 25, yPosition + 43);
          
          yPosition += boxHeight + 6;
        });
        
        yPosition += 8;
      }
    });
  } else {
    checkAndAddPage(40);
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Vulnerability Report', 20, yPosition);
    yPosition += 10;
    
    // Success box
    doc.setFillColor(240, 253, 244); // Light green background
    doc.setDrawColor(34, 197, 94); // Green border
    doc.setLineWidth(0.5);
    doc.roundedRect(20, yPosition, pageWidth - 40, 30, 3, 3, 'FD');
    
    // Success icon and text
    doc.setFontSize(14);
    doc.setTextColor(22, 163, 74);
    doc.setFont('helvetica', 'bold');
    doc.text('✓ No Vulnerabilities Detected', 30, yPosition + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(21, 128, 61);
    doc.text('This smart contract passed all security checks with no issues found.', 30, yPosition + 21);
    
    yPosition += 35;
  }

  // === RECOMMENDATIONS ===
  checkAndAddPage(50);
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('Security Recommendations', 20, yPosition);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Best practices to enhance smart contract security', 20, yPosition + 6);
  yPosition += 15;

  result.recommendations.forEach((rec, index) => {
    const estimatedHeight = Math.ceil(rec.length / 90) * 6 + 12;
    checkAndAddPage(estimatedHeight);
    
    // Recommendation box
    const boxStartY = yPosition;
    doc.setFillColor(249, 250, 251); // Light gray background
    doc.setDrawColor(59, 130, 246); // Blue border
    doc.setLineWidth(0.3);
    
    // Calculate box height
    const recLines = doc.splitTextToSize(rec, pageWidth - 60);
    const boxHeight = recLines.length * 5 + 8;
    doc.roundedRect(20, yPosition, pageWidth - 40, boxHeight, 2, 2, 'FD');
    
    // Number badge
    doc.setFillColor(59, 130, 246);
    doc.circle(28, yPosition + 6, 3, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}`, 28, yPosition + 7, { align: 'center' });
    
    // Recommendation text
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    recLines.forEach((line: string, lineIndex: number) => {
      doc.text(line, 35, yPosition + 7 + (lineIndex * 5));
    });
    
    yPosition += boxHeight + 4;
  });

  // === FOOTER ===
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer separator line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(20, pageHeight - 20, pageWidth - 20, pageHeight - 20);
    
    // Footer text
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    const footerText = `Generated by SmartAudit AI | Page ${i} of ${totalPages} | ${new Date().toLocaleDateString()}`;
    doc.text(footerText, pageWidth / 2, pageHeight - 12, { align: 'center' });
  }

  // Save the PDF
  const fileName = `security-report-${result.fileName.replace('.sol', '')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

