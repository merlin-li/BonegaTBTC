// SPDX-License-Identifier: MIT

pragma solidity ^0.6.2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import '@uniswap/v2-periphery/contracts/libraries/UniswapV2OracleLibrary.sol';
import '@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol';
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';
import "./token.sol";

contract Pool {
    using SafeMath for uint256;

    PoolToken private _rbpToken; // shares token of rebalance's pool
    ERC20 private _baseToken; // the token for deposit and withdraw
    ERC20 private _token1;
    ERC20 private _token2;
    uint256 private _token1Percent;
    uint256 private _token2Percent;
    IUniswapV2Router02 private _uniswapV2Router02;

    event Deposit(address indexed who, uint256 amount, uint256 mintAmountOfRebalanceToken, uint256 balanceOfRebalanceToken);
    event Withdraw(address indexed who, uint256 amount, uint256 balanceOfRebalanceToken);
    event RecordTheValueOfPerRebalanceToken(uint256 value);

    constructor(
        ERC20 baseToken,
        ERC20 token1,
        ERC20 token2,
        uint256 token1Percent,
        uint256 token2Percent,
        IUniswapV2Router02 uniswapV2Router02
    ) public {
        _rbpToken = new PoolToken("Rebalance Pool Token", "RbpToken");
        _baseToken = baseToken;
        _token1 = token1;
        _token2 = token2;

        uint256 totalPercent = token1Percent.add(token2Percent);
        _token1Percent = token1Percent.mul(10**18).div(totalPercent);
        _token2Percent = token2Percent.mul(10**18).div(totalPercent);
        _uniswapV2Router02 = uniswapV2Router02;
    }

    function recordValue() external {
        uint256 totalSupply = _rbpToken.totalSupply();
        require(totalSupply > 0, "totalSupply is zero");
        (uint256 token1Value, uint256 token2Value) = getTokenValue();
        uint256 valueOfPerRebalanceToken = token1Value.add(token2Value).mul(10**18).div(totalSupply);

        emit RecordTheValueOfPerRebalanceToken(valueOfPerRebalanceToken);
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "The amount of toping up must be greater than 0");
        require(
            _baseToken.transferFrom(msg.sender, address(this), amount),
            "failed to transfer baseToken from sender"
        );

        (uint256 oldToken1Value, uint256 oldToken2Value) = getTokenValue();
        uint256 oldTotalValue = oldToken1Value.add(oldToken2Value);
        
        uint256 newTotalValue = amount.add(oldTotalValue);
        uint256 newToken1Value = newTotalValue.mul(_token1Percent).div(10**18);
        uint256 newToken2Value = newTotalValue.mul(_token2Percent).div(10**18);

        if(oldToken1Value < newToken1Value) {
            _buyToken(_token1, newToken1Value.sub(oldToken1Value));
        }
        if(oldToken2Value < newToken2Value) {
            _buyToken(_token2, newToken2Value.sub(oldToken2Value));
        }

        // mint poolToken
        uint256 totalSupply = _rbpToken.totalSupply();
        uint256 mintAmount = amount;
        if(oldTotalValue != 0 && totalSupply != 0) {
            uint256 percent = amount.mul(10**18).div(oldTotalValue);
            mintAmount = totalSupply.mul(percent).div(10**18);
        }
        _rbpToken.mint(msg.sender, mintAmount);
        uint256 balanceOfRebalanceToken = _rbpToken.balanceOf(msg.sender);

        emit Deposit(msg.sender, amount, mintAmount, balanceOfRebalanceToken);
    }

    function withdraw(uint256 amount) external {
        require(amount > 0, "amount of withdraw is zero");

        uint256 rbtTotalSupply = _rbpToken.totalSupply();
        uint256 token1Amount = _token1.balanceOf(address(this)).mul(amount).div(rbtTotalSupply);
        uint256 token2Amount = _token2.balanceOf(address(this)).mul(amount).div(rbtTotalSupply);

        _sellToken(_token1, token1Amount);
        _sellToken(_token2, token2Amount);

        uint256 baseTokenAmount = _baseToken.balanceOf(address(this));
        require(_baseToken.transfer(msg.sender, baseTokenAmount), "transfer baseToken failed");
        _rbpToken.burn(msg.sender, amount);
        uint256 balanceOfRebalanceToken = _rbpToken.balanceOf(msg.sender);

        emit Withdraw(msg.sender, baseTokenAmount, balanceOfRebalanceToken);
    }

    // view methods

    function getTokenBalance() public view returns (uint256, uint256) {
        return (
            _token1.balanceOf(address(this)),
            _token2.balanceOf(address(this))
        );
    }

    function getTokenName() public view returns (string memory, string memory) {
        return (_token1.name(), _token2.name());
    }

    function getTokenAddress() public view returns (address, address) {
        return (address(_token1), address(_token2));
    }

    function getTokenPercent() public view returns (uint256, uint256) {
        return (_token1Percent, _token2Percent);
    }

    function getTokenValue() public view returns (uint256, uint256) {
        uint256 token1Amount = _token1.balanceOf(address(this));
        uint256 token2Amount = _token2.balanceOf(address(this));
        uint256 token1Value = getPrice(_token1).mul(token1Amount).div(10**18);
        uint256 token2Value = getPrice(_token2).mul(token2Amount).div(10**18);

        return (token1Value, token2Value);
    }

    function getPrice(IERC20 token) public view returns(uint256) {
        // verify
        address tokenAddr = address(token);
        require(tokenAddr == address(_token1) || tokenAddr == address(_token2), "token is not in the pool");
        address baseTokenAddr = address(_baseToken);

        // special conditions
        if(tokenAddr == baseTokenAddr) {
            return 10**18;
        }

        // get price from uniswap
        IUniswapV2Factory factory = IUniswapV2Factory(_uniswapV2Router02.factory());
        IUniswapV2Pair pair = IUniswapV2Pair(factory.getPair(tokenAddr, baseTokenAddr));
        (uint256 token1Amount, uint256 token2Amount,) = pair.getReserves();
        if(tokenAddr < baseTokenAddr) {
            return token2Amount.mul(10**18).div(token1Amount);
        } else {
            return token1Amount.mul(10**18).div(token2Amount);
        }
    }

    function getPoolToken() public view returns (address) {
        return address(_rbpToken);
    }

    function getPoolTokenBalance(address addr) public view returns (uint256) {
        return _rbpToken.balanceOf(addr);
    }

    // private

    function _buyToken(IERC20 token, uint256 baseAmount) internal {
        require(address(token) == address(_token1) || address(token) == address(_token2), "token is not in the pool");
        require(baseAmount > 0, "baseAmount is zero");

        // special conditions
        if(address(token) == address(_baseToken)) {
            return;
        }

        // execute
        address[] memory path = new address[](2);
        path[0] = address(_baseToken);
        path[1] = address(token);

        uint256 baseBalance = _baseToken.balanceOf(address(this));
        require(baseAmount <= baseBalance, "baseAmount is more than baseBalance");
        require(
            _baseToken.approve(address(_uniswapV2Router02), baseAmount),
            "token approve failed."
        );
        _uniswapV2Router02.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            baseAmount,
            0, // any number
            path,
            address(this),
            now + 60
        );
    }

    function _sellToken(IERC20 token, uint256 amount) internal {
        require(address(token) == address(_token1) || address(token) == address(_token2), "token is not in the pool");
        require(amount > 0, "amount for selling is zero");

        // special conditions
        if(address(token) == address(_baseToken)) {
            return;
        }

        address[] memory path = new address[](2);
        path[0] = address(token);
        path[1] = address(_baseToken);

        require(
            token.approve(address(_uniswapV2Router02), amount),
            "token approve failed"
        );
        _uniswapV2Router02.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            amount,
            0, // any number
            path,
            address(this),
            now + 60
        );
    }
}
