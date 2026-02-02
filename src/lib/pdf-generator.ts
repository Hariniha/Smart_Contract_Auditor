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

  // Title
  doc.setFontSize(24);
  doc.setTextColor(59, 130, 246); // Blue
  doc.text('Smart Contract Security Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Contract Info
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`File: ${result.fileName}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Analysis Date: ${new Date(result.timestamp).toLocaleString()}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Analysis ID: ${result.analysisId}`, 20, yPosition);
  yPosition += 12;

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 10;

  // === EXECUTIVE SUMMARY ===
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Executive Summary', 20, yPosition);
  yPosition += 10;

  // Security Score Box
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(20, yPosition, 80, 35, 3, 3, 'F');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Security Score', 25, yPosition + 8);
  doc.setFontSize(28);
  const scoreColor: [number, number, number] = result.securityScore >= 70 ? [34, 197, 94] : result.securityScore >= 50 ? [234, 179, 8] : [239, 68, 68];
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(`${result.securityScore}/100`, 35, yPosition + 25);

  // Risk Level Box
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(110, yPosition, 80, 35, 3, 3, 'F');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('Risk Level', 115, yPosition + 8);
  doc.setFontSize(16);
  const riskColor: [number, number, number] = result.riskLevel === 'Critical' ? [220, 38, 38] : result.riskLevel === 'High' ? [245, 158, 11] : result.riskLevel === 'Medium' ? [234, 179, 8] : [34, 197, 94];
  doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.text(result.riskLevel, 115, yPosition + 25);
  yPosition += 45;

  // EthTrust Level
  const ethTrustDef = getEthTrustLevelDefinition(result.ethTrustLevel);
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(20, yPosition, pageWidth - 40, 30, 3, 3, 'F');
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`EthTrust Security Level: ${ethTrustDef.level}`, 25, yPosition + 10);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(ethTrustDef.name, 25, yPosition + 17);
  doc.text(ethTrustDef.risk, 25, yPosition + 24);
  yPosition += 40;

  // === VULNERABILITY STATISTICS ===
  checkAndAddPage(50);
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Vulnerability Statistics', 20, yPosition);
  yPosition += 10;

  const stats = [
    { label: 'Total', count: result.statistics.total, color: [100, 100, 100] },
    { label: 'Critical', count: result.statistics.critical, color: [220, 38, 38] },
    { label: 'High', count: result.statistics.high, color: [245, 158, 11] },
    { label: 'Medium', count: result.statistics.medium, color: [234, 179, 8] },
    { label: 'Low', count: result.statistics.low, color: [59, 130, 246] },
    { label: 'Info', count: result.statistics.info, color: [107, 114, 128] }
  ];

  stats.forEach((stat, index) => {
    const x = 20 + (index % 3) * 60;
    const y = yPosition + Math.floor(index / 3) * 20;
    doc.setFontSize(10);
    doc.setTextColor(stat.color[0], stat.color[1], stat.color[2]);
    doc.text(`${stat.label}: ${stat.count}`, x, y);
  });
  yPosition += 45;

  // === SCSVS COMPLIANCE ===
  checkAndAddPage(30);
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('SCSVS v2 Compliance', 20, yPosition);
  yPosition += 10;

  doc.setFillColor(245, 245, 245);
  doc.roundedRect(20, yPosition, pageWidth - 40, 25, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Compliance Score: ${result.scsvCompliance.percentage}%`, 25, yPosition + 10);
  doc.text(`Passed: ${result.scsvCompliance.passed} | Failed: ${result.scsvCompliance.failed}`, 25, yPosition + 18);
  
  // Progress bar
  const barWidth = pageWidth - 50;
  const barX = 25;
  const barY = yPosition + 5;
  doc.setFillColor(220, 220, 220);
  doc.rect(barX, barY - 3, barWidth, 3, 'F');
  doc.setFillColor(34, 197, 94);
  doc.rect(barX, barY - 3, (barWidth * result.scsvCompliance.percentage) / 100, 3, 'F');
  yPosition += 35;

  // === VULNERABILITIES DETAIL ===
  if (result.vulnerabilities.length > 0) {
    checkAndAddPage(50);
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Vulnerabilities Detected', 20, yPosition);
    yPosition += 10;

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
        doc.setFontSize(14);
        doc.setTextColor(group.color[0], group.color[1], group.color[2]);
        doc.text(`${group.label} (${group.vulns.length})`, 20, yPosition);
        yPosition += 8;

        group.vulns.forEach((vuln, index) => {
          checkAndAddPage(40);
          
          // Vulnerability box
          const boxHeight = 35;
          doc.setDrawColor(200, 200, 200);
          doc.roundedRect(20, yPosition, pageWidth - 40, boxHeight, 2, 2);
          
          // Title
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          doc.text(`${index + 1}. ${vuln.name}`, 25, yPosition + 7);
          
          // Metadata
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          doc.text(`${vuln.swcId} | Line ${vuln.lineNumber} | ${vuln.detectionMethod}`, 25, yPosition + 13);
          
          // Description
          doc.setFontSize(9);
          doc.setTextColor(60, 60, 60);
          const descLines = doc.splitTextToSize(vuln.description.substring(0, 150) + '...', pageWidth - 50);
          doc.text(descLines[0], 25, yPosition + 20);
          
          // Recommendation snippet
          doc.setFontSize(8);
          doc.setTextColor(34, 197, 94);
          const recLines = doc.splitTextToSize('Fix: ' + vuln.recommendation.substring(0, 100) + '...', pageWidth - 50);
          doc.text(recLines[0], 25, yPosition + 28);
          
          yPosition += boxHeight + 5;
        });
        
        yPosition += 5;
      }
    });
  } else {
    checkAndAddPage(30);
    doc.setFontSize(14);
    doc.setTextColor(34, 197, 94);
    doc.text('✓ No vulnerabilities detected!', 20, yPosition);
    yPosition += 10;
  }

  // === RECOMMENDATIONS ===
  checkAndAddPage(50);
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('Recommendations', 20, yPosition);
  yPosition += 10;

  result.recommendations.forEach((rec, index) => {
    checkAndAddPage(15);
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const bullet = `${index + 1}.`;
    doc.text(bullet, 20, yPosition);
    const recLines = doc.splitTextToSize(rec, pageWidth - 50);
    recLines.forEach((line: string) => {
      checkAndAddPage();
      doc.text(line, 28, yPosition);
      yPosition += 6;
    });
    yPosition += 2;
  });

  // === FOOTER ===
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated by SmartAudit AI | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `security-report-${result.fileName.replace('.sol', '')}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
