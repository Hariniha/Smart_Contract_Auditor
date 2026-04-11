// PDF Report Generator - Using Professional Text Audit Format

import jsPDF from 'jspdf';
import { AnalysisResult } from '@/types';
import { generateTextAuditReport } from './text-audit-report-generator';

export function generatePDFReport(result: AnalysisResult): void {
  // Generate the professional text audit report
  const textReport = generateTextAuditReport(result);

  // Create PDF with the text report
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - margin * 2;
  
  // // Typography settings - Before values
  // const bodyFontSize = 9;
  // const bodyLineHeight = 3.8; // 1.4x line spacing for 9pt font
  // const headerFontSize = 10;
  // const headerLineHeight = 4.3; // Proportional to body
  // const titleFontSize = 11;
  // const titleLineHeight = 4.1; // Proportional to body

  // ============================================================================
  // BODY TEXT CONFIGURATION (Independent)
  // ============================================================================
  const bodyFontSize = 10;
  const bodyLineHeight = 4.8;
  const bodyColor = { r: 0, g: 0, b: 0 };
  
  // ============================================================================
  // HEADER CONFIGURATION (Independent)
  // ============================================================================
  const headerFontSize = 11;
  const headerLineHeight = 6.3;
  const headerColor = { r: 0, g: 0, b: 0 };
  
  // ============================================================================
  // TITLE CONFIGURATION (Independent)
  // ============================================================================
  const titleFontSize = 12;
  const titleLineHeight = 4.1;
  const titleColor = { r: 0, g: 0, b: 0 };
  
  // ============================================================================
  // DIVIDER CONFIGURATION (Completely Separate)
  // ============================================================================
  const dividerFontSize = 10;
  const dividerLineHeight = 4.5;
  const dividerColor = { r: 100, g: 100, b: 100 };
  
  // ============================================================================
  // SEVERITY COLORS (Independent)
  // ============================================================================
  const criticalColor = { r: 200, g: 0, b: 0 };
  const highColor = { r: 200, g: 120, b: 0 };
  
  let yPosition = margin;

  // Set default font
  doc.setFont('helvetica');
  doc.setFontSize(bodyFontSize);
  doc.setTextColor(0, 0, 0);

  // Split text into lines for proper pagination
  const lines = textReport.split('\n');
  let isMainTitle = true;
  let lastWasEmpty = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = i + 1 < lines.length ? lines[i + 1] : '';
    
    // Check if this is a header line (next line is a thin divider with -)
    const isHeaderLine = nextLine.includes('-'.repeat(10)) && /^\d+\.\s+/.test(line.trim());
    
    // Check if this is the main title (contains AGENTIC FRAMEWORK)
    const isTitle = isMainTitle && line.includes('AGENTIC FRAMEWORK');
    if (isTitle) isMainTitle = false;
    
    // Check if this is a divider line
    const isDividerLine = line.includes('-'.repeat(10)) || line.includes('=');
    
    // Handle empty lines for spacing
    if (line.trim() === '') {
      yPosition += bodyLineHeight * 0.6; // Reduced spacing for empty lines
      lastWasEmpty = true;
      continue;
    }
    
    // Add extra spacing after empty lines for paragraph separation
    if (lastWasEmpty && !isHeaderLine && !isDividerLine) {
      yPosition += bodyLineHeight * 0.3;
    }
    lastWasEmpty = false;
    
    // If it's a header or title, check if we need to move to next page
    if (isHeaderLine) {
      const headerHeight = headerLineHeight * 3;
      if (yPosition + headerHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    } else if (isTitle) {
      const titleHeight = titleLineHeight * 2;
      if (yPosition + titleHeight > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    }
    
    // Check if we need a new page for regular content
    if (yPosition > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }

    // Handle special characters and formatting
    const displayLine = line.replace(/[↑↓←→]/g, ''); // Remove directional arrows if any

    // Check if this is paragraph text that should be justified
    const isParagraphText = !isTitle && !isHeaderLine && !isDividerLine && 
                            !displayLine.match(/^[•\-*]/) &&
                            displayLine.trim().length > 0;

    // For dividers, don't wrap - keep on single line
    // For paragraph text, don't pre-wrap - let jsPDF handle it with justify
    const wrappedLines = (isDividerLine || isParagraphText) ? [displayLine] : doc.splitTextToSize(displayLine, maxWidth);

    wrappedLines.forEach((wrappedLine: string, lineIndex: number) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      // Main title: 11px, bold, black
      if (isTitle) {
        doc.setFont('courier', 'bold');
        doc.setFontSize(titleFontSize);
        doc.setTextColor(titleColor.r, titleColor.g, titleColor.b);
      }
      // Section headers: 10px, bold, black
      else if (isHeaderLine) {
        doc.setFont('courier', 'bold');
        doc.setFontSize(headerFontSize);
        doc.setTextColor(headerColor.r, headerColor.g, headerColor.b);
      }
      // Divider lines: independent font size and styling
      else if (isDividerLine) {
        doc.setFont('courier', 'normal');
        doc.setFontSize(dividerFontSize);
        doc.setTextColor(dividerColor.r, dividerColor.g, dividerColor.b);
      }
      // Severity highlighting - Critical
      else if (
        displayLine.includes('Critical') ||
        displayLine.includes('CRITICAL')
      ) {
        doc.setFont('courier', 'normal');
        doc.setFontSize(bodyFontSize);
        doc.setTextColor(criticalColor.r, criticalColor.g, criticalColor.b);
      }
      // Severity highlighting - High
      else if (displayLine.includes('High') || displayLine.includes('HIGH')) {
        doc.setFont('courier', 'normal');
        doc.setFontSize(bodyFontSize);
        doc.setTextColor(highColor.r, highColor.g, highColor.b);
      }
      // Normal text
      else {
        doc.setFont('courier', 'normal');
        doc.setFontSize(bodyFontSize);
        doc.setTextColor(bodyColor.r, bodyColor.g, bodyColor.b);
      }

      // Apply text rendering for different element types
      if (isDividerLine) {
        // DIVIDER: NO WRAPPING - render on single line only
        doc.text(wrappedLine, margin, yPosition);
        yPosition += dividerLineHeight;
      } else if (isParagraphText) {
        // BODY PARAGRAPHS: WRAPPED and LEFT-ALIGNED
        const lines = doc.splitTextToSize(wrappedLine, maxWidth);
        
        lines.forEach((line: string, idx: number) => {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          
          // Render line - left aligned
          doc.text(line, margin, yPosition);
          yPosition += bodyLineHeight;
        });
      } else if (isTitle) {
        // TITLE: Left align
        doc.text(wrappedLine, margin, yPosition);
        yPosition += titleLineHeight;
      } else if (isHeaderLine) {
        // HEADER: Left align
        doc.text(wrappedLine, margin, yPosition);
        yPosition += headerLineHeight;
      } else {
        // OTHER TEXT: Left align
        doc.text(wrappedLine, margin, yPosition);
        yPosition += bodyLineHeight;
      }
    });
    
    // Add extra spacing after main title and divider
    if (isTitle) {
      yPosition += titleLineHeight * 0.5;
    } else if (isDividerLine) {
      yPosition += dividerLineHeight * 0.4;
    }
  }

  // Save the PDF
  const timestamp = new Date().toISOString().split('T')[0];
  const fileName = `security-report-${result.fileName.replace(/\.[^/.]+$/, '')}-${timestamp}.pdf`;
  doc.save(fileName);
}
