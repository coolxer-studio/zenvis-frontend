import axios, { AxiosRequestConfig, AxiosRequestHeaders } from 'axios';
// 引入el 提示框，这个项目里用什么组件库这里引什么
import { newMessageError } from '@/utils/tool';
import { apiResponse } from '@u/util-common';
import { ElMessage } from 'element-plus';

// 设置接口超时时间
axios.defaults.timeout = 60000;
// 请求地址
axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || '/';
//http request 请求拦截器
axios.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 配置请求头
    const headers: AxiosRequestHeaders = {};
    // 如果 data 不是 FormData，则设置 Content-Type 为 json
    // FormData 请求由浏览器自动设置 multipart/form-data 头（包含 boundary）
    if (!(config.data instanceof FormData)) {
      headers['Content-Type'] = 'application/json;charset=UTF-8';
    }
    if (config.method?.toUpperCase() === 'POST') {
      //const tokenSign = getTokenSign(config.data);
      //headers.token = '' //tokenSign.token;
      //headers.clientSign = tokenSign.clientSign;
      /*config.data = {
        ...config.data,
        signatureContent: tokenSign.signatureContent,
      };*/
    }
    config.headers = { ...config.headers, ...headers };
    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

//http response 拦截器
axios.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    const { response } = error;
    if (response) {
      ElMessage.error('服务器响应失败');
      return Promise.reject(response.data.error);
    } else {
      ElMessage.error('网络连接异常,请稍后再试!');
    }
  },
);

// 封装 GET POST 请求并导出
export function request<R>(url = '', params = {}, type = 'POST'): Promise<R> {
  //设置 url params type 的默认值
  if (!url) {
    ElMessage.warning("无效的请求地址");
    return new Promise((resolve, reject) => {
      reject(newMessageError("无效的请求地址"));
    });
  }
  return new Promise((resolve, reject) => {
    let doAxios;
    if (type.toUpperCase() === 'GET') {
      doAxios = axios({
        url,
        params,
      });
    } else if (type.toUpperCase() === 'POST') {
      doAxios = axios({
        method: 'POST',
        url,
        data: params,
      });
    }else if (type.toUpperCase() === 'PUT') {
      doAxios = axios({
        method: 'PUT',
        url,
        data: params,
      });
    }else if (type.toUpperCase() === 'DELETE') {
      doAxios = axios({
        method: 'DELETE',
        url,
        data: params,
      });
    } else {
      reject(newMessageError("不支持的请求方法"));
      return;
    }
    //处理返回
    doAxios.then(async res => {
      await apiResponse<R>(res)
        .then((result: R) => {
          resolve(result);
        })
        .catch(err => {
          reject(err);
        });
    });
  });
}
