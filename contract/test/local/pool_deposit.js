const etherlime = require('etherlime-lib');
const BigNumber = require('bignumber.js');
const TestERC20 = require("../../build/TestERC20.json");
const Pool = require("../../build/Pool.json");
const PoolToken = require("../../build/PoolToken.json");

// uniswap
const UniswapV2Pair = require('@uniswap/v2-core/build/UniswapV2Pair.json');
const UniswapV2Factory = require('@uniswap/v2-core/build/UniswapV2Factory.json');
const UniswapV2Router02 = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');
UniswapV2Pair.contractName = "UniswapV2Pair";
UniswapV2Factory.contractName = "UniswapV2Factory";
UniswapV2Router02.contractName = "UniswapV2Router02";

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const MOCK_ADDRESS = '0xAE27b065b7bDeC42f7E1A64dE12a489E4D51794F';
const MAX_TIMESTAMP = 9999999999;

describe('RebalancePool Deposit and Withdraw', () => {
    let deployer;
    let owner = accounts[0];
    let wrapper = {};

    beforeEach(async () => {
        deployer = new etherlime.EtherlimeGanacheDeployer(owner.secretKey);

        // test environment
        wrapper['uniswapV2Factory'] = await deployer.deploy(UniswapV2Factory, {}, ZERO_ADDRESS);
        wrapper['UniswapV2Router02'] = await deployer.deploy(
            UniswapV2Router02,
            {},
            wrapper['uniswapV2Factory'].contractAddress,
            ZERO_ADDRESS // ignore weth
        );
        wrapper['dai'] = await deployer.deploy(TestERC20, {}, "TestDai", "TDai");
        wrapper['erc20Token1'] = await deployer.deploy(TestERC20, {}, "erc20Token1", "ET1");
        wrapper['erc20Token2'] = await deployer.deploy(TestERC20, {}, "erc20Token2", "ET2");
        await wrapper['dai'].mint(etherToWei(1000000));
        await wrapper['erc20Token1'].mint(etherToWei(1000000));
        await wrapper['erc20Token2'].mint(etherToWei(1000000));

        // create uniswap pair
        await wrapper['uniswapV2Factory'].createPair(
            wrapper['dai'].contractAddress,
            wrapper['erc20Token1'].contractAddress,
        );
        await wrapper['uniswapV2Factory'].createPair(
            wrapper['dai'].contractAddress,
            wrapper['erc20Token2'].contractAddress,
        );

        // add uniswap liquidity
        await wrapper['dai'].from(owner.signer).approve(wrapper['UniswapV2Router02'].contractAddress, etherToWei(10000));
        await wrapper['erc20Token1'].from(owner.signer).approve(wrapper['UniswapV2Router02'].contractAddress, etherToWei(10000));
        await wrapper['erc20Token2'].from(owner.signer).approve(wrapper['UniswapV2Router02'].contractAddress, etherToWei(10000));
        await wrapper['UniswapV2Router02'].addLiquidity(
            wrapper['dai'].contractAddress,
            wrapper['erc20Token1'].contractAddress,
            etherToWei(1000),
            etherToWei(2000),
            0,
            0,
            MOCK_ADDRESS, // get liquidity token
            MAX_TIMESTAMP, // always not timeout
        );
        await wrapper['UniswapV2Router02'].addLiquidity(
            wrapper['dai'].contractAddress,
            wrapper['erc20Token2'].contractAddress,
            etherToWei(1000),
            etherToWei(4000),
            0,
            0,
            MOCK_ADDRESS, // get liquidity token
            MAX_TIMESTAMP, // always not timeout
        );

        // deploy pool
        wrapper['pool'] = await deployer.deploy(
            Pool,
            {},
            wrapper['dai'].contractAddress,
            wrapper['erc20Token1'].contractAddress,
            wrapper['erc20Token2'].contractAddress,
            50,
            50,
            wrapper['UniswapV2Router02'].contractAddress,
        );
    });

    it('deposit init', async () => {
        let balances = await wrapper['pool'].getTokenBalance();
        assert.isTrue(balances[0]._hex == '0x00');
        assert.isTrue(balances[1]._hex == '0x00');
    });

    it('deposit once', async () => {
        await wrapper['dai'].from(owner.signer).approve(wrapper['pool'].contractAddress, etherToWei(10));
        await wrapper['pool'].deposit(etherToWei(1));

        // check balance
        let balances = await wrapper['pool'].getTokenBalance();
        assert.isTrue(balances[0]._hex == '0x0dd44a6b807c2582'); // ≈ 1 * 10**18
        assert.isTrue(balances[1]._hex == '0x1ba894d700f84b05'); // ≈ 2 * 10**18

        // check rbt_balance
        let rbtAddr = await wrapper['pool'].getPoolToken();
        let rbtContract = await deployer.wrapDeployedContract(PoolToken, rbtAddr);
        let rbtBalance = await rbtContract.balanceOf(owner.signer.address);
        assert.isTrue(rbtBalance._hex == '0x0de0b6b3a7640000'); // = 1 * 10**18
    });

    it('deposit twice', async () => {
        await wrapper['dai'].from(owner.signer).approve(wrapper['pool'].contractAddress, etherToWei(10));
        await wrapper['pool'].deposit(etherToWei(1));
        await wrapper['pool'].deposit(etherToWei(1));

        // check balance
        let balances = await wrapper['pool'].getTokenBalance();
        assert.isTrue(balances[0]._hex == '0x1ba50cc9a0931845'); // ≈ 2 * 10**18
        assert.isTrue(balances[1]._hex == '0x374a19934126308f'); // ≈ 4 * 10**18

        // check rbt_balance
        let rbtAddr = await wrapper['pool'].getPoolToken();
        let rbtContract = await deployer.wrapDeployedContract(PoolToken, rbtAddr);
        let rbtBalance = await rbtContract.balanceOf(owner.signer.address);
        assert.isTrue(rbtBalance._hex == '0x1bca5635c139b38d'); // ≈ 2 * 10**18
    });

    it('withdraw all', async () => {
        // init
        await wrapper['dai'].from(owner.signer).approve(wrapper['pool'].contractAddress, etherToWei(10));
        await wrapper['pool'].deposit(etherToWei(1));

        // check baseTokenBalance
        let baseBalanceBefore = await wrapper['dai'].balanceOf(owner.signer.address);
        assert.isTrue(baseBalanceBefore._hex == '0xd355a25abaae3c5c0000'); // ≈ 997999 * 10**18

        // run
        await wrapper['pool'].withdraw(etherToWei(1));

        // check balance
        let balances = await wrapper['pool'].getTokenBalance();
        assert.isTrue(balances[0]._hex == '0x00');
        assert.isTrue(balances[1]._hex == '0x00');

        // check rbt_balance
        let rbtAddr = await wrapper['pool'].getPoolToken();
        let rbtContract = await deployer.wrapDeployedContract(PoolToken, rbtAddr);
        let rbtBalance = await rbtContract.balanceOf(owner.signer.address);
        assert.isTrue(rbtBalance._hex == '0x00');

        // check baseTokenBalance
        let baseBalanceAfter = await wrapper['dai'].balanceOf(owner.signer.address);
        assert.isTrue(baseBalanceBefore._hex == '0xd355a25abaae3c5c0000'); // ≈ 998000 * 10**18
    });

    it('withdraw half', async () => {
        // init
        await wrapper['dai'].from(owner.signer).approve(wrapper['pool'].contractAddress, etherToWei(10));
        await wrapper['pool'].deposit(etherToWei(2));

        // check baseTokenBalance
        let baseBalanceBefore = await wrapper['dai'].balanceOf(owner.signer.address);
        assert.isTrue(baseBalanceBefore._hex == '0xd355947a03fa94f80000'); // ≈ 997998 * 10**18

        // run
        await wrapper['pool'].withdraw(etherToWei(1));

        // check balance
        let balances = await wrapper['pool'].getTokenBalance();
        assert.isTrue(balances[0]._hex == '0x0dd287127ab151f0'); // ≈ 1 * 10**18
        assert.isTrue(balances[1]._hex == '0x1ba50e24f562a3e1'); // ≈ 2 * 10**18

        // check rbt_balance
        let rbtAddr = await wrapper['pool'].getPoolToken();
        let rbtContract = await deployer.wrapDeployedContract(PoolToken, rbtAddr);
        let rbtBalance = await rbtContract.balanceOf(owner.signer.address);
        assert.isTrue(rbtBalance._hex == '0x0de0b6b3a7640000'); // = 1 * 10**18

        // check baseTokenBalance
        let baseBalanceAfter = await wrapper['dai'].balanceOf(owner.signer.address);
        assert.isTrue(baseBalanceAfter._hex == '0xd355a24738672a3b3552'); // ≈ 997999 * 10**18
    });

    it('record value of per rebalance token', async () => {
        // deposit
        await wrapper['dai'].from(owner.signer).approve(wrapper['pool'].contractAddress, etherToWei(10));
        await wrapper['pool'].deposit(etherToWei(2));

        // record
        await assert.emitWithArgs(wrapper['pool'].recordValue(), "RecordTheValueOfPerRebalanceToken", ['997996999999999996']); // 约等于 10**18
    });
})

function etherToWei(amount) {
    return `${amount*1000}000000000000000`;
}
