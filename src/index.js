import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppRoot from './app';
import reportWebVitals from './reportWebVitals';
import zhCN from 'antd/locale/zh_CN';
import { ConfigProvider } from 'antd';
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.locale('zh-cn');
dayjs.extend(relativeTime);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <ConfigProvider locale={zhCN}>

        <AppRoot />
      </ConfigProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
