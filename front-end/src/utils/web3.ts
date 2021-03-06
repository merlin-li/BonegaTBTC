import Web3 from 'web3';
import config from './config';
import RebalancerABI from '../abi/Rebalancer.abi.json';
import { message, notification } from 'antd';
import { toFixed, formatPercent, sumArray } from './index';
import moment from 'moment';
import testDAIABI from '../abi/erc20.abi.json';

// set up contracts
export async function setupContracts(dispatch) {
  const { web3, network, walletAddress } = this.props.common;
  const networkName = network == 1 ? 'main' :'ropsten';

  dispatch('rebalancerObj', new web3.eth.Contract(RebalancerABI, config[networkName].Rebalancer));

  const daiObj = new web3.eth.Contract(testDAIABI, config[networkName].DAI);
  dispatch('daiObj', daiObj);
}

// get allowance data
export async function allowance() {
  const { usdxObj, usrObj, walletAddress, network } = this.props.common;
  const networkName = network == 1 ? 'main' : 'ropsten';
  const allowanceResult = await usdxObj.methods.allowance(walletAddress, config[networkName].USR).call();

  this.props.dispatch({
    type: 'common/updateMultiParams',
    payload: {
      allowanceResult: +allowanceResult
    }
  });
}

// init browser wallet
export async function initBrowserWallet(setContracts = true) {
  const dispatch = (name, value) => {
    this.props.dispatch({
      type: 'common/updateParams',
      payload: {
        name,
        value
      }
    });
  };

  dispatch('walletLoading', true);

  let web3Provider;

  if (window.ethereum) {
    web3Provider = window.ethereum;
    try {
      // Request account access
      await window.ethereum.enable();
    } catch (error) {
      // User denied account access...
      message.error("User denied account access");
      return;
    }

    if (window.ethereum.on) {
      window.ethereum.on('accountsChanged', (accounts) => {
        try {
          window.location.reload();
        } catch (err) {
          console.log(err);
        }
      });
    }
  } else if (window.web3) {
    web3Provider = window.web3.currentProvider;
  } else {
    // If no injected web3 instance is detected, display err
    console.log("Please install MetaMask!");
    dispatch('web3Failure', true);
    return;
  }

  const web3 = new Web3(web3Provider);
  const network = await web3.eth.net.getId();

  dispatch('network', network);
  dispatch('web3Failure', false);
  dispatch('web3', web3);

  const walletType = 'browser';
  const accounts = await web3.eth.getAccounts();
  const balance = await web3.eth.getBalance(accounts[0]);

  localStorage.setItem('walletKnown', true);

  dispatch('walletLoading', false);
  dispatch('walletAddress', accounts[0]);
  dispatch('walletType', walletType);
  dispatch('modalVisible', false);
  dispatch('currentBalance', (balance / 1e18).toFixed(4));

  if (setContracts) {
    await setupContracts.bind(this)(dispatch);
  }
}
