// Static Analysis Service

import * as parser from '@solidity-parser/parser';
import { Vulnerability } from '@/types';
import { VULNERABILITY_PATTERNS } from './vulnerability-patterns';
import { getSWCById } from './swc-registry';
import { v4 as uuidv4 } from 'uuid';

export interface StaticAnalysisResult {
  vulnerabilities: Vulnerability[];
  contractInfo: {
    name: string;
    functions: string[];
    stateVariables: string[];
    modifiers: string[];
  };
}

export async function performStaticAnalysis(contractCode: string): Promise<StaticAnalysisResult> {
  const vulnerabilities: Vulnerability[] = [];
  const contractInfo = {
    name: 'Unknown',
    functions: [] as string[],
    stateVariables: [] as string[],
    modifiers: [] as string[]
  };

  try {
    // Parse the Solidity code
    const ast = parser.parse(contractCode, { tolerant: true, loc: true });

    // Extract contract information
    parser.visit(ast, {
      ContractDefinition: (node: any) => {
        contractInfo.name = node.name;
      },
      FunctionDefinition: (node: any) => {
        if (node.name) {
          contractInfo.functions.push(node.name);
        }
      },
      StateVariableDeclaration: (node: any) => {
        // Extract state variable names
        if (node.variables) {
          node.variables.forEach((v: any) => {
            if (v.name) {
              contractInfo.stateVariables.push(v.name);
            }
          });
        }
      },
      ModifierDefinition: (node: any) => {
        if (node.name) {
          contractInfo.modifiers.push(node.name);
        }
      }
    });

    // Run pattern-based vulnerability detection
    const lines = contractCode.split('\n');
    
    for (const pattern of VULNERABILITY_PATTERNS) {
      if (pattern.check(contractCode)) {
        const matches = findPatternMatches(contractCode, pattern);
        
        for (const match of matches) {
          const swc = getSWCById(pattern.swcId);
          
          vulnerabilities.push({
            id: uuidv4(),
            name: pattern.name,
            type: pattern.swcId,
            severity: pattern.severity,
            swcId: pattern.swcId,
            cweIds: swc?.cweIds || [],
            scsvIds: pattern.scsvIds || [],
            ethTrustImpact: getSeverityImpact(pattern.severity),
            lineNumber: match.lineNumber,
            lineRange: { start: match.lineNumber, end: match.lineNumber },
            codeSnippet: getCodeContext(lines, match.lineNumber, 2),
            description: swc?.description || pattern.description,
            exploitationScenario: 'See detailed analysis',
            recommendation: swc?.remediation || 'Review and fix this issue',
            references: swc ? [`https://swcregistry.io/docs/${pattern.swcId}`] : [],
            detectionMethod: 'static',
            confidence: 'High'
          });
        }
      }
    }

  } catch (error) {
    console.error('Error during static analysis:', error);
    // Continue with pattern-based analysis even if AST parsing fails
    
    const lines = contractCode.split('\n');
    
    for (const pattern of VULNERABILITY_PATTERNS) {
      if (pattern.check(contractCode)) {
        const matches = findPatternMatches(contractCode, pattern);
        
        for (const match of matches) {
          const swc = getSWCById(pattern.swcId);
          
          vulnerabilities.push({
            id: uuidv4(),
            name: pattern.name,
            type: pattern.swcId,
            severity: pattern.severity,
            swcId: pattern.swcId,
            cweIds: swc?.cweIds || [],
            scsvIds: pattern.scsvIds || [],
            ethTrustImpact: getSeverityImpact(pattern.severity),
            lineNumber: match.lineNumber,
            lineRange: { start: match.lineNumber, end: match.lineNumber },
            codeSnippet: getCodeContext(lines, match.lineNumber, 2),
            description: swc?.description || pattern.description,
            exploitationScenario: 'Requires detailed analysis',
            recommendation: swc?.remediation || 'Review and apply best practices',
            references: swc ? [`https://swcregistry.io/docs/${pattern.swcId}`] : [],
            detectionMethod: 'static',
            confidence: 'Medium'
          });
        }
      }
    }
  }

  return {
    vulnerabilities: removeDuplicates(vulnerabilities),
    contractInfo
  };
}

