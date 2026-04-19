import { detectLanguage } from './language-detector';

/**
 * Suggests a contract name based on code analysis
 * Extracts contract/class names from the code
 */
export function suggestContractName(code: string): string {
  if (!code || code.trim().length === 0) {
    return 'contract';
  }

  const detected = detectLanguage(code);
  const language = detected.language.toLowerCase();

  // Extract contract name based on language
  let contractName = extractNameByLanguage(code, language);

  if (!contractName) {
    contractName = 'contract';
  }

  return contractName;
}

/**
 * Suggests a filename with proper extension based on code
 */
export function suggestFileName(code: string): string {
  const name = suggestContractName(code);
  const detected = detectLanguage(code);
  const extension = getExtensionByLanguage(detected.language);
  return `${name}${extension}`;
}

function extractNameByLanguage(code: string, language: string): string {
  switch (language) {
    case 'solidity':
      return extractSolidityContractName(code);
    case 'vyper':
      return extractVyperContractName(code);
    case 'cairo':
      return extractCairoContractName(code);
    default:
      return '';
  }
}

function getExtensionByLanguage(language: string): string {
  const extensionMap: Record<string, string> = {
    solidity: '.sol',
    sol: '.sol',
    vyper: '.vy',
    vy: '.vy',
    cairo: '.cairo',
    py: '.vy',
    python: '.vy',
    rust: '.cairo',
  };
  return extensionMap[language.toLowerCase()] || '.sol';
}

/**
 * Extract Solidity contract name from code
 * Looks for: contract ContractName { }
 */
function extractSolidityContractName(code: string): string {
  // Match "contract ContractName" pattern
  const contractMatch = code.match(/contract\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
  if (contractMatch && contractMatch[1]) {
    return contractMatch[1];
  }

  // If no contract found, try to extract from interface or library
  const interfaceMatch = code.match(/interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
  if (interfaceMatch && interfaceMatch[1]) {
    return interfaceMatch[1];
  }

  const libraryMatch = code.match(/library\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
  if (libraryMatch && libraryMatch[1]) {
    return libraryMatch[1];
  }

  return '';
}

/**
 * Extract Vyper contract name from code
 * Looks for: @external or class definitions
 */
function extractVyperContractName(code: string): string {
  // Vyper is file-based, but we can look for class or interface definitions
  const interfaceMatch = code.match(/interface\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/);
  if (interfaceMatch && interfaceMatch[1]) {
    return interfaceMatch[1];
  }

  // Try to find a comment with contract name
  const commentMatch = code.match(/#\s*Contract:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/i);
  if (commentMatch && commentMatch[1]) {
    return commentMatch[1];
  }

  // Default for Vyper - use generic name
  return 'contract';
}

/**
 * Extract Cairo contract name from code
 * Looks for: Starknet contract patterns like: #[starknet::contract] mod ContractName
 */
function extractCairoContractName(code: string): string {
  // Starknet pattern: mod ModuleName after #[starknet::contract]
  const starknetMatch = code.match(/#\[starknet::contract\]\s*(?:\/\/.*\n)*\s*mod\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
  if (starknetMatch && starknetMatch[1]) {
    return starknetMatch[1];
  }

  // Fallback: Look for mod declaration anywhere
  const modMatch = code.match(/mod\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\{/);
  if (modMatch && modMatch[1]) {
    return modMatch[1];
  }

  // Try to find a comment with contract name
  const commentMatch = code.match(/#\s*Contract:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)/i);
  if (commentMatch && commentMatch[1]) {
    return commentMatch[1];
  }

  return 'contract';
}

/**
 * Sanitize a name to make it a valid filename
 */
export function sanitizeFileName(fileName: string): string {
  // Remove invalid characters
  return fileName
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, '_')
    .toLowerCase();
}
