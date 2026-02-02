// Sample Smart Contracts for Testing

export const SAMPLE_CONTRACTS = {
  vulnerable_reentrancy: {
    name: 'Vulnerable Bank (Reentrancy)',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

contract VulnerableBank {
    mapping(address => uint256) public balances;
    
    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }
    
    function withdraw(uint256 _amount) public {
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        
        // Vulnerability: External call before state update
        (bool success, ) = msg.sender.call{value: _amount}("");
        require(success, "Transfer failed");
        
        balances[msg.sender] -= _amount;
    }
    
    function getBalance() public view returns (uint256) {
        return balances[msg.sender];
    }
}`,
    description: 'Classic reentrancy vulnerability - state updated after external call'
  },

  unprotected_functions: {
    name: 'Unprotected Contract',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract UnprotectedContract {
    address public owner;
    uint256 public balance;
    
    constructor() {
        owner = msg.sender;
    }
    
    // Vulnerability: No access control on critical function
    function withdrawAll() public {
        payable(msg.sender).transfer(address(this).balance);
    }
    
    // Vulnerability: selfdestruct without protection
    function destroy() public {
        selfdestruct(payable(msg.sender));
    }
    
    receive() external payable {
        balance += msg.value;
    }
}`,
    description: 'Missing access controls on critical functions'
  },

  integer_overflow: {
    name: 'Integer Overflow',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.4.24;

contract IntegerVulnerable {
    mapping(address => uint256) public balances;
    
    function deposit() public payable {
        // Vulnerability: No SafeMath in Solidity < 0.8.0
        balances[msg.sender] += msg.value;
    }
    
    function transfer(address _to, uint256 _amount) public {
        require(balances[msg.sender] >= _amount);
        
        // Vulnerability: Potential overflow
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
    }
}`,
    description: 'Integer overflow vulnerability in older Solidity version'
  },

  secure_contract: {
    name: 'Secure Token (Best Practices)',
    code: `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SecureToken {
    string public name = "SecureToken";
    string public symbol = "STK";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    
    address public owner;
    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowances;
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor(uint256 _initialSupply) {
        owner = msg.sender;
        totalSupply = _initialSupply * 10 ** uint256(decimals);
        balances[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }
    
    function balanceOf(address _account) external view returns (uint256) {
        return balances[_account];
    }
    
    function transfer(address _to, uint256 _amount) external returns (bool) {
        require(_to != address(0), "Invalid address");
        require(balances[msg.sender] >= _amount, "Insufficient balance");
        
        balances[msg.sender] -= _amount;
        balances[_to] += _amount;
        
        emit Transfer(msg.sender, _to, _amount);
        return true;
    }
    
    function approve(address _spender, uint256 _amount) external returns (bool) {
        require(_spender != address(0), "Invalid address");
        
        allowances[msg.sender][_spender] = _amount;
        emit Approval(msg.sender, _spender, _amount);
        return true;
    }
    
    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) external returns (bool) {
        require(_from != address(0), "Invalid from address");
        require(_to != address(0), "Invalid to address");
        require(balances[_from] >= _amount, "Insufficient balance");
        require(allowances[_from][msg.sender] >= _amount, "Insufficient allowance");
        
        balances[_from] -= _amount;
        balances[_to] += _amount;
        allowances[_from][msg.sender] -= _amount;
        
        emit Transfer(_from, _to, _amount);
        return true;
    }
    
    function allowance(address _owner, address _spender) external view returns (uint256) {
        return allowances[_owner][_spender];
    }
}`,
    description: 'Well-structured ERC20 token following best practices'
  }
};

export function getSampleContract(key: string) {
  return SAMPLE_CONTRACTS[key as keyof typeof SAMPLE_CONTRACTS];
}

export function getAllSamples() {
  return Object.entries(SAMPLE_CONTRACTS).map(([key, value]) => ({
    key,
    ...value
  }));
}
