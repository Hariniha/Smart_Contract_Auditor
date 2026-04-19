/**
 * AI-SPECIFIC VULNERABILITY PATTERNS
 * 
 * These are vulnerabilities that AI should detect via semantic/contextual analysis
 * but are NOT covered by static pattern matching in the base analyzers.
 * 
 * Purpose: Ensure AI finds different/complementary issues than static analysis
 * Deduplication: Will be filtered if they match static finding (exact name + CWE match)
 * 
 * Strategy:
 * - Static patterns catch: Obvious code patterns (e.g., missing onlyOwner, selfdestruct)
 * - AI patterns catch: Logic errors, context-dependent issues, complex vulnerabilities
 */

export const SOLIDITY_AI_SPECIFIC_PATTERNS = [
  {
    name: 'Logic Error in Conditional Access',
    cwe: 'CWE-697',
    description: 'Complex conditional logic that unintentionally grants unauthorized access to sensitive functions. Requires context analysis to detect.',
    detectionHints: [
      'Multiple conditions that should be AND but are OR',
      'inverted logic (isNotOwner instead of isOwner)',
      'conditions checking wrong state variable',
      'role-based access with incorrect enum/state comparisons'
    ]
  },
  {
    name: 'Integer Arithmetic Edge Case',
    cwe: 'CWE-190',
    description: 'Overflow/underflow or precision loss in arithmetic operations not caught by overflow checks. Includes gas optimization tricks that reduce safety.',
    detectionHints: [
      'scaled arithmetic with potential precision loss',
      'unchecked math blocks with complex operations',
      'type casting that may cause precision issues',
      'division before multiplication (precision loss)'
    ]
  },
  {
    name: 'State Transition Race Condition',
    cwe: 'CWE-362',
    description: 'Functions that can be called in unexpected order causing logic errors. Requires sequence analysis.',
    detectionHints: [
      'initialization flags that can be reset',
      'state machine with missing transition validation',
      'functions that modify state dependencies in wrong order',
      'withdraw before approve patterns'
    ]
  },
  {
    name: 'Timestamp Dependency Exploit',
    cwe: 'CWE-829',
    description: 'Functions using block.timestamp for critical decisions without recognizing that miners can manipulate it. Not a simple pattern match.',
    detectionHints: [
      'block.timestamp in critical comparisons without buffer',
      'time-locked mechanisms vulnerable to manipulation',
      'lottery/randomness based on block.timestamp'
    ]
  },
  {
    name: 'Complex External Call Dependency Chain',
    cwe: 'CWE-95',
    description: 'Chained external calls where failure of one call compromises contract state in non-obvious way.',
    detectionHints: [
      'multiple external calls without proper error handling',
      'state changes dependent on multiple external results',
      'missing response validation for low-level calls',
      'callback functions that modify critical state'
    ]
  },
  {
    name: 'Insufficient Input Validation in Complex Context',
    cwe: 'CWE-20',
    description: 'Input validation logic that appears correct but fails in edge cases or with specific combinations.',
    detectionHints: [
      'range checks missing boundary conditions',
      'array length validation without overflow checks',
      'address validation that accepts zero address in certain paths',
      'amount validation that depends on caller (can be manipulated)'
    ]
  },
  {
    name: 'Function Visibility Misclassification',
    cwe: 'CWE-488',
    description: 'Functions with wrong visibility (marked public when should be external, or vice versa) enabling unintended calls.',
    detectionHints: [
      'public function that only calls other public functions (should be external)',
      'internal functions callable through complex delegation patterns',
      'fallback function with unexpected behavior'
    ]
  },
  {
    name: 'Storage Layout Collision in Proxy Pattern',
    cwe: 'CWE-489',
    description: 'Proxy upgrade patterns where storage layout changes cause collisions or data corruption.',
    detectionHints: [
      'Storage variable reordering between versions',
      'delegatecall with incompatible storage layouts',
      'missing __gap array in upgradeable contracts',
      'inheritance order changes affecting storage'
    ]
  },
  {
    name: 'Gas Limit Denial of Service',
    cwe: 'CWE-400',
    description: 'Operations that scale with user input or unbounded loops causing gas exhaustion attacks.',
    detectionHints: [
      'loops iterating over dynamic arrays without bounds',
      'nested loops with user-controlled sizes',
      'state-clearing operations without size limits',
      'batch operations without pagination limits'
    ]
  },
  {
    name: 'Cryptographic Randomness Prediction',
    cwe: 'CWE-338',
    description: 'Functions using inadequate randomness source (blockhash, timestamp, tx properties) that can be predicted by attackers.',
    detectionHints: [
      'keccak256 with only blockchain data as input',
      'randomness not using external oracle',
      'random selection from predictable sources',
      'insufficient entropy in random number generation'
    ]
  }
];

