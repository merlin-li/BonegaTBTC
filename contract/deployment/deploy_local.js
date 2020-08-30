const etherlime = require('etherlime-lib');
const Pool = require("../build/Pool.json");
const TestERC20 = require("../build/TestERC20.json");


const UniswapV2Factory = require('@uniswap/v2-core/build/UniswapV2Factory.json');
const UniswapV2Router02 = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');
UniswapV2Factory.contractName = "UniswapV2Factory";
UniswapV2Router02.contractName = "UniswapV2Router02";

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const MAX_TIMESTAMP = 9999999999;

const deploy = async (network, secret, etherscanApiKey) => {
    deployer = new etherlime.EtherlimeGanacheDeployer('0x7ab741b57e8d94dd7e1a29055646bafde7010f38a900f55bbd7647880faa6ee8');

    // deploy test erc20
    const tdaiContract = await deployer.deploy(TestERC20, {}, "TestDAI", "TDAI");
    const ttbtcContract = await deployer.deploy(TestERC20, {}, "TestTBTC", "TTBTC");
    const twethContract = await deployer.deploy(TestERC20, {}, "TestWETH", "TWETH");

    // deploy uniswap v2 router02
    const uniswapV2FactoryContract = await deployer.deploy(UniswapV2Factory, {}, ZERO_ADDRESS);
    const uniswapV2Router02Contract = await deployer.deploy(
        UniswapV2Router02,
        {},
        uniswapV2FactoryContract.contractAddress,
        ZERO_ADDRESS // ignore weth
    );

    // deploy deploy pool
    const poolContract = await deployer.deploy(
        Pool,
        {},
        tdaiContract.contractAddress,
        ttbtcContract.contractAddress,
        twethContract.contractAddress,
        80,
        20,
        uniswapV2Router02Contract.contractAddress,
    );

    // mint erc20 token and provide liquidity
    await tdaiContract.mint(etherToWei(100000000));
    await ttbtcContract.mint(etherToWei(1000));
    await twethContract.mint(etherToWei(100000));

    // provide liquidity for tdai/ttbtc
    await tdaiContract.approve(uniswapV2Router02Contract.contractAddress, etherToWei(2000000));
    await ttbtcContract.approve(uniswapV2Router02Contract.contractAddress, etherToWei(200));
    await uniswapV2Router02Contract.addLiquidity(
        tdaiContract.contractAddress,
        ttbtcContract.contractAddress,
        etherToWei(1000000),
        etherToWei(100),
        0,
        0,
        '0xAE27b065b7bDeC42f7E1A64dE12a489E4D51794F', // get liquidity token
        MAX_TIMESTAMP, // always not timeout
    );

    // provide liquidity for tdai/ttbtc
    await tdaiContract.approve(uniswapV2Router02Contract.contractAddress, etherToWei(8000000));
    await twethContract.approve(uniswapV2Router02Contract.contractAddress, etherToWei(20000));
    await uniswapV2Router02Contract.addLiquidity(
        tdaiContract.contractAddress,
        twethContract.contractAddress,
        etherToWei(4000000),
        etherToWei(10000),
        0,
        0,
        '0xAE27b065b7bDeC42f7E1A64dE12a489E4D51794F', // get liquidity token
        MAX_TIMESTAMP, // always not timeout
    );
};

module.exports = {
    deploy
};

function etherToWei(amount) {
    return `${amount}000000000000000000`;
}
