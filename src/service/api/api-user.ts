import { request } from '@/service/request-wrapper';
const prefix = '/api/v1/system';

export class UserService {
  static async getEncrypyKey() {
    return request<object>(`${prefix}/login/encrypt/key`, '', 'GET');
  }

  static async doLogin(params) {
    return request<object>(`${prefix}/login/sign-in`, params);
  }
  static async doLogOut() {
    return request<object>(`${prefix}/login/sign-out`);
  }
  static async editPassword(params) {
    return request<object>(`${prefix}/user/update-password`, params);
  }
}