export const CAIRO_AI_SPECIFIC_PATTERNS = [
  {
    name: 'Implicit Integer Overflow in Field Arithmetic',
    cwe: 'CWE-190',
    description: 'Cairo arithmetic is in a finite field - operations wrap silently. AI detects logic that assumes normal arithmetic.',
    detectionHints: [
      'subtraction without checking if result is positive',
      'division in modular arithmetic without field validation',
      'magnitude comparisons that overflow in field context'
    ]
  },
  {
    name: 'Unvalidated External Input from Calldata',
    cwe: 'CWE-20',
    description: 'Cairo contracts not validating calldata input ranges in field arithmetic context.',
    detectionHints: [
      'function parameters not checked against field size',
      'array indices from user input without bounds',
      'user-provided amounts not validated for field overflow'
    ]
  },
  {
    name: 'Storage Write Without Consistency Check',
    cwe: 'CWE-476',
    description: 'Cairo storage operations that don\'t verify write actually occurred or read-after-write validation.',
    detectionHints: [
      'storage_write without subsequent verification',
      'bulk updates without state consistency checks',
      'missing storage write order dependency validation'
    ]
  },
  {
    name: 'Hint Validation Bypass',
    cwe: 'CWE-693',
    description: 'Cairo hints that compute values without proper verification against constraints.',
    detectionHints: [
      'hints used to compute function results',
      'missing assert statements after hint computation',
      'hints accessing contract state without verification'
    ]
  },
  {
    name: 'Implicit Type Conversion Vulnerability',
    cwe: 'CWE-681',
    description: 'Cairo type conversions between felt and other types that lose information silently.',
    detectionHints: [
      'felt to uint256 conversions without range check',
      'tuple unpacking with type mismatches',
      'contract address manipulation through type conversion'
    ]
  },
  {
    name: 'Recursive Call State Corruption',
    cwe: 'CWE-674',
    description: 'Recursive Cairo functions that may corrupt state due to call depth or memory issues.',
    detectionHints: [
      'recursive functions accessing shared storage',
      'recursive calls modifying local state improperly',
      'missing base case or infinite recursion patterns'
    ]
  },
  {
    name: 'Permutation Argument Validation Failure',
    cwe: 'CWE-697',
    description: 'Cairo cryptographic proofs with incomplete permutation argument validation.',
    detectionHints: [
      'incomplete range proofs',
      'memory validity not fully checked',
      'permutation arguments with gaps in coverage'
    ]
  },
  {
    name: 'StarkNet Account Abstraction Misuse',
    cwe: 'CWE-269',
    description: 'Incorrect implementation of account abstraction patterns on StarkNet.',
    detectionHints: [
      'validate function not properly checking signatures',
      'nonce replay vulnerabilities in execute',
      'missing msg.sender propagation in sub-calls',
      '__execute__ bypass patterns'
    ]
  },
  {
    name: 'Unfelt Value Injection',
    cwe: 'CWE-95',
    description: 'Functions that treat arbitrary felt values as special types without validation.',
    detectionHints: [
      'enum values not bounds-checked',
      'boolean represented as felt without validation',
      'status codes from external calls not validated'
    ]
  },
  {
    name: 'Witness Commitment Misalignment',
    cwe: 'CWE-347',
    description: 'Cairo proofs where private inputs don\'t match public commitments due to logic errors.',
    detectionHints: [
      'public input hash computed incorrectly',
      'mismatch between prover input and verifier expectation',
      'state commitment without integrity checks'
    ]
  }
];

