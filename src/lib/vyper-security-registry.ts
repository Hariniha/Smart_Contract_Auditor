// Vyper Security Registry (VSR)
// Based on Vyper Security Considerations and Common Vulnerabilities

export interface VSREntry {
  id: string;
  title: string;
  description: string;
  remediation: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  cweIds: string[];
  references: string[];
  vyperVersions?: string; // Affected versions
}

export const VYPER_SECURITY_REGISTRY: Record<string, VSREntry> = {
  'VSR-001': {
    id: 'VSR-001',
    title: 'Reentrancy Vulnerability',
    description: 'External calls with send() or raw_call() before state changes can allow reentrancy attacks. The called contract can call back into the current contract before state updates complete.',
    remediation: 'Follow the checks-effects-interactions pattern. Update all state variables before making external calls. Use ReentrancyGuard pattern or Vyper\'s built-in @nonreentrant decorator.',
    severity: 'Critical',
    cweIds: ['CWE-841'],
    references: [
      'https://docs.vyperlang.org/en/stable/security-considerations.html#reentrancy',
      'https://swcregistry.io/docs/SWC-107'
    ]
  },
  'VSR-002': {
    id: 'VSR-002',
    title: 'Unchecked External Call',
    description: 'The return value of send() or raw_call() must be checked. Failed external calls can leave the contract in an inconsistent state if not properly handled.',
    remediation: 'Always check the return value of external calls. Use assert or if statements to verify success. Consider using raw_call with is_delegate_call=False and proper error handling.',
    severity: 'High',
    cweIds: ['CWE-252', 'CWE-703'],
    references: [
      'https://docs.vyperlang.org/en/stable/built-in-functions.html#raw_call',
      'https://github.com/vyperlang/vyper/security/advisories'
    ]
  },
  'VSR-003': {
    id: 'VSR-003',
    title: 'Integer Overflow/Underflow',
    description: 'Vyper versions before 0.3.0 do not have automatic overflow protection. Arithmetic operations can wrap around causing unexpected behavior.',
    remediation: 'Upgrade to Vyper 0.3.0 or later which has built-in overflow protection. For older versions, use explicit bounds checking before arithmetic operations.',
    severity: 'High',
    cweIds: ['CWE-190', 'CWE-191'],
    references: [
      'https://docs.vyperlang.org/en/stable/release-notes.html#v0-3-0',
      'https://github.com/vyperlang/vyper/security/advisories/GHSA-5824-cm3x-3c38'
    ],
    vyperVersions: '< 0.3.0'
  },
  'VSR-004': {
    id: 'VSR-004',
    title: 'Authorization through tx.origin',
    description: 'Using tx.origin for authorization can make contracts vulnerable to phishing attacks. An attacker can trick a legitimate user into calling a malicious contract.',
    remediation: 'Use msg.sender instead of tx.origin for authorization checks. tx.origin should only be used when explicitly needed to verify the original transaction sender.',
    severity: 'High',
    cweIds: ['CWE-477'],
    references: [
      'https://docs.vyperlang.org/en/stable/security-considerations.html#tx-origin',
      'https://swcregistry.io/docs/SWC-115'
    ]
  },
  'VSR-005': {
    id: 'VSR-005',
    title: 'Missing Access Control',
    description: 'External functions without proper access control can be called by anyone. Critical functions like transfers, withdrawals, or state changes must be protected.',
    remediation: 'Add access control checks using assert msg.sender == self.owner or similar patterns. Use decorators or modifiers to restrict function access to authorized addresses.',
    severity: 'Critical',
    cweIds: ['CWE-284', 'CWE-862'],
    references: [
      'https://docs.vyperlang.org/en/stable/structure-of-a-contract.html#functions',
      'https://github.com/vyperlang/vyper/tree/master/examples'
    ]
  },
  'VSR-006': {
    id: 'VSR-006',
    title: 'Missing Zero Address Validation',
    description: 'Functions accepting address parameters should validate against zero address (empty(address)). Transfers or assignments to zero address can result in permanent loss of funds.',
    remediation: 'Add validation: assert _address != empty(address), "Invalid address". Check all address parameters in external and public functions.',
    severity: 'Medium',
    cweIds: ['CWE-20'],
    references: [
      'https://docs.vyperlang.org/en/stable/types.html#address'
    ]
  },
  'VSR-007': {
    id: 'VSR-007',
    title: 'Timestamp Dependency',
    description: 'Using block.timestamp for critical logic can be manipulated by miners within a small range (~15 seconds). This can affect time-based conditions.',
    remediation: 'Avoid using block.timestamp for critical operations. If necessary, allow for a tolerance window. Consider using block numbers for time measurements.',
    severity: 'Medium',
    cweIds: ['CWE-829'],
    references: [
      'https://docs.vyperlang.org/en/stable/security-considerations.html#timestamp-dependence',
      'https://swcregistry.io/docs/SWC-116'
    ]
  },
  'VSR-008': {
    id: 'VSR-008',
    title: 'Unsafe Type Inference',
    description: 'Missing explicit type annotations can lead to unexpected behavior. Vyper requires explicit typing for function parameters and return values.',
    remediation: 'Always provide explicit type annotations for all function parameters, return values, and variables. Use proper Vyper types: uint256, int128, address, bytes32, etc.',
    severity: 'Medium',
    cweIds: ['CWE-704'],
    references: [
      'https://docs.vyperlang.org/en/stable/types.html'
    ]
  },
  'VSR-009': {
    id: 'VSR-009',
    title: 'Dangerous Delegatecall',
    description: 'Using raw_call with is_delegate_call=True executes code in the context of the calling contract. If the target contract is untrusted, it can modify storage.',
    remediation: 'Only use delegatecall with thoroughly audited and trusted contracts. Consider if regular call is sufficient. Validate target contract addresses.',
    severity: 'Critical',
    cweIds: ['CWE-829'],
    references: [
      'https://docs.vyperlang.org/en/stable/built-in-functions.html#raw_call',
      'https://swcregistry.io/docs/SWC-112'
    ]
  },
  'VSR-010': {
    id: 'VSR-010',
    title: 'Missing Event Emission',
    description: 'Critical state changes should emit events for transparency and off-chain tracking. Events are essential for monitoring contract activity.',
    remediation: 'Emit events for all state-changing operations: transfers, approvals, ownership changes, etc. Follow naming conventions (Transfer, Approval, etc.).',
    severity: 'Low',
    cweIds: ['CWE-778'],
    references: [
      'https://docs.vyperlang.org/en/stable/event-logging.html'
    ]
  },
  'VSR-011': {
    id: 'VSR-011',
    title: 'Outdated Compiler Version',
    description: 'Using outdated Vyper versions may include known vulnerabilities and bugs. Security patches and improvements are regularly released.',
    remediation: 'Update to the latest stable Vyper version (0.3.7+ as of 2024). Review changelog for security fixes. Pin to specific version in production.',
    severity: 'Medium',
    cweIds: ['CWE-1104'],
    references: [
      'https://github.com/vyperlang/vyper/releases',
      'https://github.com/vyperlang/vyper/security/advisories'
    ],
    vyperVersions: '< 0.3.7'
  },
  'VSR-012': {
    id: 'VSR-012',
    title: 'Floating Pragma',
    description: 'Using caret (^) in version pragma allows automatic upgrades which may introduce breaking changes or new bugs.',
    remediation: 'Lock Vyper version to specific release: # @version 0.3.7 (without ^). Test thoroughly before upgrading versions.',
    severity: 'Low',
    cweIds: ['CWE-1126'],
    references: [
      'https://docs.vyperlang.org/en/stable/structure-of-a-contract.html#version-pragma'
    ]
  },
  'VSR-013': {
    id: 'VSR-013',
    title: 'Division Before Multiplication',
    description: 'Performing division before multiplication causes precision loss due to integer division truncation. This can lead to incorrect calculations.',
    remediation: 'Always perform multiplication before division: (a * b) / c instead of (a / c) * b. Consider scaling factors for precise calculations.',
    severity: 'Medium',
    cweIds: ['CWE-682'],
    references: [
      'https://docs.vyperlang.org/en/stable/types.html#operators'
    ]
  },
  'VSR-014': {
    id: 'VSR-014',
    title: 'Unprotected Selfdestruct',
    description: 'selfdestruct() without access control can be called by anyone, permanently destroying the contract and sending all funds.',
    remediation: 'Add strict access control to selfdestruct. Consider if selfdestruct is truly necessary. Use withdrawal pattern instead where possible.',
    severity: 'Critical',
    cweIds: ['CWE-284'],
    references: [
      'https://docs.vyperlang.org/en/stable/built-in-functions.html#selfdestruct'
    ]
  },
  'VSR-015': {
    id: 'VSR-015',
    title: 'Incorrect Interface Implementation',
    description: 'Implementing interfaces incorrectly or incompletely can cause integration failures and unexpected behavior when interacting with other contracts.',
    remediation: 'Use implements: keyword to explicitly declare interface implementation. Ensure all required functions match interface signatures exactly.',
    severity: 'High',
    cweIds: ['CWE-573'],
    references: [
      'https://docs.vyperlang.org/en/stable/interfaces.html'
    ]
  }
};

export function getVSRById(id: string): VSREntry | undefined {
  return VYPER_SECURITY_REGISTRY[id];
}

export function getAllVSREntries(): VSREntry[] {
  return Object.values(VYPER_SECURITY_REGISTRY);
}

export function getVSRBySeverity(severity: VSREntry['severity']): VSREntry[] {
  return getAllVSREntries().filter(entry => entry.severity === severity);
}
