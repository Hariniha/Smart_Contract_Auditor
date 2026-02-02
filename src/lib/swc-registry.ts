// SWC (Smart Contract Weakness) Registry Database
// Based on https://github.com/SmartContractSecurity/SWC-registry

export interface SWCEntry {
  id: string;
  title: string;
  relationships: string[];
  description: string;
  remediation: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  cweIds: string[];
}

export const SWC_REGISTRY: Record<string, SWCEntry> = {
  'SWC-100': {
    id: 'SWC-100',
    title: 'Function Default Visibility',
    relationships: ['CWE-710'],
    description: 'Functions that do not have a function visibility type specified are public by default. This can lead to a vulnerability if a developer forgot to set the visibility and a malicious user is able to make unauthorized or unintended state changes.',
    remediation: 'Functions should be specified as being external, public, internal or private. It is recommended to make a conscious decision on which visibility type is appropriate for a function.',
    severity: 'High',
    cweIds: ['CWE-710']
  },
  'SWC-101': {
    id: 'SWC-101',
    title: 'Integer Overflow and Underflow',
    relationships: ['CWE-682'],
    description: 'An overflow/underflow happens when an arithmetic operation reaches the maximum or minimum size of a type. For instance, if a number is stored in the uint8 type, it means that the number is stored in a 8 bits unsigned number ranging from 0 to 2^8-1. In computer programming, an integer overflow occurs when an arithmetic operation attempts to create a numeric value that is outside of the range that can be represented with a given number of bits.',
    remediation: 'It is recommended to use vetted safe math libraries for arithmetic operations consistently throughout the smart contract system.',
    severity: 'Critical',
    cweIds: ['CWE-682']
  },
  'SWC-102': {
    id: 'SWC-102',
    title: 'Outdated Compiler Version',
    relationships: ['CWE-937'],
    description: 'Using an outdated compiler version can be problematic especially if there are publicly disclosed bugs and issues that affect the current compiler version.',
    remediation: 'It is recommended to use a recent version of the Solidity compiler.',
    severity: 'Medium',
    cweIds: ['CWE-937']
  },
  'SWC-103': {
    id: 'SWC-103',
    title: 'Floating Pragma',
    relationships: ['CWE-664'],
    description: 'Contracts should be deployed with the same compiler version and flags that they have been tested with thoroughly. Locking the pragma helps to ensure that contracts do not accidentally get deployed using, for example, an outdated compiler version that might introduce bugs that affect the contract system negatively.',
    remediation: 'Lock the pragma version and also consider known bugs for the compiler version that is chosen.',
    severity: 'Low',
    cweIds: ['CWE-664']
  },
  'SWC-104': {
    id: 'SWC-104',
    title: 'Unchecked Call Return Value',
    relationships: ['CWE-252'],
    description: 'The return value of a message call is not checked. Execution will resume even if the called contract throws an exception. If the call fails accidentally or an attacker forces the call to fail, this may cause unexpected behaviour in the subsequent program logic.',
    remediation: 'If you choose to use low-level call methods, make sure to handle the possibility that the call will fail by checking the return value.',
    severity: 'High',
    cweIds: ['CWE-252']
  },
  'SWC-105': {
    id: 'SWC-105',
    title: 'Unprotected Ether Withdrawal',
    relationships: ['CWE-284'],
    description: 'Due to missing or insufficient access controls, malicious parties can withdraw some or all Ether from the contract account.',
    remediation: 'Implement controls so withdrawals can only be triggered by authorized parties or according to the specs of the smart contract system.',
    severity: 'Critical',
    cweIds: ['CWE-284']
  },
  'SWC-106': {
    id: 'SWC-106',
    title: 'Unprotected SELFDESTRUCT Instruction',
    relationships: ['CWE-284'],
    description: 'Due to missing or insufficient access controls, malicious parties can self-destruct the contract.',
    remediation: 'Consider removing the self-destruct functionality unless it is absolutely required. If there is a valid use-case, it is recommended to implement a multisig scheme so that multiple parties must approve the self-destruct action.',
    severity: 'Critical',
    cweIds: ['CWE-284']
  },
  'SWC-107': {
    id: 'SWC-107',
    title: 'Reentrancy',
    relationships: ['CWE-841'],
    description: 'One of the major dangers of calling external contracts is that they can take over the control flow. In the reentrancy attack (a.k.a. recursive call attack), a malicious contract calls back into the calling contract before the first invocation of the function is finished. This may cause the different invocations of the function to interact in undesirable ways.',
    remediation: 'The best practices to avoid Reentrancy weaknesses are: Make sure all internal state changes are performed before the call is executed. This is known as the Checks-Effects-Interactions pattern. Use a reentrancy lock (ie. OpenZeppelin\'s ReentrancyGuard).',
    severity: 'Critical',
    cweIds: ['CWE-841']
  },
  'SWC-108': {
    id: 'SWC-108',
    title: 'State Variable Default Visibility',
    relationships: ['CWE-710'],
    description: 'Labeling the visibility explicitly makes it easier to catch incorrect assumptions about who can access the variable.',
    remediation: 'Variables should be specified as being public, internal or private. It is recommended to make a conscious decision on which visibility type is appropriate for a variable.',
    severity: 'Medium',
    cweIds: ['CWE-710']
  },
  'SWC-109': {
    id: 'SWC-109',
    title: 'Uninitialized Storage Pointer',
    relationships: ['CWE-824'],
    description: 'Uninitialized local storage variables can point to unexpected storage locations in the contract, which can lead to intentional or unintentional vulnerabilities.',
    remediation: 'Check if the contract requires a storage object as in many situations this is actually not the case. If a local variable is sufficient, mark the storage location of the variable explicitly with the memory attribute.',
    severity: 'High',
    cweIds: ['CWE-824']
  },
  'SWC-110': {
    id: 'SWC-110',
    title: 'Assert Violation',
    relationships: ['CWE-670'],
    description: 'The Solidity assert() function is meant to assert invariants. Properly functioning code should never reach a failing assert statement. A reached assertion can mean one of two things: A bug exists in the contract that allows it to enter an invalid state; or You used assert() incorrectly.',
    remediation: 'Consider whether the condition checked in the assert() is actually an invariant. If not, replace the assert() statement with a require() statement.',
    severity: 'Medium',
    cweIds: ['CWE-670']
  },
  'SWC-111': {
    id: 'SWC-111',
    title: 'Use of Deprecated Solidity Functions',
    relationships: ['CWE-477'],
    description: 'Several functions and operators in Solidity are deprecated. Using them leads to reduced code quality. With new major versions of the Solidity compiler, deprecated functions and operators may result in side effects and compile errors.',
    remediation: 'Solidity provides alternatives to the deprecated constructions. Most of them are aliases, thus replacing old constructions will not break current behavior.',
    severity: 'Low',
    cweIds: ['CWE-477']
  },
  'SWC-112': {
    id: 'SWC-112',
    title: 'Delegatecall to Untrusted Callee',
    relationships: ['CWE-829'],
    description: 'There exists a special variant of a message call, named delegatecall which is identical to a message call apart from the fact that the code at the target address is executed in the context of the calling contract and msg.sender and msg.value do not change their values. This allows a smart contract to dynamically load code from a different address at runtime.',
    remediation: 'Use delegatecall with caution and make sure to never call into untrusted contracts. If the target address is derived from user input ensure to check it against a whitelist of trusted contracts.',
    severity: 'Critical',
    cweIds: ['CWE-829']
  },
  'SWC-113': {
    id: 'SWC-113',
    title: 'DoS with Failed Call',
    relationships: ['CWE-703'],
    description: 'External calls can fail accidentally or deliberately, which can cause a DoS condition in the contract. To minimize the damage caused by such failures, it is better to isolate each external call into its own transaction that can be initiated by the recipient of the call.',
    remediation: 'It is recommended to follow call best practices: Avoid combining multiple calls in a single transaction, especially when calls are executed as part of a loop. Always assume that external calls can fail. Implement the contract logic to handle failed calls.',
    severity: 'High',
    cweIds: ['CWE-703']
  },
  'SWC-114': {
    id: 'SWC-114',
    title: 'Transaction Order Dependence',
    relationships: ['CWE-362'],
    description: 'Race conditions can be forced on specific Ethereum transactions by monitoring the mempool. For example, the classic ERC20 approve() change can be front-run using this method.',
    remediation: 'A possible way to remedy for race conditions in ERC20 token contracts is to create a middleware contract that is not susceptible to race conditions.',
    severity: 'High',
    cweIds: ['CWE-362']
  },
  'SWC-115': {
    id: 'SWC-115',
    title: 'Authorization through tx.origin',
    relationships: ['CWE-477'],
    description: 'tx.origin is a global variable in Solidity which returns the address of the account that sent the transaction. Using the variable for authorization could make a contract vulnerable if an authorized account calls into a malicious contract.',
    remediation: 'tx.origin should not be used for authorization. Use msg.sender instead.',
    severity: 'High',
    cweIds: ['CWE-477']
  },
  'SWC-116': {
    id: 'SWC-116',
    title: 'Block values as a proxy for time',
    relationships: ['CWE-829'],
    description: 'Contracts often need access to time values to perform certain types of functionality. Values such as block.timestamp and block.number can give you a sense of the current time or a time delta, however, they are not safe to use for most purposes.',
    remediation: 'Developers should write smart contracts with the notion that block values are not precise, and the use of them can lead to unexpected effects.',
    severity: 'Medium',
    cweIds: ['CWE-829']
  },
  'SWC-117': {
    id: 'SWC-117',
    title: 'Signature Malleability',
    relationships: ['CWE-347'],
    description: 'The implementation of a cryptographic signature system in Ethereum contracts often assumes that the signature is unique, but signatures can be altered without the possession of the private key and still be valid.',
    remediation: 'Use OpenZeppelin\'s ECDSA library which includes this protection by default.',
    severity: 'Medium',
    cweIds: ['CWE-347']
  },
  'SWC-118': {
    id: 'SWC-118',
    title: 'Incorrect Constructor Name',
    relationships: ['CWE-665'],
    description: 'Before Solidity 0.4.22, the only way to define a constructor was to create a function with the same name as the contract class. A function meant to be a constructor becomes a normal function if its name doesn\'t exactly match the contract name.',
    remediation: 'Solidity version 0.4.22 introduces the constructor keyword. It is recommended to use the new constructor keyword to specify the constructor.',
    severity: 'Critical',
    cweIds: ['CWE-665']
  },
  'SWC-119': {
    id: 'SWC-119',
    title: 'Shadowing State Variables',
    relationships: ['CWE-710'],
    description: 'Solidity allows for ambiguous naming of state variables when inheritance is used. Contract A with a variable x could inherit contract B that also has a state variable x defined. This would result in two separate versions of x, one of which is accessed from contract A and one from contract B.',
    remediation: 'Review storage variable layouts for your contract systems carefully and remove any ambiguities. Always check for compiler warnings as they can flag the issue within a single contract.',
    severity: 'Medium',
    cweIds: ['CWE-710']
  },
  'SWC-120': {
    id: 'SWC-120',
    title: 'Weak Sources of Randomness from Chain Attributes',
    relationships: ['CWE-330'],
    description: 'Ability to generate random numbers is very helpful in many situations. One example is lotteries. But blockchain is deterministic, so how can we generate random numbers? Using block.timestamp, block.difficulty, block.number are not safe as these can be manipulated by miner.',
    remediation: 'Using external sources of randomness via oracles. Using commitment scheme, e.g. RANDAO. Using external sources of randomness via cryptographic protocols, such as VRF.',
    severity: 'High',
    cweIds: ['CWE-330']
  },
  'SWC-121': {
    id: 'SWC-121',
    title: 'Missing Protection against Signature Replay Attacks',
    relationships: ['CWE-347'],
    description: 'It is sometimes necessary to perform signature verification in smart contracts to achieve better usability or to save gas cost. A secure implementation needs to protect against replay attacks.',
    remediation: 'In order to protect against signature replay attacks, the contract should only be allowing new hashes to be processed. Users should be able to invalidate a signature after it has been used.',
    severity: 'High',
    cweIds: ['CWE-347']
  },
  'SWC-122': {
    id: 'SWC-122',
    title: 'Lack of Proper Signature Verification',
    relationships: ['CWE-345'],
    description: 'It is a common pattern for smart contract systems to allow users to sign messages off-chain instead of directly requesting users to do an on-chain transaction. The contract then verifies the signature and performs the action.',
    remediation: 'Use OpenZeppelin\'s ECDSA library for signature verification. Always check the return value of ecrecover. Never assume that a call to ecrecover will always return a valid address.',
    severity: 'Critical',
    cweIds: ['CWE-345']
  },
  'SWC-123': {
    id: 'SWC-123',
    title: 'Requirement Violation',
    relationships: ['CWE-573'],
    description: 'The Solidity require() construct is meant to validate external inputs of a function. In most cases, such external inputs are provided by callers, but they may also be returned by callees.',
    remediation: 'If the required logical condition is too strong, it should be weakened to allow all valid external inputs. Otherwise, the error condition should be handled by the contract.',
    severity: 'Medium',
    cweIds: ['CWE-573']
  },
  'SWC-124': {
    id: 'SWC-124',
    title: 'Write to Arbitrary Storage Location',
    relationships: ['CWE-123'],
    description: 'A smart contract\'s data (e.g., storing the owner of the contract) is persistently stored at some storage location (i.e., a key or address) on the EVM level. The contract is responsible for ensuring that only authorized user or contract accounts may write to sensitive storage locations.',
    remediation: 'As a general advice, given that all data structures share the same storage (address) space, one should make sure that writes to one data structure cannot inadvertently overwrite entries of another data structure.',
    severity: 'Critical',
    cweIds: ['CWE-123']
  },
  'SWC-125': {
    id: 'SWC-125',
    title: 'Incorrect Inheritance Order',
    relationships: ['CWE-696'],
    description: 'Solidity supports multiple inheritance, meaning that one contract can inherit several contracts. When a contract inherits from multiple contracts, only a single contract is created on the blockchain, and the code from all the base contracts is compiled into the created contract.',
    remediation: 'When inheriting multiple contracts, especially if they have identical functions, a developer should carefully specify inheritance in the correct order. The rule of thumb is to inherit contracts from more general to more specific.',
    severity: 'Medium',
    cweIds: ['CWE-696']
  },
  'SWC-126': {
    id: 'SWC-126',
    title: 'Insufficient Gas Griefing',
    relationships: ['CWE-691'],
    description: 'Insufficient gas griefing attacks can be performed on contracts which accept data and use it in a sub-call on another contract. If the sub-call fails, either the whole transaction is reverted, or execution is continued.',
    remediation: 'Only allow trusted users to relay transactions. Require that the forwarder provides enough gas.',
    severity: 'Medium',
    cweIds: ['CWE-691']
  },
  'SWC-127': {
    id: 'SWC-127',
    title: 'Arbitrary Jump with Function Type Variable',
    relationships: ['CWE-695'],
    description: 'Solidity supports function types. That is, a variable of function type can be assigned with a reference to a function with a matching signature. The function saved to such variable can be called just like a regular function.',
    remediation: 'The use of assembly should be minimal. A developer should not allow a user to assign arbitrary values to function type variables.',
    severity: 'High',
    cweIds: ['CWE-695']
  },
  'SWC-128': {
    id: 'SWC-128',
    title: 'DoS With Block Gas Limit',
    relationships: ['CWE-400'],
    description: 'When smart contracts are deployed or functions inside them are called, the execution of these actions always requires a certain amount of gas, based on how much computation is needed. The Ethereum network specifies a block gas limit.',
    remediation: 'Caution is advised when you expect to have large arrays that grow over time. Actions that require looping across the entire data structure should be avoided.',
    severity: 'High',
    cweIds: ['CWE-400']
  },
  'SWC-129': {
    id: 'SWC-129',
    title: 'Typographical Error',
    relationships: ['CWE-480'],
    description: 'A typographical error can occur for example when the intent of a defined operation is to add a value to a variable, but it has accidentally been defined in a way that it assigns a value instead.',
    remediation: 'The weakness can be avoided by performing pre-condition checks on any math operation or using a vetted library for arithmetic calculations such as SafeMath developed by OpenZeppelin.',
    severity: 'Medium',
    cweIds: ['CWE-480']
  },
  'SWC-130': {
    id: 'SWC-130',
    title: 'Right-To-Left-Override control character (U+202E)',
    relationships: ['CWE-451'],
    description: 'Malicious actors can use the Right-To-Left-Override unicode character to force RTL text rendering and confuse users as to the real intent of a contract.',
    remediation: 'There are very few legitimate uses of the U+202E character. It should not appear in the source code of a smart contract.',
    severity: 'High',
    cweIds: ['CWE-451']
  },
  'SWC-131': {
    id: 'SWC-131',
    title: 'Presence of unused variables',
    relationships: ['CWE-1164'],
    description: 'Unused variables are allowed in Solidity and they do not pose a direct security issue. It is best practice though to avoid them as they can cause confusion and increase gas costs.',
    remediation: 'Remove all unused variables from the code base.',
    severity: 'Low',
    cweIds: ['CWE-1164']
  },
  'SWC-132': {
    id: 'SWC-132',
    title: 'Unexpected Ether balance',
    relationships: ['CWE-667'],
    description: 'A contract can receive Ether via payable functions, receiving Ether sent with a contract creation, or as a recipient of a self-destruct. If the contract does not have any payable functions, it may still receive Ether from self-destruct.',
    remediation: 'Avoid strict equality checks for Ether balances in the contract.',
    severity: 'Medium',
    cweIds: ['CWE-667']
  },
  'SWC-133': {
    id: 'SWC-133',
    title: 'Hash Collisions With Multiple Variable Length Arguments',
    relationships: ['CWE-294'],
    description: 'Using abi.encodePacked() with multiple variable length arguments can, in certain situations, lead to a hash collision.',
    remediation: 'When using abi.encodePacked(), it\'s crucial to ensure that a matching signature cannot be achieved using different parameters. To do so, either do not allow parameters to be directly user-controllable, or use fixed length arrays.',
    severity: 'High',
    cweIds: ['CWE-294']
  },
  'SWC-134': {
    id: 'SWC-134',
    title: 'Message call with hardcoded gas amount',
    relationships: ['CWE-655'],
    description: 'The transfer() and send() functions forward a fixed amount of 2300 gas. Historically, it has often been recommended to use these functions for value transfers to guard against reentrancy attacks. However, the gas cost of EVM instructions may change significantly during hard forks.',
    remediation: 'Avoid the use of transfer() and send() and do not otherwise specify a fixed amount of gas when performing calls. Use .call.value(...)("") instead. Use the checks-effects-interactions pattern and/or reentrancy locks to prevent reentrancy attacks.',
    severity: 'Medium',
    cweIds: ['CWE-655']
  },
  'SWC-135': {
    id: 'SWC-135',
    title: 'Code With No Effects',
    relationships: ['CWE-1164'],
    description: 'In Solidity, it\'s possible to write code that does not produce the intended effects. Currently, the solidity compiler will not return a warning for effect-free code.',
    remediation: 'It\'s important to carefully ensure that your contract works as intended. Write unit tests to verify correct behavior of the code.',
    severity: 'Low',
    cweIds: ['CWE-1164']
  },
  'SWC-136': {
    id: 'SWC-136',
    title: 'Unencrypted Private Data On-Chain',
    relationships: ['CWE-767'],
    description: 'It is a common misconception that private type variables cannot be read. Even if your contract is not published, attackers can look at contract transactions to determine values stored in the state of the contract.',
    remediation: 'Any private data should either be stored off-chain, or carefully encrypted.',
    severity: 'High',
    cweIds: ['CWE-767']
  }
};

export function getSWCById(id: string): SWCEntry | undefined {
  return SWC_REGISTRY[id];
}

export function getAllSWCs(): SWCEntry[] {
  return Object.values(SWC_REGISTRY);
}

export function getSWCsBySeverity(severity: 'Critical' | 'High' | 'Medium' | 'Low'): SWCEntry[] {
  return Object.values(SWC_REGISTRY).filter(swc => swc.severity === severity);
}

export function getSWCByCWE(cweId: string): SWCEntry[] {
  return Object.values(SWC_REGISTRY).filter(swc => swc.cweIds.includes(cweId));
}
