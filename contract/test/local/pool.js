const etherlime = require('etherlime-lib');
const BigNumber = require('bignumber.js');
const TestERC20 = require("../../build/TestERC20.json");
const Pool = require("../../build/Pool.json");

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

describe('RebalancePool', () => {
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

        // deploy pool
        wrapper['pool'] = await deployer.deploy(
            Pool,
            {},
            wrapper['dai'].contractAddress,
            wrapper['erc20Token1'].contractAddress,
            wrapper['erc20Token2'].contractAddress,
            40,
            60,
            wrapper['UniswapV2Router02'].contractAddress,
        );
    });

    it('balance should be zero after initial', async () => {
        let balances = await wrapper['pool'].getTokenBalance();
        assert.isTrue(balances[0]._hex == '0x00');
        assert.isTrue(balances[1]._hex == '0x00');
    });

    it('tokenPercent should be correct after initial', async () => {
        let percents = await wrapper['pool'].getTokenPercent();
        assert.isTrue(percents[0]._hex == '0x058d15e176280000'); // 0x06f05b59d3b20000 == 0.4
        assert.isTrue(percents[1]._hex == '0x0853a0d2313c0000'); // 0x06f05b59d3b20000 == 0.6
    });

    it('price should be correct 1', async () => {
        // add liquidity
        await wrapper['dai'].from(owner.signer).approve(wrapper['UniswapV2Router02'].contractAddress, etherToWei(10000));
        await wrapper['erc20Token1'].from(owner.signer).approve(wrapper['UniswapV2Router02'].contractAddress, etherToWei(10000));
        await wrapper['UniswapV2Router02'].addLiquidity(
            wrapper['dai'].contractAddress,
            wrapper['erc20Token1'].contractAddress,
            etherToWei(1),
            etherToWei(1),
            0,
            0,
            MOCK_ADDRESS, // get liquidity token
            MAX_TIMESTAMP, // always not timeout
        );

        // check price
        let price = await wrapper['pool'].getPrice(wrapper['erc20Token1'].contractAddress);
        assert.isTrue(price._hex == '0x0de0b6b3a7640000'); // 0x0de0b6b3a7640000 == 1
    });

    it('price should be correct 2', async () => {
        // add liquidity
        await wrapper['dai'].from(owner.signer).approve(wrapper['UniswapV2Router02'].contractAddress, etherToWei(10000));
        await wrapper['erc20Token1'].from(owner.signer).approve(wrapper['UniswapV2Router02'].contractAddress, etherToWei(10000));
        await wrapper['UniswapV2Router02'].addLiquidity(
            wrapper['dai'].contractAddress,
            wrapper['erc20Token1'].contractAddress,
            etherToWei(2),
            etherToWei(1),
            0,
            0,
            MOCK_ADDRESS, // get liquidity token
            MAX_TIMESTAMP, // always not timeout
        );

        // check price
        let price = await wrapper['pool'].getPrice(wrapper['erc20Token1'].contractAddress);
        assert.isTrue(price._hex == '0x1bc16d674ec80000'); // 0x1bc16d674ec80000 == 2
    });

    it('price should be correct 3', async () => {
        // add liquidity
        await wrapper['dai'].from(owner.signer).approve(wrapper['UniswapV2Router02'].contractAddress, etherToWei(10000));
        await wrapper['erc20Token1'].from(owner.signer).approve(wrapper['UniswapV2Router02'].contractAddress, etherToWei(10000));
        await wrapper['UniswapV2Router02'].addLiquidity(
            wrapper['dai'].contractAddress,
            wrapper['erc20Token1'].contractAddress,
            etherToWei(1),
            etherToWei(2),
            0,
            0,
            MOCK_ADDRESS, // get liquidity token
            MAX_TIMESTAMP, // always not timeout
        );

        // check price
        let price = await wrapper['pool'].getPrice(wrapper['erc20Token1'].contractAddress);
        assert.isTrue(price._hex == '0x06f05b59d3b20000'); // 0x06f05b59d3b20000 == 0.5
    });
})

function etherToWei(amount) {
    return `${amount*1000}000000000000000`;
}
