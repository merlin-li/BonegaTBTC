import React from 'react';
import { Modal } from 'antd';
import styles from './index.less';
import { initBrowserWallet } from '@utils/web3';

export default class SelectWallet extends React.Component {
  handleWalletConnect = () => {
    initBrowserWallet.bind(this)(false);
  }

  render() {
    const walletItems = [
      {
        title: 'MetaMask',
        icon: require('@assets/metamask.svg')
      },
      // {
      //   title: 'Coinbase Wallet',
      //   icon: require('@assets/coinbase.svg')
      // },
      // {
      //   title: 'WalletConnect',
      //   icon: require('@assets/walletconnect.svg')
      // },
      // {
      //   title: 'Fortmatic',
      //   icon: require('@assets/fortmatic.svg')
      // }
    ];

    return (
      <Modal
        centered
        title="Connect Wallet"
        width={430}
        visible={this.props.common.modalVisible}
        footer={null}
        onCancel={e => {
          this.props.dispatch({
            type: 'common/updateModalVisible',
            payload: false
          });
        }}
      >
        <div className={styles.wallets}>
          {
            walletItems.map(item => (
              <section key={item.title} onClick={this.handleWalletConnect}>
                <span>{ item.title }</span>

                <img src={ item.icon } />
              </section>
            ))
          }
        </div>
      </Modal>
    );
  }
}