export const VYPER_AI_SPECIFIC_PATTERNS = [
  {
    name: 'Mutable Default Argument Side Effect',
    cwe: 'CWE-562',
    description: 'Vyper mutable default arguments that are shared across calls causing unexpected state mutations.',
    detectionHints: [
      'default array arguments modified in function',
      'default mapping arguments with side effects',
      'shared state through default parameters'
    ]
  },
  {
    name: 'Decimal Precision Loss in Fixed-Point Math',
    cwe: 'CWE-190',
    description: 'Vyper fixed-point operations losing precision in complex calculations.',
    detectionHints: [
      'scaled_amount operations losing decimal places',
      'division operations on decimal values',
      'precision loss through type conversions'
    ]
  },
  {
    name: 'Event Log Ordering Assumption',
    cwe: 'CWE-20',
    description: 'Logic depending on event ordering that doesn\'t account for transaction ordering in mempool.',
    detectionHints: [
      'functions dependent on previous event existence',
      'state recovery from event logs with ordering assumptions',
      'missing event version/nonce for ordering'
    ]
  },
  {
    name: 'Interface Implementation Incomplete',
    cwe: 'CWE-395',
    description: 'Vyper contracts claiming interface compliance but missing critical methods.',
    detectionHints: [
      'implements interface without all methods',
      'method signature mismatch with interface',
      'missing required return values'
    ]
  },
  {
    name: 'Loop Bounds Dependency on Contract State',
    cwe: 'CWE-400',
    description: 'For loops using contract state as bounds that can be manipulated.',
    detectionHints: [
      'loop range dependent on user-controlled state',
      'array length used in loop without checking',
      'nested loops with state-dependent bounds'
    ]
  },
  {
    name: 'Memory Array Bounds Confusion',
    cwe: 'CWE-119',
    description: 'Vyper memory arrays with off-by-one errors or incorrect bounds checking.',
    detectionHints: [
      'array access beyond declared length',
      'pop() on empty array assumptions',
      'array length modification during iteration'
    ]
  },
  {
    name: 'Vyper Optimizer Side Effect',
    cwe: 'CWE-99',
    description: 'Code patterns that behave differently when optimizer is enabled/disabled.',
    detectionHints: [
      'boundary condition arithmetic that changes with optimization',
      'short-circuit evaluation assumptions',
      'dead code removal affecting control flow'
    ]
  },
  {
    name: 'External Library Call Validation Missing',
    cwe: 'CWE-395',
    description: 'Vyper contracts calling external libraries without validating return values.',
    detectionHints: [
      'library call return value ignored',
      'missing response validation for external calls',
      'unchecked status codes from library functions'
    ]
  },
  {
    name: 'Vyper Version Incompatibility',
    cwe: 'CWE-99',
    description: 'Code patterns that are safe in one Vyper version but unsafe in another.',
    detectionHints: [
      'deprecated function usage',
      'version-dependent behavior changes',
      'breaking changes in Vyper release transitions'
    ]
  },
  {
    name: 'Immutable Variable Initialization Bypass',
    cwe: 'CWE-909',
    description: 'Patterns where immutable variables can be set multiple times or not initialized properly.',
    detectionHints: [
      'immutable variable set outside init',
      'conditional initialization of immutables',
      'immutable variable type conversion vulnerabilities'
    ]
  }
];

/**
 * Integration Instructions:
 * 
 * 1. Add these patterns to performFullAIAnalysis() in groq-service.ts
 * 2. Create dynamic prompt that includes these patterns
 * 3. AI focus on finding issues matching these patterns
 * 4. Static analyzer patterns should NOT overlap with these
 * 5. Deduplication will filter AI findings that match static findings
 * 
 * Example Prompt Modification (add to performFullAIAnalysis):
 * 
 * const languagePatterns = {
 *   solidity: SOLIDITY_AI_SPECIFIC_PATTERNS,
 *   cairo: CAIRO_AI_SPECIFIC_PATTERNS,
 *   vyper: VYPER_AI_SPECIFIC_PATTERNS
 * }[language] || [];
 * 
 * const patternsList = languagePatterns
 *   .map(p => `- ${p.name}: ${p.description}`)
 *   .join('\n');
 * 
 * // Add to prompt:
 * // "Focus on detecting these specific vulnerability patterns (not caught by static analysis):\n${patternsList}"
 */
