// EthTrust Security Levels - Official Framework

export enum EthTrustLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
  LEVEL_5 = 5
}

export interface EthTrustLevelDefinition {
  level: EthTrustLevel;
  name: string;
  description: string;
  criteria: string[];
  risk: 'Critical Risk' | 'High Risk' | 'Medium Risk' | 'Low Risk' | 'Secure';
  color: string;
  recommendation: string;
}

export const ETHTRUST_LEVELS: Record<EthTrustLevel, EthTrustLevelDefinition> = {
  [EthTrustLevel.LEVEL_1]: {
    level: EthTrustLevel.LEVEL_1,
    name: 'Critical - Unsafe',
    description: 'Contract contains critical vulnerabilities that pose immediate risk of fund loss or exploitation.',
    criteria: [
      'One or more Critical severity vulnerabilities detected',
      'Reentrancy vulnerabilities present',
      'Unprotected critical functions (selfdestruct, withdrawal)',
      'Significant access control issues',
      'High risk of fund loss'
    ],
    risk: 'Critical Risk',
    color: '#DC2626',
    recommendation: 'DO NOT DEPLOY. Critical fixes required immediately. Complete security audit recommended.'
  },
  [EthTrustLevel.LEVEL_2]: {
    level: EthTrustLevel.LEVEL_2,
    name: 'High Risk',
    description: 'Contract contains high-severity vulnerabilities that could lead to significant issues.',
    criteria: [
      'No Critical vulnerabilities',
      'One or more High severity vulnerabilities',
      'Unchecked external calls',
      'Potential for unauthorized access',
      'Integer overflow/underflow risks'
    ],
    risk: 'High Risk',
    color: '#F59E0B',
    recommendation: 'Deployment not recommended. Address all high severity issues before deployment.'
  },
  [EthTrustLevel.LEVEL_3]: {
    level: EthTrustLevel.LEVEL_3,
    name: 'Medium Risk',
    description: 'Contract has medium-severity issues that should be addressed but do not pose immediate critical risk.',
    criteria: [
      'No Critical or High severity vulnerabilities',
      'One or more Medium severity issues',
      'Outdated compiler version',
      'Floating pragma',
      'Minor access control improvements needed'
    ],
    risk: 'Medium Risk',
    color: '#EAB308',
    recommendation: 'Address medium severity issues before production deployment. Recommended for testnet.'
  },
  [EthTrustLevel.LEVEL_4]: {
    level: EthTrustLevel.LEVEL_4,
    name: 'Low Risk',
    description: 'Contract follows most best practices with only minor informational findings.',
    criteria: [
      'No Critical, High, or Medium vulnerabilities',
      'Only Low severity or informational findings',
      'Good security practices followed',
      'Minor code quality improvements possible',
      'Proper access controls in place'
    ],
    risk: 'Low Risk',
    color: '#22C55E',
    recommendation: 'Generally safe for deployment. Consider addressing low severity findings for optimization.'
  },
  [EthTrustLevel.LEVEL_5]: {
    level: EthTrustLevel.LEVEL_5,
    name: 'Secure',
    description: 'Contract demonstrates excellent security practices with no significant vulnerabilities.',
    criteria: [
      'No vulnerabilities detected',
      'Follows all security best practices',
      'Proper access controls implemented',
      'Reentrancy protection in place',
      'Safe arithmetic operations',
      'Modern compiler version',
      'Well-structured and maintainable code'
    ],
    risk: 'Secure',
    color: '#10B981',
    recommendation: 'Safe for production deployment. Continue monitoring for new vulnerability patterns.'
  }
};

export interface VulnerabilitySummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export function calculateEthTrustLevel(vulnerabilities: VulnerabilitySummary): EthTrustLevel {
  // Level 1: Critical vulnerabilities present
  if (vulnerabilities.critical > 0) {
    return EthTrustLevel.LEVEL_1;
  }

  // Level 2: High severity vulnerabilities present
  if (vulnerabilities.high > 0) {
    return EthTrustLevel.LEVEL_2;
  }

  // Level 3: Medium severity vulnerabilities present
  if (vulnerabilities.medium > 0) {
    return EthTrustLevel.LEVEL_3;
  }

  // Level 4: Only low severity or informational findings
  if (vulnerabilities.low > 0 || vulnerabilities.info > 0) {
    return EthTrustLevel.LEVEL_4;
  }

  // Level 5: No vulnerabilities
  return EthTrustLevel.LEVEL_5;
}

export function getEthTrustLevelDefinition(level: EthTrustLevel): EthTrustLevelDefinition {
  return ETHTRUST_LEVELS[level];
}

export function getEthTrustColor(level: EthTrustLevel): string {
  return ETHTRUST_LEVELS[level].color;
}

export function getEthTrustRecommendation(level: EthTrustLevel): string {
  return ETHTRUST_LEVELS[level].recommendation;
}
