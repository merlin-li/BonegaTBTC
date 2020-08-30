const poolIconArray = [
  require('@assets/sets/eth.png'),
  require('@assets/tbtc.png'),
  require('@assets/gold.svg'),
  require('@assets/sets/gold.svg'),
  require('@assets/eth.png'),
  require('@assets/sets/gold.png'),
];
const defaultData = [
  {
    "address": "0x4677fB24CCdA37afCF14b6Bf7Dc282E7ae6B702e",
    "percentOne": "34",
    "percentTwo": "66",
    "desc": "TBTC / WETH",
    "tokenOneName": "TBTC",
    "tokenTwoName": "WETH",
    "disabled": false,
    "token1": poolIconArray[1],
    "token2": poolIconArray[4],
  },
  {
    "address": "0xC7965a8d1D96C4A04cDf8B3C7ffD2CEDfD269bCD",
    "percentOne": "34",
    "percentTwo": "66",
    "desc": "TBTC / WETH",
    "tokenOneName": "TBTC",
    "tokenTwoName": "WETH",
    "disabled": true,
    "token1": poolIconArray[1],
    "token2": poolIconArray[4],
  },
  {
    "address": "0x161185419D51cfa20A44890324872Bc9c0c34972",
    "percentOne": "44",
    "percentTwo": "56",
    "desc": "TBTC / DAI",
    "tokenOneName": "TBTC",
    "tokenTwoName": "DAI",
    "disabled": true,
    "token1": poolIconArray[1],
    "token2": poolIconArray[2],
  },
  {
    "address": "0x08A3C50a04B0842fC5C0696F60be602F087A3769",
    "percentOne": "61",
    "percentTwo": "39",
    "desc": "TBTC / PAXG",
    "tokenOneName": "TBTC",
    "tokenTwoName": "PAXG",
    "disabled": true,
    "token1": poolIconArray[1],
    "token2": poolIconArray[5],
  },
];

export default {
  namespace: 'common',
  state: {
    network: 0,
    web3: null,
    walletAddress: '',
    walletType: '',
    actionStatus: 'pending',  // pending, failure, success
    actionVisible: false,
    actionTransactionHash: '',
    ETHBalance: 0,
    modalVisible: false,

    rebalancerObj: null,
    poolList: [ ...defaultData ],
    currentBalance: 0,

    currentPoolObj: null,
    tokenOneBalance: '...',
    tokenTwoBalance: '...',

    tokenUserBalanceOne: '...',
    tokenUserBalanceTwo: '...',
    RBTBalance: '...',

    thePoolDesc: '...',
    tokenOne: '',
    tokenTwo: '',
  },
  reducers: {
    updateParams(state, action) {
      return {
        ...state,
        [action.payload.name]: action.payload.value,
      };
    },
    updateMultiParams(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
    updateTransAction(state, action) {
      return {
        ...state,
        actionStatus: action.payload.actionStatus,
        actionVisible: action.payload.actionVisible,
        actionTransactionHash: action.payload.actionTransactionHash,
      };
    },
    updateModalVisible(state, action) {
      return {
        ...state,
        modalVisible: !!action.payload,
      };
    }
  }
}
