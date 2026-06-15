import { TStandardResponse } from '@/types/type-response';
import { ElMessage } from 'element-plus';
import { getTokenSign } from '@u/util-token';
import { ls } from '@u/local-storage';
import router from '@/router';

//const message = new Message();
// const frameWork = new FrameWork();

export function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

interface IResult<T> {
  status: number;
  data: TStandardResponse<T>;
}

/*
 * 成功的处理
 * status 200
 * 上传接口成功的response
 * */
export function successResponse<R>(data: TStandardResponse<R>): Promise<R> {
  return new Promise<R>(resolve => {
    const resData = data as TStandardResponse<R>;
    resolve(resData.data);
  });
}

/*
 * 接口返回统一处理
 * */
export function apiResponse<R>(res: IResult<R>) {
  return new Promise<R>(async (resolve, reject) => {
    /*
     * 只处理调用成功的信息，所有调用错误的信息都抛给《权杖》处理
     * */
    if (res.status === 200 && res.data.status == 0) {
      await successResponse<R>(res.data)
        .then(result => {
          resolve(result);
        })
        .catch(error => {
          reject(error);
        });
    } else {
      reject(res.data);
      if (res.status === 200 && res.data.status == 101) {
        ls.clear();
        router.replace(`/user/login`).then(() => {
          ElMessage.closeAll()
          ElMessage.error(res.data.msg);
        });
        //window.location.reload();
      } else {
        ElMessage.error(res.data.msg);
      }
    }
  });
}

export function urlGet(url: string) {
  const tokenSign = getTokenSign();
  if (url.charAt(0) !== '/') {
    url = '/' + url;
  }
  return `${url}&token=${tokenSign.token}&clientSign=${tokenSign.clientSign}&signatureContent=${tokenSign.signatureContent}`;
}

export function apiDownload(url: string, data: any = {}) {
  const tokenSign = getTokenSign(data);
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.setRequestHeader('token', tokenSign.token);
  xhr.setRequestHeader('clientSign', tokenSign.clientSign);
  xhr.responseType = 'blob';
  xhr.send();
  xhr.onload = function () {
    if (xhr.status === 200) {
      const contentDisposition: any = xhr.getResponseHeader('content-disposition');
      const fileName = contentDisposition.split(';')[1].trim().split('=')[1].replace(/"/g, '');
      const blob = new Blob([xhr.response]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = decodeURIComponent(fileName);
      link.click();
    } else {
      ElMessage.error(xhr.statusText);
    }
  };
}

export function apiPreview(url: string, data: any = {}) {
  const tokenSign = getTokenSign(data);
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.setRequestHeader('token', tokenSign.token);
  xhr.setRequestHeader('clientSign', tokenSign.clientSign);
  xhr.responseType = 'blob';
  xhr.send();
  xhr.onload = function () {
    if (xhr.status === 200) {
      const contentDisposition: any = xhr.getResponseHeader('content-disposition');
      const fileName = contentDisposition.split(';')[1].trim().split('=')[1].replace(/"/g, '');
      const blob = new Blob([xhr.response]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.target = '_blank';
      link.download = decodeURIComponent(fileName);
      link.click();
    } else {
      ElMessage.error(xhr.statusText);
    }
  };
}

export function generateUUID(): string {
    let d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function'){
        d += performance.now(); // 使用高精度时间
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
