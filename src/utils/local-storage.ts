import enc from './encrypt-decrypt';
import { hasOwn } from '@/utils/tool';

/**
 * Description:存储逻辑封装，系统使用localStorage时使用此处方法
 *
 * 调用方法：
 * 1. 注册全局变量：app.config.globalProperties.$local_storage
 * 2. 使用导入：
 *    import { getCurrentInstance } from 'vue';
 *    const ls = getCurrentInstance()?.appContext.config.globalProperties.$local_storage;
 * 3. 存储：ls.set('testKey', 'testValue')
 * 4. 读取：const testValue = ls.get('testKey')
 *
 * PS: 暂时不考虑加密读取，后续有需求可随时增加
 */
declare global {
  interface Window {
    esl: never | any;
    kk: never;
  }
}

class CLocalStorage {
  isEncrypted: boolean;

  private static instance = new CLocalStorage();

  static getInstance(): CLocalStorage {
    return CLocalStorage.instance;
  }

  constructor(isEncrypted = false) {
    this.isEncrypted = isEncrypted;
  }

  readF(key: string, value: string): any {
    if (value) {
      const item = JSON.parse(value);
      if (item.expiredAt && Number(item.expiredAt) >= Number(Date.now())) {
        return this.isEncrypted ? enc.Decrypt(item.value, enc.k(window.kk)) : item.value;
      }
    }
    return '';
  }

  setF(key: string, e: any, expire?: number) {
    return JSON.stringify({
      expiredAt: Number(Date.now()) + (!expire ? 2592e8 : expire),
      value: this.isEncrypted ? enc.Encrypt(JSON.stringify(e), enc.k(window.kk)) : e,
    });
  }

  get(key: string): any {
    try {
      try {
        return this.readFromLocalStorage(key);
      } catch (v) {
        this.readFromMemory(key);
      }
    } catch (exception) {
      return null;
    }
  }

  set(key: string, e: any, expire?: number | null | undefined) {
    // eslint-disable-next-line no-undefined
    if (null === expire || undefined === expire) expire = 2592e8;
    try {
      try {
        return this.setInLocalStorage(key, e, expire);
      } catch (v) {
        this.setInMemory(key, e, expire / 1e3);
      }
    } catch (exception) {
      console.log(exception);
      return null;
    }
  }

  readFromLocalStorage(key: string): any {
    let value = window.localStorage.getItem(key);
    if (value === null) value = '';
    return this.readF(key, value);
  }

  readFromMemory(key: string): any {
    if (window.esl) {
      const value = hasOwn(window.esl, key) ? window.esl[key] : '';
      return this.readF(key, value);
    } else {
      return '';
    }
  }

  setInMemory(key: string, e: any, expire: number) {
    if (window.esl) {
      window.esl[key] = this.setF(key, e, expire);
    } else {
      window.esl = {};
      window.esl[key] = this.setF(key, e, expire);
    }
  }

  setInLocalStorage(key: string, e: any, expire: number) {
    window.localStorage.setItem(key, this.setF(key, e, expire));
  }

  keys(): (string | null)[] | null {
    if (window.localStorage) {
      const keys: (string | null)[] = [];
      for (let i = 0; i < window.localStorage.length; i += 1) keys.push(window.localStorage.key(i));
      return keys;
    } else {
      return null;
    }
  }

  hasItem(itemKey: string): boolean {
    try {
      const keys: (string | null)[] | null = this.keys();
      let has = false;
      if (keys) {
        for (let i = 0; i < keys.length; i += 1) {
          if (keys[i] === itemKey) {
            has = true;
            break;
          }
        }
      }
      return has;
    } catch (e) {
      if (window.esl) {
        return hasOwn(window.esl, itemKey);
      }
      return false;
    }
  }

  clear() {
    const keys = this.keys();
    if (keys) {
      keys.forEach((itemKey: string | null) => {
        this.remove(itemKey);
      });
    }
  }

  remove(key: string | null): void {
    if (typeof key === 'string') {
      window.localStorage.removeItem(key);
    }
  }
}

const ls = CLocalStorage.getInstance();

export { ls, CLocalStorage };
