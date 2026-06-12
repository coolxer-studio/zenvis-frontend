import { request } from '@/service/request-wrapper';
import { SystemInfo ,Dashboard } from '@/service/types/type-system';
const prefix = '/api/v1/system';

export class SystemService {
  static async getSystemInfo(): Promise<SystemInfo> {
    const response = await request<Object>(`${prefix}/about/info`, '', 'GET');
    return {
      systemTitle: (response as any).system_title || '',
      productName: (response as any).product_name || '',
      productVersion: (response as any).product_version || '',
      productIntroduction: (response as any).product_introduction || '',
      copyright: (response as any).copyright || '',
      servicePhone: (response as any).service_phone || '',
      serviceEmail: (response as any).service_email || '',
      technicalEmail: (response as any).technical_email || '',
    };
  }

  static async getDashboardList() : Promise<Dashboard[]>{
    const response = await request<Array<object>>(`${prefix}/dashboard/list`);
    // 返回DashboardItem[]对象
    return response.map((item) => ({
      id: (item as any).id || 0,
      name: (item as any).name || '',
      code: (item as any).code || '',
      type: (item as any).type || '',
      typeDescription: (item as any).type_description || '',
      url: (item as any).url || '',
      updateTime: (item as any).update_time || '',
    }))
  }
}