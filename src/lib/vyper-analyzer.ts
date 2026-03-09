// Vyper Static Analyzer

import { Vulnerability } from '@/types';
import { VYPER_VULNERABILITY_PATTERNS } from './vyper-patterns';
import { getSWCById } from './swc-registry';
import { getVSRById } from './vyper-security-registry';
import { v4 as uuidv4 } from 'uuid';

export interface VyperAnalysisResult {
  vulnerabilities: Vulnerability[];
  contractInfo: {
    name: string;
    functions: string[];
    storageVariables: string[];
    events: string[];
  };
}

export async function analyzeVyperContract(contractCode: string): Promise<VyperAnalysisResult> {
  const vulnerabilities: Vulnerability[] = [];
  const contractInfo = {
    name: 'Unknown',
    functions: [] as string[],
    storageVariables: [] as string[],
    events: [] as string[]
  };

  try {
    // Extract contract information
    const lines = contractCode.split('\n');
    
    // Extract contract name (usually from filename or comments)
    for (const line of lines) {
      const contractMatch = line.match(/#.*contract\s+(\w+)/i);
      if (contractMatch) {
        contractInfo.name = contractMatch[1];
        break;
      }
    }

    // Extract functions
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const funcMatch = line.match(/^\s*def\s+(\w+)\s*\(/);
      if (funcMatch) {
        contractInfo.functions.push(funcMatch[1]);
      }

      // Extract storage variables (self.variable)
      const storageMatch = line.match(/self\.(\w+)(?:\s*:\s*\w+)?/);
      if (storageMatch && !contractInfo.storageVariables.includes(storageMatch[1])) {
        contractInfo.storageVariables.push(storageMatch[1]);
      }

      // Extract events
      const eventMatch = line.match(/^event\s+(\w+):/);
      if (eventMatch) {
        contractInfo.events.push(eventMatch[1]);
      }
    }

    // Run pattern-based vulnerability detection
    for (const pattern of VYPER_VULNERABILITY_PATTERNS) {
      if (pattern.detector(contractCode)) {
        // Find specific line numbers where the pattern matches
        const lineNumbers: number[] = [];
        for (let i = 0; i < lines.length; i++) {
          if (pattern.pattern.test(lines[i])) {
            lineNumbers.push(i + 1);
          }
        }

        // Create vulnerability for each occurrence or just one if no specific lines found
        if (lineNumbers.length > 0) {
          for (const lineNum of lineNumbers.slice(0, 3)) { // Limit to first 3 occurrences
            const swcInfo = pattern.swcId ? getSWCById(pattern.swcId) : null;
            const vsrInfo = pattern.vsrId ? getVSRById(pattern.vsrId) : null;
            
            vulnerabilities.push({
              id: uuidv4(),
              type: pattern.swcId || pattern.id,
              severity: pattern.severity,
              name: pattern.name,
              description: pattern.description,
              lineNumber: lineNum,
              codeSnippet: lines[lineNum - 1]?.trim() || '',
              exploitationScenario: vsrInfo?.description || swcInfo?.description || pattern.description,
              recommendation: vsrInfo?.remediation || swcInfo?.remediation || getRecommendation(pattern.id),
              swcId: pattern.swcId || '',
              cweIds: vsrInfo?.cweIds || swcInfo?.cweIds || [],
              scsvIds: [],
              ethTrustImpact: getSeverityImpact(pattern.severity),
              references: vsrInfo?.references || (pattern.swcId ? [`https://swcregistry.io/docs/${pattern.swcId}`] : []),
              detectionMethod: 'static',
              confidence: 'High'
            });
          }
        } else {
          const swcInfo = pattern.swcId ? getSWCById(pattern.swcId) : null;
          
          vulnerabilities.push({
            id: uuidv4(),
            type: pattern.swcId || pattern.id,
            severity: pattern.severity,
            name: pattern.name,
            description: pattern.description,
            lineNumber: 0,
            codeSnippet: '',
            exploitationScenario: swcInfo?.description || pattern.description,
            recommendation: swcInfo?.remediation || getRecommendation(pattern.id),
            swcId: pattern.swcId || '',
            cweIds: swcInfo?.cweIds || [],
            scsvIds: [],
            ethTrustImpact: getSeverityImpact(pattern.severity),
            references: pattern.swcId ? [`https://swcregistry.io/docs/${pattern.swcId}`] : [],
            detectionMethod: 'static',
            confidence: 'Medium'
          });
        }
      }
    }

  } catch (error) {
    console.error('Vyper analysis error:', error);
  }

  return {
    vulnerabilities,
    contractInfo
  };
}

function getRecommendation(patternId: string): string {
  const recommendations: Record<string, string> = {
    'vyper-reentrancy': 'Follow the checks-effects-interactions pattern. Update state before making external calls.',
    'vyper-unchecked-send': 'Always check the return value of send() and handle failures appropriately.',
    'vyper-integer-overflow': 'Upgrade to Vyper 0.3.0+ or use SafeMath equivalent checks.',
    'vyper-tx-origin': 'Use msg.sender instead of tx.origin for authorization.',
    'vyper-unprotected-function': 'Add access control using assert msg.sender == self.owner or similar checks.',
    'vyper-missing-zero-check': 'Add assert statement to check address parameter is not ZERO_ADDRESS.',
    'vyper-timestamp-dependency': 'Avoid using block.timestamp for critical logic or be aware of manipulation risks.',
    'vyper-unsafe-type-inference': 'Always explicitly annotate parameter types.',
    'vyper-unchecked-raw-call': 'Check the success return value from raw_call and handle failures.',
    'vyper-selfdestruct': 'Remove selfdestruct or implement multiple security layers if absolutely necessary.',
    'vyper-delegatecall': 'Only use delegate calls with trusted, immutable contracts.',
    'vyper-missing-event': 'Emit events for all critical state changes for transparency.',
    'vyper-outdated-version': 'Update to the latest stable Vyper version (0.3.7+).',
    'vyper-floating-pragma': 'Lock the Vyper version to a specific version without ^.',
    'vyper-division-before-multiplication': 'Perform multiplication before division to avoid precision loss.'
  };

  return recommendations[patternId] || 'Review the code and apply appropriate security measures.';
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
