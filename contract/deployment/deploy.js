const etherlime = require('etherlime-lib');
const Pool = require("../build/Pool.json");
const TestERC20 = require("../build/TestERC20.json");

const UniswapV2Router02 = require('@uniswap/v2-periphery/build/UniswapV2Router02.json');
UniswapV2Router02.contractName = "UniswapV2Router02";

const MAX_TIMESTAMP = 9999999999;

const deploy = async (network, secret, etherscanApiKey) => {

    const deployer = new etherlime.InfuraPrivateKeyDeployer(
        'private key',
        'network',
        'infura private key',
    );

    // deploy test erc20
    // const tdaiContract = await deployer.deploy(TestERC20, {}, "TestDAI", "TDAI");
    // const ttbtcContract = await deployer.deploy(TestERC20, {}, "TestTBTC", "TTBTC");
    // const twethContract = await deployer.deploy(TestERC20, {}, "TestWETH", "TWETH");
    const tdaiContract = await deployer.wrapDeployedContract(TestERC20, "0x934c5632F582770AD6849bc20C5cB35Fa1E9D293");
    const ttbtcContract = await deployer.wrapDeployedContract(TestERC20, "0x4Ce5d3Dc90ad48D3186B15A2596e1F3F6D559fc2");
    const twethContract = await deployer.wrapDeployedContract(TestERC20, "0x06f750605E8A8a03b457F26dD0bFE14A4C87b417");

    // deploy uniswap v2 router02
    const uniswapV2Router02Contract = await deployer.wrapDeployedContract(UniswapV2Router02, '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D');

    // // deploy deploy pool
    // const poolContract = await deployer.deploy(
    //     Pool,
    //     {},
    //     tdaiContract.contractAddress,
    //     ttbtcContract.contractAddress,
    //     twethContract.contractAddress,
    //     80,
    //     20,
    //     uniswapV2Router02.contractAddress,
    // );
    const poolContract = await deployer.wrapDeployedContract(Pool, '0x065F9B7fA92393F55d3F72d1532bdaDBAf78F5FA');

    // mint erc20 token and provide liquidity
    // await tdaiContract.mint(etherToWei(100000000));
    // await ttbtcContract.mint(etherToWei(1000));
    // await twethContract.mint(etherToWei(100000));

    // provide liquidity for tdai/ttbtc
    // await tdaiContract.approve(uniswapV2Router02Contract.contractAddress, etherToWei(2000000));
    // await ttbtcContract.approve(uniswapV2Router02Contract.contractAddress, etherToWei(200));
    // await uniswapV2Router02Contract.addLiquidity(
    //     tdaiContract.contractAddress,
    //     ttbtcContract.contractAddress,
    //     etherToWei(1000000),
    //     etherToWei(100),
    //     0,
    //     0,
    //     '0xAE27b065b7bDeC42f7E1A64dE12a489E4D51794F', // get liquidity token
    //     MAX_TIMESTAMP, // always not timeout
    // );

    // provide liquidity for tdai/tweth
    // await tdaiContract.approve(uniswapV2Router02Contract.contractAddress, etherToWei(8000000));
    // await twethContract.approve(uniswapV2Router02Contract.contractAddress, etherToWei(20000));
    await uniswapV2Router02Contract.addLiquidity(
        tdaiContract.contractAddress,
        twethContract.contractAddress,
        etherToWei(400000),
        etherToWei(1000),
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
