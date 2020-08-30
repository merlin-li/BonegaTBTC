import React from 'react';
import styles from './index.less';
import { accountHideFormatter } from '@utils';
import router from 'umi/router';
import Loading from '@components/Loading';
import { Tooltip } from 'antd';

const poolIconArray = [
  require('@assets/eth.png'),
  require('@assets/sets/eth.png'),
  require('@assets/tbtc.png'),
  require('@assets/gold.svg'),
  require('@assets/sets/gold.svg'),
  require('@assets/sets/gold.svg'),
  require('@assets/sets/btc.svg'),
  require('@assets/sets/eth.png'),
  require('@assets/sets/gbtc.svg'),
  require('@assets/sets/gold.svg'),
  require('@assets/sets/btc.svg'),
  require('@assets/sets/eth.png'),
  require('@assets/sets/gbtc.svg'),
  require('@assets/sets/gold.svg'),
  require('@assets/sets/btc.svg'),
];
export default class PoolList extends React.Component {
  handleCreate = () => {
    this.props.dispatch({
      type: 'rebalancer/updateCreateModalVisible',
      payload: true,
    });
  }

  render() {
    const { poolList } = this.props.common;

    if (!poolList.length) {
      return (
        <section className={styles.box}>
          <h1>Let’s Begin</h1>
          <p className={styles.box__info}><a onClick={this.handleCreate}>Start creating  your own set?</a></p>

          <section className={styles.container}>
            <Loading />
          </section>
        </section>
      );
    }

    return (
      <section className={styles.box}>
        <h1>Let’s Begin</h1>
        <p className={styles.box__info}><a onClick={this.handleCreate}>Start creating  your own set?</a></p>

        <section className={styles.container}>
          {
            poolList.map((item, key) => (
              <Tooltip
                title={ item.disabled ? 'Not Available on Testnet' : 'Have a try!' }
                visible={false}
                key={item.address}
              >
                <div className={styles.box__item} key={item.address} onClick={() => { router.push(`/pool/${item.address}`) }}>
                  <div className={styles.box__item_header}>
                    <img src={poolIconArray[key]} />

                    <b className={!item.disabled ? styles.box__item_header_demo : null}>
                    { !item.disabled ? 'Demo' : item.desc }
                    </b>
                  </div>
                  <p>
                  { !item.disabled ? 'Have a try!' : 'Not Available on Testnet. ' }
                  </p>

                  <div className={styles.box__item_percent}>
                    <section>
                      <div>
                        <img src={item.token1} />
                        <b>{ item.tokenOneName }</b>
                        <span>{ item.percentOne }%</span>
                      </div>
                      <div>
                        <img src={item.token2} />
                        <b>{ item.tokenTwoName }</b>
                        <span>{ item.percentTwo }%</span>
                      </div>
                    </section>

                    <div className={styles.progress}>
                      <div style={{ width: item.percentOne + '%' }}></div>
                    </div>
                  </div>

                  <div className={styles.box__item_footer}>
                    Address: <a>{ accountHideFormatter(item.address) }</a>
                  </div>
                </div>
              </Tooltip>
            ))
          }

        </section>
      </section>
    );
  }
}
