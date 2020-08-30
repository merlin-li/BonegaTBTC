import { message } from 'antd';

message.config({
  top: 100,
  maxCount: 1,
  duration: 3
});

export default {
  "defaultWeb3Provider": "https://mainnet.infura.io/v3/8facbab2998b411ea0cef95ae90b66f1",
  main: {
    "Rebalancer": "0x83B6127A4915F41C6D3Acc786b80CD9F69cC65ad",
    "RBT": "0xAC651C03c7C2f35eDF039E434697Ac290584C5d1",
    "DAI": "0xad6d458402f60fd3bd25163575031acdce07538d",
    "TBTC": "0xa609f2c9c5b7873f353c15d4ef6e151d14db69cc",
    "WETH": "0x0a180a76e4466bf68a7f86fb029bed3cccfaaac5",
    "PAXG": "0x45804880de22913dafe09f4980848ece6ecbaf78",
  },
  rinkeby: {
    "Rebalancer": "0x83B6127A4915F41C6D3Acc786b80CD9F69cC65ad",
    "RBT": "0xAC651C03c7C2f35eDF039E434697Ac290584C5d1",
    "DAI": "0x934c5632f582770ad6849bc20c5cb35fa1e9d293",
    "TBTC": "0xa609f2c9c5b7873f353c15d4ef6e151d14db69cc",
    "WETH": "0x0a180a76e4466bf68a7f86fb029bed3cccfaaac5",
    "PAXG": "0x45804880de22913dafe09f4980848ece6ecbaf78",
  },
  ropsten: {
    "Rebalancer": "0x83B6127A4915F41C6D3Acc786b80CD9F69cC65ad",
    "RBT": "0xAC651C03c7C2f35eDF039E434697Ac290584C5d1",
    "DAI": "0x934c5632f582770ad6849bc20c5cb35fa1e9d293",
    "TBTC": "0xa609f2c9c5b7873f353c15d4ef6e151d14db69cc",
    "WETH": "0x0a180a76e4466bf68a7f86fb029bed3cccfaaac5",
    "PAXG": "0x45804880de22913dafe09f4980848ece6ecbaf78",
  },
};
