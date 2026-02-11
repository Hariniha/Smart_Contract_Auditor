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
  },

  vyper_vulnerable_bank: {
    name: 'Vyper Vulnerable Bank',
    code: `# @version ^0.3.7

balances: public(HashMap[address, uint256])

@external
@payable
def deposit():
    self.balances[msg.sender] += msg.value

@external
def withdraw(amount: uint256):
    assert self.balances[msg.sender] >= amount, "Insufficient balance"
    
    # Vulnerability: External call before state update
    send(msg.sender, amount)
    
    self.balances[msg.sender] -= amount

@external
@view
def get_balance() -> uint256:
    return self.balances[msg.sender]`,
    description: 'Vyper contract with reentrancy vulnerability'
  },

  vyper_secure_token: {
    name: 'Vyper Secure Token',
    code: `# @version ^0.3.7

name: public(String[32])
symbol: public(String[32])
decimals: public(uint8)
total_supply: public(uint256)
owner: public(address)
balances: HashMap[address, uint256]
allowances: HashMap[address, HashMap[address, uint256]]

event Transfer:
    sender: indexed(address)
    receiver: indexed(address)
    amount: uint256

event Approval:
    owner: indexed(address)
    spender: indexed(address)
    amount: uint256

@external
def __init__(initial_supply: uint256):
    self.name = "VyperToken"
    self.symbol = "VTK"
    self.decimals = 18
    self.owner = msg.sender
    self.total_supply = initial_supply * 10 ** convert(self.decimals, uint256)
    self.balances[msg.sender] = self.total_supply
    log Transfer(empty(address), msg.sender, self.total_supply)

@external
@view
def balance_of(account: address) -> uint256:
    return self.balances[account]

@external
def transfer(to: address, amount: uint256) -> bool:
    assert to != empty(address), "Invalid address"
    assert self.balances[msg.sender] >= amount, "Insufficient balance"
    
    self.balances[msg.sender] -= amount
    self.balances[to] += amount
    
    log Transfer(msg.sender, to, amount)
    return True`,
    description: 'Secure Vyper token implementation'
  },

  cairo_vulnerable_storage: {
    name: 'Cairo Vulnerable Storage',
    code: `#[starknet::contract]
mod VulnerableStorage {
    use starknet::ContractAddress;
    use starknet::get_caller_address;

    #[storage]
    struct Storage {
        owner: ContractAddress,
        balances: LegacyMap<ContractAddress, u256>,
    }

    #[constructor]
    fn constructor(ref self: ContractState, initial_owner: ContractAddress) {
        self.owner.write(initial_owner);
    }

    #[external(v0)]
    fn set_balance(ref self: ContractState, user: ContractAddress, amount: u256) {
        // Vulnerability: No access control
        self.balances.write(user, amount);
    }

    #[external(v0)]
    fn withdraw(ref self: ContractState, amount: u256) {
        let caller = get_caller_address();
        let balance = self.balances.read(caller);
        
        // Vulnerability: No zero check, no access control
        self.balances.write(caller, balance - amount);
    }

    #[external(v0)]
    fn get_balance(self: @ContractState, user: ContractAddress) -> u256 {
        self.balances.read(user)
    }
}`,
    description: 'Cairo contract with missing access controls'
  },

  cairo_secure_token: {
    name: 'Cairo Secure Token',
    code: `#[starknet::contract]
mod SecureToken {
    use starknet::ContractAddress;
    use starknet::get_caller_address;
    use starknet::contract_address_const;

    #[storage]
    struct Storage {
        name: felt252,
        symbol: felt252,
        decimals: u8,
        total_supply: u256,
        owner: ContractAddress,
        balances: LegacyMap<ContractAddress, u256>,
        allowances: LegacyMap<(ContractAddress, ContractAddress), u256>,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Transfer: Transfer,
        Approval: Approval,
    }

    #[derive(Drop, starknet::Event)]
    struct Transfer {
        from: ContractAddress,
        to: ContractAddress,
        value: u256,
    }

    #[derive(Drop, starknet::Event)]
    struct Approval {
        owner: ContractAddress,
        spender: ContractAddress,
        value: u256,
    }

    #[constructor]
    fn constructor(ref self: ContractState, initial_supply: u256) {
        self.name.write('CairoToken');
        self.symbol.write('CTK');
        self.decimals.write(18);
        self.owner.write(get_caller_address());
        self.total_supply.write(initial_supply);
        self.balances.write(get_caller_address(), initial_supply);
        
        self.emit(Transfer {
            from: contract_address_const::<0>(),
            to: get_caller_address(),
            value: initial_supply
        });
    }

    #[external(v0)]
    fn transfer(ref self: ContractState, to: ContractAddress, amount: u256) -> bool {
        let caller = get_caller_address();
        assert(!to.is_zero(), 'Invalid address');
        
        let caller_balance = self.balances.read(caller);
        assert(caller_balance >= amount, 'Insufficient balance');
        
        self.balances.write(caller, caller_balance - amount);
        self.balances.write(to, self.balances.read(to) + amount);
        
        self.emit(Transfer { from: caller, to: to, value: amount });
        true
    }

    #[external(v0)]
    fn balance_of(self: @ContractState, account: ContractAddress) -> u256 {
        self.balances.read(account)
    }
}`,
    description: 'Secure Cairo token with proper checks'
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
