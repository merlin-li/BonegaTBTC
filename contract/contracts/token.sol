// SPDX-License-Identifier: MIT

pragma solidity ^0.6.2;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * ERC20 contract.
 */
contract PoolToken is ERC20, Ownable {
    constructor (string memory name, string memory symbol) public ERC20(name, symbol) {}

    function mint(address owner, uint256 amount) public onlyOwner {
        _mint(owner, amount);
    }

    function burn(address owner, uint256 amount) public onlyOwner {
        _burn(owner, amount);
    }
}
