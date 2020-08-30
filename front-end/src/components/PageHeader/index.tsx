import React from 'react';
import { Menu, Dropdown, Drawer, Collapse, Tooltip } from 'antd';
import { accountHideFormatter } from '@utils';
import { formatMessage } from 'umi-plugin-locale';
import styles from './index.less';
import Link from 'umi/link';
import router from 'umi/router';

const downSvg = require('@assets/icon_xl.svg');
const { Panel } = Collapse;
export default class PageHeader extends React.Component {
  state = {
    drawerVisible: false
  }

  onClose = () => {
    this.setState({
      drawerVisible: false
    });
  }

  openMenu = () => {
    this.setState({
      drawerVisible: true
    });
  }

  // connect wallet
  connectWallet = async () => {
    this.props.dispatch({
      type: 'common/updateModalVisible',
      payload: true
    });
  }

  render() {
    const { walletAddress = '', currentBalance } = this.props.common;

    return (
      <div className={styles.header}>
        <a onClick={() => { router.push('/') }} className={styles.header__logo}>
          BonegaTBTC
        </a>

        <img onClick={this.openMenu} className={styles.header__dropdown} src={require('@assets/icon_menu.svg')} alt="menu" />

        <div className={styles.header__menu}>
          {
            walletAddress ?
              (
                <Tooltip title={`Your current balance: ${currentBalance} ETH`}>
                <span className={styles.header__menu_wallet}>
                  <div>
                    <img onClick={this.connectWallet} src={require('@assets/metamask.svg')} />
                    <a
                      href={
                        this.props.common.network == 1
                          ? `https://etherscan.com/address/${walletAddress}`
                          : `https://rinkeby.etherscan.io/address/${walletAddress}`
                      }
                      target="_blank"
                    >{ accountHideFormatter(walletAddress) }</a>
                  </div>
                </span>
                </Tooltip>
              ) : (<a className={styles.header__menu_wallet} onClick={this.connectWallet}>{ formatMessage({ id: 'menu.connectWallet' }) }</a>)
          }
        </div>
      </div>
    );
  }
}
