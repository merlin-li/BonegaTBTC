import React from 'react';
import { connect } from 'dva';
import styles from './index.less';
import PageHeader from '@components/PageHeader';
import { initBrowserWallet } from '@utils/web3';
import { Modal, Button, notification, Divider, Row, Col, message } from 'antd';
import PoolABI from '../../abi/Pool.abi.json';
import RBTABI from '../../abi/RBT.abi.json';
import { formatBalanceNum } from '@utils';
import LineChart from '@components/Chart'
import priceData from '@services/price';
import commonConfig from '@utils/config';
import ERC20ABI from '../../abi/erc20.abi.json';

const poolIconArray = [
  require('@assets/eth.png'),
  require('@assets/sets/eth.png'),
  require('@assets/tbtc.png'),
  require('@assets/gold.svg'),
];

const poolAddress = [
  '0x4677fB24CCdA37afCF14b6Bf7Dc282E7ae6B702e',
  '0xC7965a8d1D96C4A04cDf8B3C7ffD2CEDfD269bCD',
  '0x161185419D51cfa20A44890324872Bc9c0c34972',
  '0x08A3C50a04B0842fC5C0696F60be602F087A3769'
];

@connect(({ rebalancer, common, loading }) => ({
  common,
  rebalancer,
  loading: loading.models.rebalancer
}))
export default class PoolPage extends React.Component {
  state = {
    buyETHValue: 100,
  }

