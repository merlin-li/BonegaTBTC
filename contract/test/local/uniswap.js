const etherlime = require('etherlime-lib');
const BigNumber = require('bignumber.js');
const TestERC20 = require("../../build/TestERC20.json");

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

describe('Uniswap', () => {
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
    });

    it('reserves should be zero after initial', async () => {
        let pairAddr = await wrapper['uniswapV2Factory'].getPair(
            wrapper['dai'].contractAddress,
            wrapper['erc20Token1'].contractAddress,
        );
        let pairContract = deployer.wrapDeployedContract(UniswapV2Pair, pairAddr);
        let reserves = await pairContract.getReserves();
        assert.isTrue(reserves[0]._hex == '0x00');
        assert.isTrue(reserves[1]._hex == '0x00');
    });

    it('reserves should be changed after add liquidity', async () => {
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

        // check reserve
        let pairAddr = await wrapper['uniswapV2Factory'].getPair(
            wrapper['dai'].contractAddress,
            wrapper['erc20Token1'].contractAddress,
        );
        let pairContract = deployer.wrapDeployedContract(UniswapV2Pair, pairAddr);
        let reserves = await pairContract.getReserves();
        assert.isTrue(reserves[0]._hex == '0x0de0b6b3a7640000');
        assert.isTrue(reserves[1]._hex == '0x0de0b6b3a7640000');
    });
});

function etherToWei(amount) {
    return `${amount*1000}000000000000000`;
}
