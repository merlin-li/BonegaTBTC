// format account address
import numeral from 'numeral';
import moment from 'moment';
import { getLocale } from 'umi-plugin-locale';

// format time
export function timeFormatter(time: string) {
  return moment(time).format('YYYY-MM-DD HH:mm:ss');
}

// format time
export function localTimeFormatter(time: string) {
  let currentLanguage = getLocale();
  let isEn = ['en-US', 'en'].indexOf(currentLanguage) >= 0;
  moment.locale(currentLanguage);

  let timeobj = moment(time);
  let timePrefix = timeobj.format('LL');
  let timeEnd = timeobj.format('HH:mm');
  return `${timePrefix} ${isEn ? 'at' : ''} ${timeEnd}`;
}

// account formatter
export function accountFormatter(account: string) {
  if (account.length && account.length === 40) {
    return ('0x' + account).toLowerCase();
  }
  return account.toLowerCase();
}

// transactions hash formatter
export function transactionHashFormatter(hash: string) {
  return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
}

// to fixed
export function toFixed(num, decimal = 2) {
  // let result = (+(Math.round(+(num + 'e' + precision)) + 'e' + -precision)).toFixed(precision);
  // return +result;
  num = num.toString();
  let index = num.indexOf('.');
  if (index !== -1) {
    num = num.substring(0, decimal + index + 1);
  } else {
    num = num.substring(0);
  }
  return +parseFloat(num).toFixed(decimal);
}

// format percent
export function percentFormatter(v) {
  if (v === '...') return v;
  let fixValue = toFixed(parseFloat(v * 100));
  return `${fixValue}%`;
}

// format usr/usdx
export function transactionValueFormatter(v) {
  if (!v) return 0;
  let vStr = parseFloat(v).toFixed(4);
  return formatCurrencyNumber(parseFloat(vStr));
}

// format wallet address
export function accountHideFormatter(account: string) {
  let newaccount = accountFormatter(account);
  return `${newaccount.substring(0, 4)}...${newaccount.substring(newaccount.length - 4)}`;
}

// currency format
export function formatCurrencyNumber(b) {
  if (b === '...') return b;
  if (b > 0) {
    return numeral(b).format('0,0.00');
  }
  return '0';
}

export function formatBalanceNum(b) {
  if (b === '...') return b;
  if (b > 0) {
    // return b / 1e18;
    return numeral(b / 1e18).format('0,0.00')
  }
  return '0';
}

export function isMobileDevice() {
  return navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i);
}

export function renderContentFromKey(key: string) {
  const currentLanguage = getLocale();
  const showKey = currentLanguage === 'en-US' ? 'info_en' : 'info_cn';
  const { voteDetailData } = this.props.governance;

  if (this.props.loading || this.props.loading === undefined) {
    return '...';
  }
  if (voteDetailData.hasOwnProperty(showKey)) {
    let targetObj = voteDetailData[showKey];
    if (targetObj.hasOwnProperty(key)) {
      return targetObj[key];
    }
    return null;
  }
  return null;
}

export function sumArray(arr) {
  if (!arr.length) return 0;
  return arr.reduce((prev, curr, idx, arr) => {
    return (+prev) + (+curr);
  });
}

export function formatPercent(i, arr) {
  let num = +i;
  let sumNum = sumArray(arr);

  if (num > 0) {
    if (sumNum > 0) {
      return (num / sumNum * 100).toFixed(2) + '%';
    }
    return '...';
  }
  return '...';
}