  initWallet = () => {
    let me = this;
    initBrowserWallet.bind(me)(true);
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'common/updateMultiParams',
      payload: {
        currentPoolObj: null,
        tokenOne: '',
        tokenTwo: ''
      }
    });

    // this.initWallet();
    this.initPoolData();

    this.timer = window.setInterval(() => {
      let nowLocation = window.location.href;
      if (nowLocation.indexOf('pool') > 0) {
        this.initPoolData();
      }
    }, 5000);

    document.getElementById('page__loader').style.display = 'none';
  }

  componentWillUnmount() {
    if (this.timer) {
      window.clearInterval(this.timer);
    }
  }

  handleOnBuyChange = e => {
    this.setState({
      buyETHValue: e.target.value
    });
  }

  // check approve
  checkApprove = async () => {
    const poolAddress = this.props.match.params.id;
    const { web3, daiObj, walletAddress, network } = this.props.common;

    if (daiObj && web3) {
      const result = await daiObj.methods.allowance(walletAddress, poolAddress).call();
      const isApproved = window.localStorage.getItem(`${poolAddress}_${network}`);

      // approve
      if (+result === 0 && isApproved !== 'approved') {
        window.localStorage.setItem(`${poolAddress}_${network}`, 'approved');
        await daiObj.methods.approve(poolAddress, web3.utils.toWei('10000000', 'ether'))
          .send({ from: walletAddress });
      }
    }
  }

  // get pool token balance
  getPoolTokenBalance = async () => {
    const { currentPoolObj, web3, walletAddress } = this.props.common;

    if (currentPoolObj) {
      const poolTokenName = await currentPoolObj.methods.getPoolToken().call();
      if (poolTokenName) {
        const poolTokenObj = new web3.eth.Contract(ERC20ABI, poolTokenName);
        const poolTokenBalance = await poolTokenObj.methods.balanceOf(walletAddress).call();

        this.props.dispatch({
          type: 'common/updateMultiParams',
          payload: {
            RBTBalance: poolTokenBalance,
          }
        });
      }
    }
  }

  initPoolData = async () => {
    const poolAddress = this.props.match.params.id;
    const { web3, network, currentPoolObj, walletAddress } = this.props.common;
    const networkName = network == 1 ? 'main' :'ropsten';

    if (currentPoolObj) {
      const tokenBalance = await currentPoolObj.methods.getTokenBalance().call();
      const tokenNames = await currentPoolObj.methods.getTokenName().call();

      this.props.dispatch({
        type: 'common/updateMultiParams',
        payload: {
          tokenOneBalance: tokenBalance['0'],
          tokenTwoBalance: tokenBalance['1'],
          tokenOne: tokenNames['0'],
          tokenTwo: tokenNames['1'],
        }
      });

      this.getPoolTokenBalance();
    } else {
      if (web3 && network) {
        const thePoolObj = new web3.eth.Contract(PoolABI, poolAddress);
        const tokenBalance = await thePoolObj.methods.getTokenBalance().call();
        const tokenNames = await thePoolObj.methods.getTokenName().call();

        this.props.dispatch({
          type: 'common/updateMultiParams',
          payload: {
            currentPoolObj: thePoolObj,
            tokenOneBalance: tokenBalance['0'],
            tokenTwoBalance: tokenBalance['1'],
            tokenOne: tokenNames['0'],
            tokenTwo: tokenNames['1'],
          }
        });

        this.getPoolTokenBalance();
      }
    }
  }

  // buy
  handleBuyEvent = async () => {
    const { dispatch } = this.props;
    const { web3, currentPoolObj, walletAddress } = this.props.common;
    const { buyETHValue } = this.state;

    await this.checkApprove();

    if (buyETHValue <= 0) {
      message.error('You should depost 1 DAI at least!');
      return;
    }

    dispatch({
      type: 'rebalancer/updateBuyBtnLoading',
      payload: true,
    });

    if (currentPoolObj) {
      const buyResult = await currentPoolObj.methods.deposit(web3.utils.toWei(buyETHValue)).send({
        from: walletAddress,
        gas: 1000000
      });

      // if (buyResult) {
        notification.success({
          message: 'Success!',
          description: `You have successfully deposit ${buyETHValue} DAI!`,
        });
      // }
    }

    this.handleBuyCancelEvent();
  }

  handleBuyCancelEvent = () => {
    const { dispatch } = this.props;

    dispatch({
      type: 'rebalancer/updateBuyModalVisible',
      payload: false,
    });
  }

  // sell
  handleSellEvent = async () => {
    const { dispatch } = this.props;
    const { web3, currentPoolObj, walletAddress, RBTBalance } = this.props.common;

    if (RBTBalance <= 0) {
      message.error('You have no asset to redeem!');
      return;
    }

    dispatch({
      type: 'rebalancer/updateSellBtnLoading',
      payload: true,
    });

    if (currentPoolObj) {
      const sellResult = await currentPoolObj.methods.withdraw(RBTBalance).send({
        from: walletAddress,
        gas: 1000000
      });

      if (sellResult) {
        notification.success({
          message: 'Success!',
          description: 'You have successfully redeem your assets!',
        });
      }
    }

    this.handleSellCancelEvent();
  }

  handleSellCancelEvent = () => {
    this.props.dispatch({
      type: 'rebalancer/updateSellModalVisible',
      payload: false,
    });
  }

  handleRebalanceEvent = async () => {
    const { dispatch } = this.props;
    const { currentPoolObj, walletAddress } = this.props.common;
    const { rebalance1, rebalance2, rebalance3, rebalance4 } = this.state;

    dispatch({
      type: 'rebalancer/updateRebalanceLoading',
      payload: true,
    });

    if (currentPoolObj) {
      const rebalanceResult = await currentPoolObj.methods.rebalance(+rebalance1, +rebalance2, +rebalance3, +rebalance4).send({
        from: walletAddress,
        gas: 2000000
      });

      if (rebalanceResult) {
        notification.success({
          message: 'Success!',
          description: 'You have successfully rebalance the sets!',
        });
      }
    }

    this.handleRebalanceCancelEvent();
  }

  handleOnRebalance = (k, e) => {
    this.setState({
      [k]: +e.target.value
    });
  }

  handleRebalanceCancelEvent = () => {
    this.props.dispatch({
      type: 'rebalancer/updateRebalanceModalVisible',
      payload: false,
    });
  }

  render() {
    const { dispatch } = this.props;
    const {
      tokenOneBalance,
      tokenTwoBalance,
      RBTBalance,
      tokenOne,
      tokenTwo,
    } = this.props.common;
    const chartData = priceData.data.wethlink;
    const thePoolAddress = this.props.match.params.id;
    let theIconIndex = poolAddress.indexOf(thePoolAddress);
    if (theIconIndex < 0) {
      theIconIndex = 0;
    }
    let theIcon = poolIconArray[theIconIndex];

    return (
      <div className={styles.container}>
        <PageHeader { ...this.props } />

        <section className={styles.box}>
          <div className={styles.box__header}>
            <div>
              <img src={ theIcon } />
              <b>{tokenOne} / {tokenTwo}</b>
            </div>

            <div>
              <Button type="primary" onClick={() => { dispatch({ type: 'rebalancer/updateBuyModalVisible', payload: true }) }}>Deposit</Button>
              <Button type="primary" onClick={() => { dispatch({ type: 'rebalancer/updateSellModalVisible', payload: true }) }}>Redeem</Button>
            </div>
          </div>

          <div className={styles.box__info}>
            <span>{tokenOne}: <b>{ formatBalanceNum(tokenOneBalance) }</b></span>
            <span>{tokenTwo}: <b>{ formatBalanceNum(tokenTwoBalance) }</b></span>
            <span>Fee: <b>0%</b></span>
          </div>

          <div className={styles.box__assets}>
            <span>Your RBT: <b>{ formatBalanceNum(RBTBalance) }</b></span>
          </div>

          <div className={styles.box__chart}>
            <LineChart data={chartData} />
          </div>
        </section>

        <Modal
          title="Deposit DAI"
          centered
          visible={this.props.rebalancer.buyModalVisible}
          onCancel={this.handleBuyCancelEvent}
          footer={(
            <div className={styles.modal__footer}>
              <Button onClick={this.handleBuyCancelEvent}>Cancel</Button>
              <Button loading={this.props.rebalancer.buyBtnLoading} type="primary" onClick={this.handleBuyEvent}>Buy</Button>
            </div>
          )}
        >
          <div className={styles.modal__content}>
            <section>Buy <input value={this.state.buyETHValue} onChange={this.handleOnBuyChange} /> DAI</section>
          </div>
        </Modal>

        <Modal
          title="Recaption"
          centered
          visible={this.props.rebalancer.sellModalVisible}
          onCancel={this.handleSellCancelEvent}
          footer={(
            <div className={styles.modal__footer}>
              <Button onClick={this.handleSellCancelEvent}>Cancel</Button>
              <Button loading={this.props.rebalancer.sellBtnLoading} onClick={this.handleSellEvent} type="primary">Recaption</Button>
            </div>
          )}
        >
          <div className={styles.modal__content}>
            <section>Recaption all your asset?</section>
          </div>
        </Modal>
      </div>
    );
  }
}
