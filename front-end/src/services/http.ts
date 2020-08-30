import axios from 'axios';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { message } from 'antd';

const instance = axios.create();

// 未登录，是否正在等待跳离页面，避免调用多个接口重复提示未登录消息
// let hasWaiting = false;
// 是否存在正在等待的请求
let hasFetching = [];
// 暂存页面路由，用来判断是否是页面跳转，显示页面加载动画
let routerPath = '';

// 请求前拦截器
instance.interceptors.request.use((config) => {
  // 等待的请求列表中添加一条数据
  hasFetching.push(config.url);
  // 等待的请求列表 > 0 且路由改变，启动页面加载动画，更新记录路由
  if (
    hasFetching.length && routerPath !== window.location.pathname
  ) {
    routerPath = window.location.pathname;
    NProgress.start();
  }
  // 设置超时15s
  config.timeout = 15000;
  return config;
}, function (error) {
  NProgress.done();
  return Promise.reject(error);
});

// 请求返回拦截器
instance.interceptors.response.use((res) => {
  // 请求结束，删除结束的请求记录
  hasFetching.splice(hasFetching.indexOf(res.config.url), 1);
  // 结束页面加载进度条
  if (!hasFetching.length) {
    NProgress.done();
  }
  // 多报错
  if (+res.data.code === 201) {
    for (var i = 0; i < res.data.subCodes.length; i++) {
      message.error('操作失败!', 5);
    }
    return res.data;
  }

  return res.data;
}, (err) => {
  NProgress.done();
  message.error('网络异常，请稍后尝试！');
  return err;
});

// 对外暴露get方法
export function get(url, params = {}) {
  return instance({
    method: 'get',
    url,
    params,
  });
}

export const request = instance;
