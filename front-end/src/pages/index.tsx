import React from 'react';
import { connect } from 'dva';
import styles from './index.less';
import PageHeader from '@components/PageHeader';
import PoolList from '@components/PoolList';
import { initBrowserWallet, fetchDataOfTheContract } from '@utils/web3';
import { Button, Input, notification, Alert } from 'antd';
import PoolABI from '../abi/Pool.abi.json';

@connect(({ rebalancer, common, loading }) => ({
  common,
  rebalancer,
  loading: loading.models.rebalancer
}))
export default class IndexPage extends React.Component {
  componentDidMount() {
    document.getElementById('page__loader').style.display = 'none';
  }

  render() {
    return (
      <div className={styles.container}>
        <Alert message="We now only support Ropsten network!" type="warning" showIcon closable />

        <PageHeader { ...this.props } />

        <section className={styles.container__banner}>
          <img src={require('@assets/banner.png')} />

          <div>
            <section>
              <img src={require('@assets/tbtc.png')} />
            </section>
            <section>
              <img src={require('@assets/eth.png')} />
            </section>
            <section>
              <img src={require('@assets/gold.svg')} />
            </section>
          </div>

          <section className={styles.container__banner_tx}>
            <h1>BonegaTBTC</h1>
            <h2>A simple & safety approach to manage and rebalance your investment.</h2>
            <p>Power by <a href="https://keep.network/" target="_blank">KEEP Network</a> & <a href="https://tbtc.network/" target="_blank">TBTC</a></p>
          </section>
        </section>

        <PoolList { ...this.props } />

        <section className={styles.faq}>
          <h2>FAQ</h2>

          <h3>1. What is BonegaTBTC？</h3>
          <p>
            BobegaTBTC, a DeFi protocol that integrates TBTC, allows user to create a portfolio including BTC on ethereum and rebalance their portfolio. All processes are protected by cryptography, which making them more secure and transparent. Bonega means "great" in Esperanto, thanks to Keep Network for bringing us such a robust TBTC.
          </p>

          <h3>2. What is TBTC？Why do we choose TBTC？</h3>
          <p>
            <a href="https://tbtc.network/">tBTC</a>, an ERC-20 token fully backed by BTC, can help alleviate uncertainty for first-time DeFi users. The token, currently live on the Ropsten testnet, allows people for the first time to safely use BTC on the Ethereum blockchain. More than that, by combining the strengths of both chains, it offers users a safe and simple way to participate in the growing DeFi space.You can see more details <a href="https://blog.keep.network/introducing-tbtc-the-safest-way-to-earn-with-your-bitcoin-fec077f171f4" target="_blank">here</a>.
          </p>

          <h3>3. Which assets are supported currently?</h3>
          <p>
            BonegaTBTC currently supports TBTC, WETH and DAI. These are some of the most robust assets in cryptocurrency right now. In order for users to have a more diverse portfolio, we also support PAX Gold(PAXG). Every PAX Gold token is backed by an ounce of allocated gold. We are planning to support more tokens in the future.
          </p>

          <h3>4. What is Rebalance？</h3>
          <p>
            Rebalancing is the process of realigning the weights of tokens inside of a Set to the Set’s target weights. Taking part in a rebalance involves supplying undercollateralized component tokens to the Set and receiving over collateralized tokens in return. As an owner of a Set, you don’t need to do anything but hold a Set to gain the benefits of  rebalancing according to the strategy you created.
          </p>

          <h3>5.What is RBT？</h3>
          <p>
            When you purchase or create a Set, you will receive RBT as a credential. You can redeem the asset with the RBT（Rebalance Pool Token）.We'll unlock more features for the RBT in the future
          </p>
        </section>
      </div>
    );
  }
}
