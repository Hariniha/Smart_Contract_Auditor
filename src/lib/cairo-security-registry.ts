// Cairo Security Registry (CSR)
// Based on StarkNet Security Considerations and Cairo Best Practices

export interface CSREntry {
  id: string;
  title: string;
  description: string;
  remediation: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  cweIds: string[];
  references: string[];
  cairoVersions?: string; // Affected versions
}

export const CAIRO_SECURITY_REGISTRY: Record<string, CSREntry> = {
  'CSR-001': {
    id: 'CSR-001',
    title: 'Reentrancy Vulnerability',
    description: 'External contract calls (call_contract, library_call) before state updates can enable reentrancy. The called contract can recursively call back before state changes are complete.',
    remediation: 'Follow checks-effects-interactions pattern. Update storage with .write() before making external calls. Use ReentrancyGuard component from OpenZeppelin Cairo.',
    severity: 'Critical',
    cweIds: ['CWE-841'],
    references: [
      'https://docs.starknet.io/documentation/architecture_and_concepts/Smart_Contracts/security-considerations/',
      'https://github.com/OpenZeppelin/cairo-contracts/blob/main/src/security/reentrancyguard.cairo'
    ]
  },
  'CSR-002': {
    id: 'CSR-002',
    title: 'Unchecked External Call',
    description: 'call_contract and library_call can fail silently if return values are not checked. Ignoring failures can leave the contract in an inconsistent state.',
    remediation: 'Wrap external calls in proper error handling. Use match statements or .expect() to handle potential failures. Validate return values before proceeding.',
    severity: 'High',
    cweIds: ['CWE-252', 'CWE-703'],
    references: [
      'https://book.cairo-lang.org/ch99-01-03-02-contract-dispatcher-library-dispatcher-and-system-calls.html',
      'https://github.com/starkware-libs/cairo/tree/main/corelib'
    ]
  },
  'CSR-003': {
    id: 'CSR-003',
    title: 'felt252 Arithmetic Overflow',
    description: 'felt252 type can overflow without warning during arithmetic operations. Unlike u256, felt252 wraps around modulo the field prime, leading to unexpected values.',
    remediation: 'Use u256, u128, or u64 types for arithmetic that requires overflow protection. Use checked_add, checked_sub, checked_mul for explicit overflow handling. Validate felt252 ranges.',
    severity: 'High',
    cweIds: ['CWE-190', 'CWE-191'],
    references: [
      'https://book.cairo-lang.org/ch02-02-data-types.html#felt-type',
      'https://github.com/OpenZeppelin/cairo-contracts/blob/main/src/utils/math.cairo'
    ]
  },
  'CSR-004': {
    id: 'CSR-004',
    title: 'Missing Access Control',
    description: 'External functions without proper authorization checks can be called by anyone. Critical operations must restrict access to authorized users.',
    remediation: 'Implement Ownable or AccessControl patterns from OpenZeppelin Cairo. Use assert statements to verify caller: assert(get_caller_address() == owner, \'Unauthorized\').',
    severity: 'Critical',
    cweIds: ['CWE-284', 'CWE-862'],
    references: [
      'https://github.com/OpenZeppelin/cairo-contracts/tree/main/src/access',
      'https://docs.openzeppelin.com/contracts-cairo/0.8.0/access'
    ]
  },
  'CSR-005': {
    id: 'CSR-005',
    title: 'Zero Address Validation Missing',
    description: 'ContractAddress parameters should be validated against zero address. Operations with zero address can result in permanent loss of funds or broken functionality.',
    remediation: 'Add validation using is_non_zero() or assertions: assert(address.is_non_zero(), \'Invalid address\'). Check all address parameters in external functions.',
    severity: 'Medium',
    cweIds: ['CWE-20'],
    references: [
      'https://book.cairo-lang.org/ch02-02-data-types.html#contract-address-type',
      'https://github.com/OpenZeppelin/cairo-contracts/blob/main/src/token/erc20/erc20.cairo'
    ]
  },
  'CSR-006': {
    id: 'CSR-006',
    title: 'Timestamp Manipulation Risk',
    description: 'Using get_block_timestamp() for critical logic can be influenced by sequencers. Block timestamps are not guaranteed to be perfectly accurate.',
    remediation: 'Avoid timestamp-dependent logic for critical operations. If necessary, add tolerance windows. Consider using block numbers with get_block_number() instead.',
    severity: 'Medium',
    cweIds: ['CWE-829'],
    references: [
      'https://docs.starknet.io/documentation/architecture_and_concepts/Smart_Contracts/system-calls/',
      'https://book.cairo-lang.org/ch99-01-03-01-contract-functions.html'
    ]
  },
  'CSR-007': {
    id: 'CSR-007',
    title: 'Storage Collision Risk',
    description: 'Multiple storage variables with similar names or improper namespacing can cause storage collisions, overwriting critical data.',
    remediation: 'Use unique, descriptive storage variable names. Leverage Cairo\'s storage annotations properly. Follow OpenZeppelin naming conventions.',
    severity: 'High',
    cweIds: ['CWE-662'],
    references: [
      'https://book.cairo-lang.org/ch99-00-starknet-smart-contracts.html#storage',
      'https://github.com/OpenZeppelin/cairo-contracts/blob/main/docs/modules/ROOT/pages/storage.adoc'
    ]
  },
  'CSR-008': {
    id: 'CSR-008',
    title: 'Unsafe Type Conversion',
    description: 'Using .into() for type conversions can panic if the value doesn\'t fit. Unchecked conversions between types can cause runtime failures or unexpected behavior.',
    remediation: 'Use .try_into() with proper error handling. Validate ranges before conversion. Handle Option<T> and Result<T, E> types appropriately.',
    severity: 'High',
    cweIds: ['CWE-704'],
    references: [
      'https://book.cairo-lang.org/ch02-02-data-types.html#type-casting',
      'https://book.cairo-lang.org/appendix-03-derivable-traits.html#into-and-tryinto'
    ]
  },
  'CSR-009': {
    id: 'CSR-009',
    title: 'Library Call to Untrusted Contract',
    description: 'library_call executes code in the caller\'s context, similar to delegatecall. Calling untrusted contracts can allow complete storage manipulation.',
    remediation: 'Only use library_call with audited, immutable library contracts. Validate library contract addresses. Consider if regular call_contract is sufficient.',
    severity: 'Critical',
    cweIds: ['CWE-829'],
    references: [
      'https://book.cairo-lang.org/ch99-01-03-02-contract-dispatcher-library-dispatcher-and-system-calls.html#library-calls',
      'https://docs.starknet.io/documentation/architecture_and_concepts/Smart_Contracts/system-calls/'
    ]
  },
  'CSR-010': {
    id: 'CSR-010',
    title: 'Missing Event Emission',
    description: 'State-changing operations should emit events for transparency and monitoring. Events are critical for indexing and off-chain tracking.',
    remediation: 'Emit events for all important state changes using self.emit(). Define events in the contract\'s Event enum. Follow ERC standards for token events.',
    severity: 'Low',
    cweIds: ['CWE-778'],
    references: [
      'https://book.cairo-lang.org/ch99-01-02-a-simple-contract.html#events',
      'https://github.com/OpenZeppelin/cairo-contracts/blob/main/src/token/erc20/interface.cairo'
    ]
  },
  'CSR-011': {
    id: 'CSR-011',
    title: 'Array Out of Bounds Access',
    description: 'Accessing array elements without bounds checking can cause panics. Using .at() or direct indexing without validation is dangerous.',
    remediation: 'Check array length before access: assert(index < array.len()). Use safe methods like .get() which returns Option. Validate all array indices.',
    severity: 'High',
    cweIds: ['CWE-787', 'CWE-119'],
    references: [
      'https://book.cairo-lang.org/ch03-01-arrays.html',
      'https://book.cairo-lang.org/ch04-02-understanding-ownership.html'
    ]
  },
  'CSR-012': {
    id: 'CSR-012',
    title: 'Unvalidated Input Parameters',
    description: 'External function parameters should be validated. Accepting arbitrary inputs without checks can lead to logic errors or exploits.',
    remediation: 'Add assertions or require-like checks for all inputs. Validate numerical ranges, address validity, array lengths, and enum values.',
    severity: 'Medium',
    cweIds: ['CWE-20'],
    references: [
      'https://docs.starknet.io/documentation/architecture_and_concepts/Smart_Contracts/security-considerations/',
      'https://github.com/OpenZeppelin/cairo-contracts/blob/main/src/security/pausable.cairo'
    ]
  },
  'CSR-013': {
    id: 'CSR-013',
    title: 'Missing Constructor Validation',
    description: 'Constructor parameters should be validated during initialization. Invalid initial state can compromise the entire contract lifecycle.',
    remediation: 'Validate all constructor parameters with assertions. Check addresses are non-zero, values are in valid ranges, and initial state is consistent.',
    severity: 'Medium',
    cweIds: ['CWE-665'],
    references: [
      'https://book.cairo-lang.org/ch99-01-03-01-contract-functions.html#the-constructor-function',
      'https://github.com/OpenZeppelin/cairo-contracts/blob/main/src/token/erc20/erc20.cairo'
    ]
  },
  'CSR-014': {
    id: 'CSR-014',
    title: 'Unchecked Arithmetic Operations',
    description: 'Arithmetic operations without overflow checking can wrap around or panic. Critical calculations must be protected against overflow/underflow.',
    remediation: 'Use checked arithmetic functions: checked_add, checked_sub, checked_mul. Handle overflow cases explicitly. Use appropriate sized integer types (u256, u128).',
    severity: 'High',
    cweIds: ['CWE-190', 'CWE-191'],
    references: [
      'https://book.cairo-lang.org/ch02-02-data-types.html#integer-types',
      'https://github.com/OpenZeppelin/cairo-contracts/blob/main/src/utils/math.cairo'
    ]
  },
  'CSR-015': {
    id: 'CSR-015',
    title: 'Improper Error Handling',
    description: 'Panics and errors should be handled gracefully. Unwrap() and expect() without proper context can cause contract failures.',
    remediation: 'Use Result<T, E> types with proper error handling. Provide descriptive error messages. Use match statements to handle both success and error cases.',
    severity: 'Medium',
    cweIds: ['CWE-703'],
    references: [
      'https://book.cairo-lang.org/ch09-02-recoverable-errors-with-result.html',
      'https://book.cairo-lang.org/ch02-00-common-programming-concepts.html'
    ]
  },
  'CSR-016': {
    id: 'CSR-016',
    title: 'Signature Replay Attack',
    description: 'Signed messages without nonces or unique identifiers can be replayed. This allows attackers to reuse valid signatures maliciously.',
    remediation: 'Include nonces, timestamps, or EIP-712 domain separators in signed data. Store used signatures to prevent replay. Use OpenZeppelin Account features.',
    severity: 'High',
    cweIds: ['CWE-294'],
    references: [
      'https://github.com/OpenZeppelin/cairo-contracts/tree/main/src/account',
      'https://docs.openzeppelin.com/contracts-cairo/0.8.0/accounts'
    ]
  },
  'CSR-017': {
    id: 'CSR-017',
    title: 'Insufficient Gas Griefing Protection',
    description: 'Loops with unbounded iterations can cause transactions to fail due to gas limits. External callers can manipulate state to increase gas costs.',
    remediation: 'Add iteration limits to loops. Implement pagination for large data sets. Use efficient data structures (mappings vs arrays).',
    severity: 'Medium',
    cweIds: ['CWE-400'],
    references: [
      'https://docs.starknet.io/documentation/architecture_and_concepts/Fees/fee_mechanism/',
      'https://book.cairo-lang.org/ch02-05-control-flow.html#repetition-with-loops'
    ]
  },
  'CSR-018': {
    id: 'CSR-018',
    title: 'Front-Running Vulnerability',
    description: 'Public transactions visible in mempool can be front-run. Critical operations may be exploited by malicious actors who submit transactions with higher fees.',
    remediation: 'Implement commit-reveal schemes for sensitive operations. Use batch processing. Consider deadline parameters for time-sensitive transactions.',
    severity: 'Medium',
    cweIds: ['CWE-362'],
    references: [
      'https://docs.starknet.io/documentation/architecture_and_concepts/Network_Architecture/transaction-life-cycle/',
      'https://community.starknet.io/t/front-running-and-mev-on-starknet/1492'
    ]
  },
  'CSR-019': {
    id: 'CSR-019',
    title: 'Improper Access to Storage',
    description: 'Direct storage access without proper getters/setters can bypass validation. Storage should be encapsulated with controlled access methods.',
    remediation: 'Use private storage with public getter/setter functions. Add validation in setters. Follow encapsulation principles from OpenZeppelin patterns.',
    severity: 'Medium',
    cweIds: ['CWE-485'],
    references: [
      'https://book.cairo-lang.org/ch99-00-starknet-smart-contracts.html#storage',
      'https://github.com/OpenZeppelin/cairo-contracts/blob/main/docs/modules/ROOT/pages/storage.adoc'
    ]
  },
  'CSR-020': {
    id: 'CSR-020',
    title: 'Missing Upgradability Considerations',
    description: 'Contracts without upgrade mechanisms cannot fix bugs. However, upgradable contracts need proper access control and storage layout management.',
    remediation: 'Use OpenZeppelin Upgrades pattern if upgradability is needed. Implement proper storage gaps. Secure upgrade functions with multi-sig or governance.',
    severity: 'Low',
    cweIds: ['CWE-656'],
    references: [
      'https://github.com/OpenZeppelin/cairo-contracts/tree/main/src/upgrades',
      'https://docs.openzeppelin.com/contracts-cairo/0.8.0/proxies'
    ]
  }
};

export function getCSRById(id: string): CSREntry | undefined {
  return CAIRO_SECURITY_REGISTRY[id];
}

export function getAllCSREntries(): CSREntry[] {
  return Object.values(CAIRO_SECURITY_REGISTRY);
}

export function getCSRBySeverity(severity: CSREntry['severity']): CSREntry[] {
  return getAllCSREntries().filter(entry => entry.severity === severity);
}
