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

describe('RebalancePool Ropsten', () => {
    let deployer;
    let owner = accounts[0];
    let wrapper = {};

    beforeEach(async () => {
        deployer = new etherlime.InfuraPrivateKeyDeployer(
            'de5be27a356230fa6586bed5b6ae68e2d7214a17eb7bb294c75be66d54a16cb1',
            'ropsten',
            '370aeba2cd514a73919d8afeddaf7c7f',
            { gasPrice: '0x2e90edd000' }
        );

        wrapper['tdai'] = await deployer.wrapDeployedContract(TestERC20, "0x934c5632F582770AD6849bc20C5cB35Fa1E9D293");
        wrapper['ttbtc'] = await deployer.wrapDeployedContract(TestERC20, "0x4Ce5d3Dc90ad48D3186B15A2596e1F3F6D559fc2");
        wrapper['tweth'] = await deployer.wrapDeployedContract(TestERC20, "0x06f750605E8A8a03b457F26dD0bFE14A4C87b417");
        wrapper['uniswapV2Router02'] = await deployer.wrapDeployedContract(UniswapV2Router02, '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');
        wrapper['pool'] = await deployer.wrapDeployedContract(Pool, '0x04A7A64a0e7105A0BCEe30EF2AAB053FA6583C52');
    });

    it('pool getReserves', async () => {
        let factoryAddr = await wrapper['uniswapV2Router02'].factory();
        wrapper['factory'] = await deployer.wrapDeployedContract(UniswapV2Factory, factoryAddr);

        let ttbtcDaiPairAddr = await wrapper['factory'].getPair(
            wrapper['ttbtc'].contractAddress,
            wrapper['tdai'].contractAddress,
        );
        wrapper['ttbtc_tdai_pair'] = await deployer.wrapDeployedContract(UniswapV2Pair, ttbtcDaiPairAddr);
        console.log(`ttbtc_tdai_pair: `, await wrapper['ttbtc_tdai_pair'].getReserves());

        let twethDaiPairAddr = await wrapper['factory'].getPair(
            wrapper['tweth'].contractAddress,
            wrapper['tdai'].contractAddress,
        );
        wrapper['tweth_tdai_pair'] = await deployer.wrapDeployedContract(UniswapV2Pair, twethDaiPairAddr);
        console.log(`tweth_tdai_pair: `, await wrapper['tweth_tdai_pair'].getReserves());
    });

    it('pool reserves', async () => {
        let poolTokenAddr = await wrapper['pool'].getPoolToken();
        wrapper['poolToken'] = await deployer.wrapDeployedContract(PoolToken, poolTokenAddr);

        console.log('poolToken balance before: ', await wrapper['poolToken'].balanceOf('0xAE27b065b7bDeC42f7E1A64dE12a489E4D51794F'));
        console.log('pool reserves: ', await wrapper['pool'].getTokenBalance());
    });

    it('pool deposit', async () => {
        let poolTokenAddr = await wrapper['pool'].getPoolToken();
        wrapper['poolToken'] = await deployer.wrapDeployedContract(PoolToken, poolTokenAddr);

        // run
        await wrapper['tdai'].approve(wrapper['pool'].contractAddress, etherToWei(10000));
        await wrapper['pool'].deposit(etherToWei(100));
    });

    it('pool withdraw', async () => {
        let poolTokenAddr = await wrapper['pool'].getPoolToken();
        wrapper['poolToken'] = await deployer.wrapDeployedContract(PoolToken, poolTokenAddr);
        await wrapper['pool'].withdraw(etherToWei(100));
    });

    it('record value', async () => {
        await wrapper['pool'].recordValue();
    });
})

function etherToWei(amount) {
    return `${amount*1000}000000000000000`;
}
