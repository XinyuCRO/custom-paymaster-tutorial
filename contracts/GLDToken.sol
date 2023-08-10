// contracts/GLDToken.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import '@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
// import '@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol';


contract GLDToken is ERC20 {
    constructor (string memory name, string memory symbol, uint8 decimals)
        public
        ERC20(name, symbol)
    {
        _mint(msg.sender, 10000000000000000000000000000000000);
    }

}