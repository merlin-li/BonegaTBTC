import styles from './index.less';
import React, { Component } from 'react';
import { connect } from 'dva';
import PageFooter from '@components/PageFooter';
import SelectWallet from '@components/SelectWallet';

@connect(({ common }) => ({
  common
}))
class BasicLayout extends Component {
  render() {
    return (
      <div className={styles.container}>
        {this.props.children}
        <SelectWallet { ...this.props } />
      </div>
    );
  }
}

export default BasicLayout;
