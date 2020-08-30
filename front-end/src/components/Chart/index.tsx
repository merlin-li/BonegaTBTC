import React from 'react';
import uuid from 'uuid/v4';
import { Chart } from '@antv/g2';
import moment from 'moment';
// import { formatCurrencyNumber } from '@services'

export default class PriceAreaChart extends React.Component {
  componentWillMount() {
    this.uuid = uuid();
  }

  componentWillUpdate(nextProps) {
    if (this.chart) {
      if (JSON.stringify(nextProps) !== JSON.stringify(this.props)) {
        this.chart.changeData(nextProps.data);
      }
    }
  }

  renderChart() {
    const el = document.getElementById(this.uuid);
    if (!el) { return null }
    const chart = new Chart({
      container: this.uuid,
      autoFit: true,
      height: 370,
    });

    chart.data(this.props.data);
    chart.scale('rate', {
      min: 0,
      // max: 60,
      alias: 'Interest',
      nice: true,
      formatter(item) {
        if (item === 0) return 0;
        return (item * 100).toFixed(2) +  '%'
      }
    });
    chart.scale('datetime', {
      formatter(item) {
        return moment(item).format('MM-DD');
      }
    });
    chart.tooltip({
      showCrosshairs: true,
    });

    chart.line().color('#5741D9').position('datetime*rate').shape('smooth');
    chart.area().position('datetime*rate').color('l(90) 0:#5741D9 1:#fff');
    chart.render();
    this.chart = chart;
  }

  componentDidMount() {
    setTimeout(() => {
      this.renderChart();
    }, 100);
  }

  render() {
    return <div id={this.uuid}></div>;
  }
}
