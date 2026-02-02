// SCSVS (Smart Contract Security Verification Standard) v2 Framework

export interface SCSVSControl {
  id: string;
  category: string;
  title: string;
  level: 1 | 2 | 3;
  description: string;
  verification: string;
}

export const SCSVS_V2_CONTROLS: SCSVSControl[] = [
  // Architecture, Design and Threat Modeling
  {
    id: 'V1.1',
    category: 'Architecture',
    title: 'Verify Security Architecture Documentation',
    level: 2,
    description: 'Verify that a threat model for the smart contract system has been created and documented.',
    verification: 'Check for threat model documentation'
  },
  {
    id: 'V1.2',
    category: 'Architecture',
    title: 'Verify Secure Design Patterns',
    level: 1,
    description: 'Verify that secure design patterns and best practices are used throughout the contract system.',
    verification: 'Review code for secure design patterns'
  },
  {
    id: 'V1.3',
    category: 'Architecture',
    title: 'Verify Third-Party Dependencies',
    level: 2,
    description: 'Verify that all third-party components have been assessed for security.',
    verification: 'Check third-party library security'
  },

  // Access Control
  {
    id: 'V2.1',
    category: 'Access Control',
    title: 'Verify Function Access Controls',
    level: 1,
    description: 'Verify that all functions have appropriate access controls and visibility modifiers.',
    verification: 'Check all functions have explicit visibility'
  },
  {
    id: 'V2.2',
    category: 'Access Control',
    title: 'Verify Role-Based Access',
    level: 2,
    description: 'Verify that role-based access control is implemented where necessary.',
    verification: 'Check for proper role management'
  },
  {
    id: 'V2.3',
    category: 'Access Control',
    title: 'Verify Ownership Transfer',
    level: 2,
    description: 'Verify that ownership transfer mechanisms are secure and cannot be abused.',
    verification: 'Review ownership transfer logic'
  },
  {
    id: 'V2.4',
    category: 'Access Control',
    title: 'Verify tx.origin Not Used',
    level: 1,
    description: 'Verify that tx.origin is not used for authorization.',
    verification: 'Ensure msg.sender is used instead of tx.origin'
  },

  // Arithmetic
  {
    id: 'V3.1',
    category: 'Arithmetic',
    title: 'Verify Safe Math Operations',
    level: 1,
    description: 'Verify that all arithmetic operations are protected against overflow and underflow.',
    verification: 'Check for SafeMath usage or Solidity ^0.8.0'
  },
  {
    id: 'V3.2',
    category: 'Arithmetic',
    title: 'Verify Division Before Multiplication',
    level: 2,
    description: 'Verify that multiplication is performed before division to avoid precision loss.',
    verification: 'Review calculation order'
  },
  {
    id: 'V3.3',
    category: 'Arithmetic',
    title: 'Verify Integer Precision',
    level: 2,
    description: 'Verify that integer division and modulo are handled correctly.',
    verification: 'Check for proper handling of integer operations'
  },

  // Malicious Input Handling
  {
    id: 'V4.1',
    category: 'Input Validation',
    title: 'Verify Input Validation',
    level: 1,
    description: 'Verify that all inputs are validated before processing.',
    verification: 'Check require statements for input validation'
  },
  {
    id: 'V4.2',
    category: 'Input Validation',
    title: 'Verify Address Validation',
    level: 1,
    description: 'Verify that address inputs are validated against zero address.',
    verification: 'Check for zero address validation'
  },
  {
    id: 'V4.3',
    category: 'Input Validation',
    title: 'Verify Array Length Checks',
    level: 2,
    description: 'Verify that array lengths are validated to prevent DoS attacks.',
    verification: 'Check array length limits'
  },

  // Gas Usage & Limits
  {
    id: 'V5.1',
    category: 'Gas Optimization',
    title: 'Verify Gas Efficient Loops',
    level: 2,
    description: 'Verify that loops are bounded and gas-efficient.',
    verification: 'Check for unbounded loops'
  },
  {
    id: 'V5.2',
    category: 'Gas Optimization',
    title: 'Verify Storage Optimization',
    level: 2,
    description: 'Verify that storage is used efficiently.',
    verification: 'Review storage variable packing'
  },
  {
    id: 'V5.3',
    category: 'Gas Optimization',
    title: 'Verify Gas Griefing Protection',
    level: 3,
    description: 'Verify protection against gas griefing attacks.',
    verification: 'Check for gas griefing vulnerabilities'
  },

  // External Calls
  {
    id: 'V6.1',
    category: 'External Calls',
    title: 'Verify Reentrancy Protection',
    level: 1,
    description: 'Verify that reentrancy attacks are prevented using checks-effects-interactions pattern.',
    verification: 'Check for reentrancy guards'
  },
  {
    id: 'V6.2',
    category: 'External Calls',
    title: 'Verify Call Return Values',
    level: 1,
    description: 'Verify that return values of external calls are checked.',
    verification: 'Check all external call return values'
  },
  {
    id: 'V6.3',
    category: 'External Calls',
    title: 'Verify Delegatecall Safety',
    level: 1,
    description: 'Verify that delegatecall is used safely and only with trusted contracts.',
    verification: 'Review delegatecall usage'
  },
  {
    id: 'V6.4',
    category: 'External Calls',
    title: 'Verify DoS Protection',
    level: 2,
    description: 'Verify protection against DoS via external calls.',
    verification: 'Check for DoS vulnerabilities'
  },

  // Oracle and Price Data
  {
    id: 'V7.1',
    category: 'Oracle',
    title: 'Verify Oracle Data Validation',
    level: 2,
    description: 'Verify that oracle data is validated before use.',
    verification: 'Check oracle data validation'
  },
  {
    id: 'V7.2',
    category: 'Oracle',
    title: 'Verify Price Manipulation Protection',
    level: 2,
    description: 'Verify protection against price manipulation attacks.',
    verification: 'Review price feed security'
  },

  // Data Privacy
  {
    id: 'V8.1',
    category: 'Privacy',
    title: 'Verify Private Data Protection',
    level: 2,
    description: 'Verify that private data is not stored on-chain unencrypted.',
    verification: 'Check for unencrypted sensitive data'
  },
  {
    id: 'V8.2',
    category: 'Privacy',
    title: 'Verify State Variable Privacy',
    level: 1,
    description: 'Verify proper understanding of private keyword limitations.',
    verification: 'Review private variable usage'
  },

  // Business Logic
  {
    id: 'V9.1',
    category: 'Business Logic',
    title: 'Verify State Consistency',
    level: 1,
    description: 'Verify that state changes maintain consistency.',
    verification: 'Check state transition logic'
  },
  {
    id: 'V9.2',
    category: 'Business Logic',
    title: 'Verify Economic Security',
    level: 2,
    description: 'Verify that economic incentives are properly aligned.',
    verification: 'Review tokenomics and incentives'
  },
  {
    id: 'V9.3',
    category: 'Business Logic',
    title: 'Verify Time-Lock Mechanisms',
    level: 2,
    description: 'Verify proper implementation of time-locks and delays.',
    verification: 'Check time-lock implementations'
  },

  // Blockchain Data
  {
    id: 'V10.1',
    category: 'Blockchain Data',
    title: 'Verify Timestamp Usage',
    level: 1,
    description: 'Verify that block.timestamp is not used for critical logic.',
    verification: 'Check block.timestamp usage'
  },
  {
    id: 'V10.2',
    category: 'Blockchain Data',
    title: 'Verify Randomness Source',
    level: 1,
    description: 'Verify secure sources of randomness.',
    verification: 'Check for weak randomness sources'
  },
  {
    id: 'V10.3',
    category: 'Blockchain Data',
    title: 'Verify Block Data Usage',
    level: 2,
    description: 'Verify that block data is used appropriately.',
    verification: 'Review block.number, block.difficulty usage'
  },

  // Cryptography
  {
    id: 'V11.1',
    category: 'Cryptography',
    title: 'Verify Signature Verification',
    level: 2,
    description: 'Verify proper signature verification implementation.',
    verification: 'Check signature verification code'
  },
  {
    id: 'V11.2',
    category: 'Cryptography',
    title: 'Verify Replay Protection',
    level: 2,
    description: 'Verify protection against replay attacks.',
    verification: 'Check for nonce or unique identifier'
  },
  {
    id: 'V11.3',
    category: 'Cryptography',
    title: 'Verify Hash Collision Protection',
    level: 2,
    description: 'Verify protection against hash collisions.',
    verification: 'Review abi.encodePacked usage'
  },

  // Token Standards
  {
    id: 'V12.1',
    category: 'Token',
    title: 'Verify ERC Standard Compliance',
    level: 1,
    description: 'Verify compliance with relevant ERC standards.',
    verification: 'Check ERC20/ERC721/ERC1155 compliance'
  },
  {
    id: 'V12.2',
    category: 'Token',
    title: 'Verify Transfer Security',
    level: 1,
    description: 'Verify secure token transfer implementation.',
    verification: 'Review transfer and transferFrom functions'
  },
  {
    id: 'V12.3',
    category: 'Token',
    title: 'Verify Approval Mechanism',
    level: 2,
    description: 'Verify secure approval mechanism.',
    verification: 'Check approve function implementation'
  },

  // Code Clarity
  {
    id: 'V13.1',
    category: 'Code Quality',
    title: 'Verify Code Documentation',
    level: 2,
    description: 'Verify that code is well-documented.',
    verification: 'Check for NatSpec comments'
  },
  {
    id: 'V13.2',
    category: 'Code Quality',
    title: 'Verify Code Simplicity',
    level: 2,
    description: 'Verify that code is simple and maintainable.',
    verification: 'Review code complexity'
  },
  {
    id: 'V13.3',
    category: 'Code Quality',
    title: 'Verify Compiler Warnings',
    level: 1,
    description: 'Verify that code compiles without warnings.',
    verification: 'Check compilation warnings'
  },

  // Testing
  {
    id: 'V14.1',
    category: 'Testing',
    title: 'Verify Unit Test Coverage',
    level: 2,
    description: 'Verify adequate unit test coverage.',
    verification: 'Check test coverage percentage'
  },
  {
    id: 'V14.2',
    category: 'Testing',
    title: 'Verify Integration Testing',
    level: 2,
    description: 'Verify integration testing is performed.',
    verification: 'Check for integration tests'
  },
  {
    id: 'V14.3',
    category: 'Testing',
    title: 'Verify Formal Verification',
    level: 3,
    description: 'Verify formal verification where critical.',
    verification: 'Check for formal verification reports'
  },

  // Known Vulnerabilities
  {
    id: 'V15.1',
    category: 'Known Issues',
    title: 'Verify Compiler Version',
    level: 1,
    description: 'Verify use of recent compiler version without known bugs.',
    verification: 'Check Solidity version'
  },
  {
    id: 'V15.2',
    category: 'Known Issues',
    title: 'Verify Deprecated Functions',
    level: 1,
    description: 'Verify no deprecated functions are used.',
    verification: 'Check for deprecated Solidity features'
  },
  {
    id: 'V15.3',
    category: 'Known Issues',
    title: 'Verify Known Attack Patterns',
    level: 1,
    description: 'Verify protection against known attack patterns.',
    verification: 'Check against known vulnerability database'
  }
];

export function getSCSVSControlsByCategory(category: string): SCSVSControl[] {
  return SCSVS_V2_CONTROLS.filter(control => control.category === category);
}

export function getSCSVSControlsByLevel(level: 1 | 2 | 3): SCSVSControl[] {
  return SCSVS_V2_CONTROLS.filter(control => control.level === level);
}

export function getAllCategories(): string[] {
  return Array.from(new Set(SCSVS_V2_CONTROLS.map(control => control.category)));
}

export interface SCSVSResult {
  controlId: string;
  passed: boolean;
  findings: string[];
}

export function calculateSCSVSCompliance(results: SCSVSResult[]): {
  totalControls: number;
  passed: number;
  failed: number;
  percentage: number;
} {
  const totalControls = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = totalControls - passed;
  const percentage = totalControls > 0 ? Math.round((passed / totalControls) * 100) : 0;

  return { totalControls, passed, failed, percentage };
}