function findPatternMatches(code: string, pattern: any): Array<{ lineNumber: number; match: string }> {
  const lines = code.split('\n');
  const matches: Array<{ lineNumber: number; match: string }> = [];

  lines.forEach((line, index) => {
    if (typeof pattern.pattern === 'string') {
      if (line.includes(pattern.pattern)) {
        matches.push({ lineNumber: index + 1, match: line.trim() });
      }
    } else if (pattern.pattern instanceof RegExp) {
      if (pattern.pattern.test(line)) {
        matches.push({ lineNumber: index + 1, match: line.trim() });
      }
    }
  });

  return matches.length > 0 ? matches : [{ lineNumber: 1, match: '' }];
}

function getCodeContext(lines: string[], lineNumber: number, contextLines: number = 2): string {
  const startLine = Math.max(0, lineNumber - contextLines - 1);
  const endLine = Math.min(lines.length, lineNumber + contextLines);
  return lines.slice(startLine, endLine).join('\n');
}

function getSeverityImpact(severity: string): number {
  const impacts: Record<string, number> = {
    'Critical': 1,
    'High': 2,
    'Medium': 3,
    'Low': 4,
    'Info': 5
  };
  return impacts[severity] || 3;
}

function removeDuplicates(vulnerabilities: Vulnerability[]): Vulnerability[] {
  const seen = new Set<string>();
  return vulnerabilities.filter(v => {
    const key = `${v.swcId}-${v.lineNumber}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

export function analyzeAccessControl(code: string): Vulnerability[] {
  const vulnerabilities: Vulnerability[] = [];
  const lines = code.split('\n');

  // Check for functions without explicit visibility
  lines.forEach((line, index) => {
    if (/function\s+\w+/.test(line) && !/public|private|internal|external/.test(line)) {
      vulnerabilities.push({
        id: uuidv4(),
        name: 'Missing Function Visibility',
        type: 'SWC-100',
        severity: 'High',
        swcId: 'SWC-100',
        cweIds: ['CWE-710'],
        scsvIds: ['V2.1'],
        ethTrustImpact: 2,
        lineNumber: index + 1,
        codeSnippet: line.trim(),
        description: 'Function does not have explicit visibility modifier',
        exploitationScenario: 'Function defaults to public, potentially exposing internal logic',
        recommendation: 'Add explicit visibility modifier (public, external, internal, or private)',
        references: ['https://swcregistry.io/docs/SWC-100'],
        detectionMethod: 'static',
        confidence: 'High'
      });
    }
  });

  return vulnerabilities;
}

export function analyzeReentrancy(code: string): Vulnerability[] {
  const vulnerabilities: Vulnerability[] = [];
  const lines = code.split('\n');
  
  lines.forEach((line, index) => {
    if (/\.call\{value:/.test(line) || /\.transfer\(/.test(line) || /\.send\(/.test(line)) {
      // Check if state changes after external call
      const remainingCode = lines.slice(index).join('\n');
      if (/=\s*\w+|\.push\(|balances\[/.test(remainingCode.substring(0, 500))) {
        vulnerabilities.push({
          id: uuidv4(),
          name: 'Potential Reentrancy Vulnerability',
          type: 'SWC-107',
          severity: 'Critical',
          swcId: 'SWC-107',
          cweIds: ['CWE-841'],
          scsvIds: ['V6.1'],
          ethTrustImpact: 1,
          lineNumber: index + 1,
          codeSnippet: line.trim(),
          description: 'External call detected with state changes afterward',
          exploitationScenario: 'Attacker can recursively call this function before state is updated',
          recommendation: 'Use Checks-Effects-Interactions pattern. Update state before external calls.',
          references: ['https://swcregistry.io/docs/SWC-107'],
          detectionMethod: 'static',
          confidence: 'High'
        });
      }
    }
  });

  return vulnerabilities;
}
