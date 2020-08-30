export default {
  namespace: 'rebalancer',
  state: {
    buyModalVisible: false,
    sellModalVisible: false,
    createModalVisible: false,
    createBtnLoading: false,
    buyBtnLoading: false,
    sellBtnLoading: false,
    rebalanceLoading: false,
    rebalanceModalVisible: false,
  },
  reducers: {
    updateRebalanceModalVisible(state, action) {
      return {
        ...state,
        rebalanceLoading: false,
        rebalanceModalVisible: !!action.payload,
      };
    },
    updateRebalanceLoading(state, action) {
      return {
        ...state,
        rebalanceLoading: !!action.payload,
      };
    },
    updateSellBtnLoading(state, action) {
      return {
        ...state,
        sellBtnLoading: !!action.payload,
      };
    },
    updateBuyBtnLoading(state, action) {
      return {
        ...state,
        buyBtnLoading: !!action.payload,
      };
    },
    updateBuyModalVisible(state, action) {
      return {
        ...state,
        buyBtnLoading: false,
        buyModalVisible: !!action.payload,
      };
    },
    updateSellModalVisible(state, action)  {
      return {
        ...state,
        sellModalVisible: !!action.payload,
        sellBtnLoading: false,
      };
    },
    updateCreateModalVisible(state, action) {
      return {
        ...state,
        createBtnLoading: false,
        createModalVisible: !!action.payload,
      };
    },
    updateCreateBtnLoading(state, action) {
      return {
        ...state,
        createBtnLoading: !!action.payload,
      };
    }
  }
}
