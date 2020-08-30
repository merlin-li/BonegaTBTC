import { IConfig } from 'umi-types';
const path = require('path');

// ref: https://umijs.org/config/
const config: IConfig =  {
  treeShaking: true,
  hash: true,
  plugins: [
    ['umi-plugin-react', {
      antd: true,
      dva: true,
      dynamicImport: false,
      title: 'BonegaTBTC',
      dll: false,
      locale: {
        enable: true,
        default: 'en-US',
      },
      routes: {
        exclude: [
          /models\//,
          /services\//,
          /model\.(t|j)sx?$/,
          /service\.(t|j)sx?$/,
          /components\//,
        ],
      },
    }],
  ],
  theme: {
    'primary-color': '#5741D9'
  },
  alias: {
    '@utils': path.resolve(__dirname, './src/utils'),
    '@assets': path.resolve(__dirname, './src/assets'),
    '@services': path.resolve(__dirname, './src/services'),
    '@components': path.resolve(__dirname, './src/components'),
  },
}

export default config;
