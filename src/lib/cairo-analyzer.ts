// Cairo Static Analyzer

import { Vulnerability } from '@/types';
import { CAIRO_VULNERABILITY_PATTERNS } from './cairo-patterns';
import { getSWCById } from './swc-registry';
import { getCSRById } from './cairo-security-registry';
import { v4 as uuidv4 } from 'uuid';

export interface CairoAnalysisResult {
  vulnerabilities: Vulnerability[];
  contractInfo: {
    name: string;
    functions: string[];
    storageVariables: string[];
    events: string[];
  };
}

export async function analyzeCairoContract(contractCode: string): Promise<CairoAnalysisResult> {
  const vulnerabilities: Vulnerability[] = [];
  const contractInfo = {
    name: 'Unknown',
    functions: [] as string[],
    storageVariables: [] as string[],
    events: [] as string[]
  };

  try {
    const lines = contractCode.split('\n');
    
    // Extract contract/module name
    for (const line of lines) {
      const moduleMatch = line.match(/mod\s+(\w+)|contract\s+(\w+)/);
      if (moduleMatch) {
        contractInfo.name = moduleMatch[1] || moduleMatch[2];
        break;
      }
    }

    // Extract functions
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const funcMatch = line.match(/fn\s+(\w+)\s*\(/);
      if (funcMatch) {
        contractInfo.functions.push(funcMatch[1]);
      }

      // Extract storage variables
      const storageMatch = line.match(/(\w+):\s*LegacyMap|(\w+):\s*Map/);
      if (storageMatch) {
        const varName = storageMatch[1] || storageMatch[2];
        if (!contractInfo.storageVariables.includes(varName)) {
          contractInfo.storageVariables.push(varName);
        }
      }

      // Extract events
      const eventMatch = line.match(/#\[event\][\s\S]*?enum\s+(\w+)|struct\s+(\w+).*Event/);
      if (eventMatch) {
        const eventName = eventMatch[1] || eventMatch[2];
        if (!contractInfo.events.includes(eventName)) {
          contractInfo.events.push(eventName);
        }
      }
    }

    // Run pattern-based vulnerability detection
    for (const pattern of CAIRO_VULNERABILITY_PATTERNS) {
      if (pattern.detector(contractCode)) {
        const lineNumbers: number[] = [];
        
        for (let i = 0; i < lines.length; i++) {
          if (pattern.pattern.test(lines[i])) {
            lineNumbers.push(i + 1);
          }
        }

        if (lineNumbers.length > 0) {
          for (const lineNum of lineNumbers.slice(0, 3)) {
            const swcInfo = pattern.swcId ? getSWCById(pattern.swcId) : null;
            const csrInfo = pattern.csrId ? getCSRById(pattern.csrId) : null;
            
            vulnerabilities.push({
              id: uuidv4(),
              type: pattern.csrId || pattern.swcId || pattern.id,
              severity: pattern.severity,
              name: pattern.name,
              description: csrInfo?.description || pattern.description,
              lineNumber: lineNum,
              codeSnippet: lines[lineNum - 1]?.trim() || '',
              exploitationScenario: csrInfo?.description || swcInfo?.description || pattern.description,
              recommendation: csrInfo?.remediation || swcInfo?.remediation || getRecommendation(pattern.id),
              swcId: pattern.swcId || '',
              cweIds: csrInfo?.cweIds || swcInfo?.cweIds || [],
              scsvIds: [],
              ethTrustImpact: getSeverityImpact(pattern.severity),
              references: csrInfo?.references || (pattern.swcId ? [`https://swcregistry.io/docs/${pattern.swcId}`] : []),
              detectionMethod: 'static',
              confidence: 'High'
            });
          }
        } else {
          const swcInfo = pattern.swcId ? getSWCById(pattern.swcId) : null;
          const csrInfo = pattern.csrId ? getCSRById(pattern.csrId) : null;
          
          vulnerabilities.push({
            id: uuidv4(),
            type: pattern.csrId || pattern.swcId || pattern.id,
            severity: pattern.severity,
            name: pattern.name,
            description: csrInfo?.description || pattern.description,
            lineNumber: 0,
            codeSnippet: '',
            exploitationScenario: csrInfo?.description || swcInfo?.description || pattern.description,
            recommendation: csrInfo?.remediation || swcInfo?.remediation || getRecommendation(pattern.id),
            swcId: pattern.swcId || '',
            cweIds: csrInfo?.cweIds || swcInfo?.cweIds || [],
            scsvIds: [],
            ethTrustImpact: getSeverityImpact(pattern.severity),
            references: csrInfo?.references || (pattern.swcId ? [`https://swcregistry.io/docs/${pattern.swcId}`] : []),
            detectionMethod: 'static',
            confidence: 'Medium'
          });
        }
      }
    }

  } catch (error) {
    console.error('Cairo analysis error:', error);
  }

  return {
    vulnerabilities,
    contractInfo
  };
}

function getRecommendation(patternId: string): string {
  const recommendations: Record<string, string> = {
    'cairo-reentrancy': 'Follow checks-effects-interactions pattern. Update storage before external calls.',
    'cairo-unchecked-call': 'Wrap external calls in match statements or use .expect() for error handling.',
    'cairo-integer-overflow': 'Use checked arithmetic operations or u256 type with proper bounds checking.',
    'cairo-missing-access-control': 'Implement Ownable pattern or use access control modifiers.',
    'cairo-zero-address-check': 'Validate ContractAddress parameters using is_non_zero() or assertions.',
    'cairo-timestamp-dependency': 'Avoid relying on block timestamp for critical logic or add sufficient tolerance.',
    'cairo-unused-return': 'Always capture and validate return values from external calls.',
    'cairo-unsafe-felt-conversion': 'Use try_into() with proper error handling instead of into().',
    'cairo-missing-event': 'Emit events for all state-changing operations for transparency.',
    'cairo-storage-collision': 'Use unique storage variable names and proper namespacing.',
    'cairo-unvalidated-input': 'Validate all input parameters with assertions or require checks.',
    'cairo-dangerous-delegate-call': 'Only use library_call with thoroughly audited and trusted contracts.',
    'cairo-missing-constructor': 'Validate all constructor parameters to ensure safe initialization.',
    'cairo-array-out-of-bounds': 'Always check array bounds before accessing elements.',
    'cairo-unchecked-math': 'Use checked arithmetic or explicitly handle overflow/underflow cases.'
  };

  return recommendations[patternId] || 'Review the code and implement appropriate security measures.';
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
