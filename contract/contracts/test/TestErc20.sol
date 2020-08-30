// SPDX-License-Identifier: MIT

pragma solidity ^0.6.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * ERC20 test contract.
 */
contract TestERC20 is ERC20 {
    constructor (string memory _name, string memory _symbol) public ERC20(_name, _symbol) {}

    function mint(uint256 amount) public {
        _mint(msg.sender, amount);
    }
}
