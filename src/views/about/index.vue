<template>
  <div class="main-content about_it">
    <table id="about_it_id" class="product_info">
      <tr>
        <td class="left_td">页面ico：</td>
        <td>
          <div class="logo-container">
            <img v-if="systemInfo?.systemIcon" :src="getFullUrl(systemInfo.systemIcon)" alt="产品图标" class="logo-preview" />
            <div v-else class="logo-placeholder">
              <el-icon class="icon-image" size="32" />
              <span>暂无图标</span>
            </div>
          </div>
        </td>
        <td class="action_td">
          <el-button @click="triggerLogoUpload" icon="Upload" size="small" type="primary">上传图标</el-button>
          <input ref="logoInput" type="file" accept=".ico" class="logo-upload-input" @change="handleIconUpload" />
        </td>
      </tr>
      <tr>
        <td class="left_td">系统Logo：</td>
        <td>
          <div class="logo-container">
            <img v-if="systemInfo?.systemLogo" :src="getFullUrl(systemInfo.systemLogo)" alt="系统Logo" class="logo-preview" />
            <div v-else class="logo-placeholder">
              <el-icon class="icon-image" size="32" />
              <span>暂无Logo</span>
            </div>
          </div>
        </td>
        <td class="action_td">
          <el-button @click="triggerSystemLogoUpload" icon="Upload" size="small" type="primary">上传Logo</el-button>
          <input ref="systemLogoInput" type="file" accept=".png" class="logo-upload-input" @change="handleLogoUpload" />
        </td>
      </tr>
      <tr>
        <td class="left_td">系统Banner：</td>
        <td>
          <div class="logo-container">
            <img v-if="systemInfo?.systemBanner" :src="getFullUrl(systemInfo.systemBanner)" alt="系统Banner" class="banner-preview" />
            <div v-else class="logo-placeholder">
              <el-icon class="icon-image" size="32" />
              <span>暂无Banner</span>
            </div>
          </div>
        </td>
        <td class="action_td">
          <el-button @click="triggerBannerUpload" icon="Upload" size="small" type="primary">上传Banner</el-button>
          <input ref="bannerInput" type="file" accept=".png" class="logo-upload-input" @change="handleBannerUpload" />
        </td>
      </tr>
      <tr>
        <td class="left_td">系统标题：</td>
        <td>
          <template v-if="editingField !== 'systemTitle'">{{systemInfo?.systemTitle}}</template>
          <el-input v-else v-model="editValue" size="small" class="edit-input" @blur="saveField('systemTitle')" @keyup.enter="saveField('systemTitle')" />
        </td>
        <td class="action_td">
          <template v-if="editingField !== 'systemTitle'">
            <el-button @click="startFieldEdit('systemTitle', systemInfo?.systemTitle)" icon="Edit" size="small" type="text">编辑</el-button>
          </template>
        </td>
      </tr>
      <tr>
        <td class="left_td">产品名称：</td>
        <td>
          <template v-if="editingField !== 'productName'">{{systemInfo?.productName}}</template>
          <el-input v-else ref="productNameInput" v-model="editValue" size="small" class="edit-input" @blur="saveField('productName')" @keyup.enter="saveField('productName')" />
        </td>
        <td class="action_td">
          <template v-if="editingField !== 'productName'">
            <el-button @click="startFieldEdit('productName', systemInfo?.productName)" icon="Edit" size="small" type="text">编辑</el-button>
          </template>
        </td>
      </tr>
      <tr>
        <td class="left_td">产品版本：</td>
        <td>
          <template v-if="editingField !== 'productVersion'">{{systemInfo?.productVersion}}</template>
          <el-input v-else v-model="editValue" size="small" class="edit-input" @blur="saveField('productVersion')" @keyup.enter="saveField('productVersion')" />
        </td>
        <td class="action_td">
          <template v-if="editingField !== 'productVersion'">
            <el-button @click="startFieldEdit('productVersion', systemInfo?.productVersion)" icon="Edit" size="small" type="text">编辑</el-button>
          </template>
        </td>
      </tr>
      <tr>
        <td class="left_td">产品简介：</td>
        <td>
          <template v-if="editingField !== 'productIntroduction'"><pre class="pre-style">{{systemInfo?.productIntroduction}}</pre></template>
          <el-input v-else v-model="editValue" type="textarea" autosize class="edit-textarea" @blur="saveField('productIntroduction')" />
        </td>
        <td class="action_td">
          <template v-if="editingField !== 'productIntroduction'">
            <el-button @click="startFieldEdit('productIntroduction', systemInfo?.productIntroduction)" icon="Edit" size="small" type="text">编辑</el-button>
          </template>
        </td>
      </tr>
      <tr>
        <td class="left_td">客服电话：</td>
        <td>
          <template v-if="editingField !== 'servicePhone'">{{systemInfo?.servicePhone}}</template>
          <el-input v-else v-model="editValue" size="small" class="edit-input" @blur="saveField('servicePhone')" @keyup.enter="saveField('servicePhone')" />
        </td>
        <td class="action_td">
          <template v-if="editingField !== 'servicePhone'">
            <el-button @click="startFieldEdit('servicePhone', systemInfo?.servicePhone)" icon="Edit" size="small" type="text">编辑</el-button>
          </template>
        </td>
      </tr>
      <tr>
        <td class="left_td">客服邮箱：</td>
        <td>
          <template v-if="editingField !== 'serviceEmail'">{{systemInfo?.serviceEmail}}</template>
          <el-input v-else v-model="editValue" size="small" class="edit-input" @blur="saveField('serviceEmail')" @keyup.enter="saveField('serviceEmail')" />
        </td>
        <td class="action_td">
          <template v-if="editingField !== 'serviceEmail'">
            <el-button @click="startFieldEdit('serviceEmail', systemInfo?.serviceEmail)" icon="Edit" size="small" type="text">编辑</el-button>
          </template>
        </td>
      </tr>
      <tr>
        <td class="left_td">技术支持：</td>
        <td>
          <template v-if="editingField !== 'technicalEmail'">{{systemInfo?.technicalEmail}}</template>
          <el-input v-else v-model="editValue" size="small" class="edit-input" @blur="saveField('technicalEmail')" @keyup.enter="saveField('technicalEmail')" />
        </td>
        <td class="action_td">
          <template v-if="editingField !== 'technicalEmail'">
            <el-button @click="startFieldEdit('technicalEmail', systemInfo?.technicalEmail)" icon="Edit" size="small" type="text">编辑</el-button>
          </template>
        </td>
      </tr>
      <tr>
        <td class="left_td">官网链接：</td>
        <td>
          <template v-if="editingField !== 'integrateLink'">{{systemInfo?.integrateLink}}</template>
          <el-input v-else v-model="editValue" size="small" class="edit-input" @blur="saveField('integrateLink')" @keyup.enter="saveField('integrateLink')" />
        </td>
        <td class="action_td">
          <template v-if="editingField !== 'integrateLink'">
            <el-button @click="startFieldEdit('integrateLink', systemInfo?.integrateLink)" icon="Edit" size="small" type="text">编辑</el-button>
          </template>
        </td>
      </tr>
      <tr>
        <td class="left_td">版权信息：</td>
        <td>
          <template v-if="editingField !== 'copyright'">{{systemInfo?.copyright}}</template>
          <el-input v-else v-model="editValue" size="small" class="edit-input" @blur="saveField('copyright')" @keyup.enter="saveField('copyright')" />
        </td>
        <td class="action_td">
          <template v-if="editingField !== 'copyright'">
            <el-button @click="startFieldEdit('copyright', systemInfo?.copyright)" icon="Edit" size="small" type="text">编辑</el-button>
          </template>
        </td>
      </tr>
    </table>
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick } from "vue";
import { SystemService } from '@/service/api';
import { SystemInfo } from '@/types/type-system';
import { ElMessage } from 'element-plus';

const systemInfo = ref<SystemInfo>();
const editingField = ref<string | null>(null);
const editValue = ref('');
const logoInput = ref<HTMLInputElement | null>(null);
const systemLogoInput = ref<HTMLInputElement | null>(null);
const bannerInput = ref<HTMLInputElement | null>(null);

const getSystemInfoFun = async () => {
  SystemService.getSystemInfo().then((res: any) => {
      systemInfo.value = res;
    })
};

const startFieldEdit = async (field: string, value: string | undefined) => {
  editingField.value = field;
  editValue.value = value || '';
  await nextTick();
};

const saveField = async (field: string) => {
  if (!systemInfo.value || editingField.value !== field) return;

  const updateData: Partial<SystemInfo> = { ...systemInfo.value };
  (updateData as any)[field] = editValue.value;

  try {
    const result = await SystemService.updateSystemInfo(updateData as SystemInfo);
    ElMessage.success('保存成功');
    await getSystemInfoFun();
  } catch (error) {
    console.error('保存失败:', error);
    ElMessage.error('保存失败');
  } finally {
    editingField.value = null;
    editValue.value = '';
  }
};

const triggerLogoUpload = () => {
  logoInput.value?.click();
};

const handleIconUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  if (!file.name.endsWith('.ico')) {
    ElMessage.error('请选择.ico格式文件');
    return;
  }

  try {
    const result = await SystemService.uploadIcon(file);
    ElMessage.success('上传成功');
    await getSystemInfoFun();
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error('上传失败');
  }

  target.value = '';
};

const triggerSystemLogoUpload = () => {
  systemLogoInput.value?.click();
};

const handleLogoUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  
  if (!file.name.endsWith('.png')) {
    ElMessage.error('请选择.png格式文件');
    return;
  }
  
  try {
    const result = await SystemService.uploadLogo(file);
    ElMessage.success('上传成功');
    await getSystemInfoFun();
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error('上传失败');
  }
  
  target.value = '';
};

const triggerBannerUpload = () => {
  bannerInput.value?.click();
};

const handleBannerUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  
  if (!file.name.endsWith('.png')) {
    ElMessage.error('请选择.png格式文件');
    return;
  }
  
  try {
    const result = await SystemService.uploadBanner(file);
    ElMessage.success('上传成功');
    await getSystemInfoFun();
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error('上传失败');
  }
  
  target.value = '';
};

const getFullUrl = (url: string): string => {
  if (!url) return '';
  const timestamp = Date.now();
  if (url.startsWith('http')) {
    return `${url}?t=${timestamp}`;
  }
  return `/zenvis${url.startsWith('/') ? '' : '/'}${url}?t=${timestamp}`;
};

getSystemInfoFun();


</script>
<style lang="scss" scoped>
.about_it{
  .product_info{
    width: 60%;
    margin: 60px auto;
    background: url("@a/images/about.png") no-repeat center center;
    background-size: contain;
    tr,td{
      padding: 10px;
      font-size: 16px;
      line-height: 35px;
    }
    .left_td{
      text-align: right;
      vertical-align: top;
      width: 200px;
    }
    .action_td{
      width: 120px;
    }
    .logo-container{
      display: flex;
      align-items: center;
    }
    .logo-preview{
      width: 60px;
      height: 60px;
      object-fit: contain;
      border-radius: 4px;
      border: 1px solid #e4e7ed;
    }
    .banner-preview{
      width: 200px;
      height: 80px;
      object-fit: contain;
      border-radius: 4px;
      border: 1px solid #e4e7ed;
    }
    .logo-placeholder{
      width: 60px;
      height: 60px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 1px dashed #d9d9d9;
      border-radius: 4px;
      color: #999;
      font-size: 12px;
    }
    .logo-upload-input{
      display: none;
    }
    .pre-style{
      white-space: pre-wrap;
      white-space: -moz-pre-wrap;
      white-space: -pre-wrap;
      white-space: -o-pre-wrap;
      word-wrap: break-word;
      margin: 0;
      color: #495b73;
      line-height: 35px;
      font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","\5FAE\8F6F\96C5\9ED1",Arial,sans-serif;
    }
    .edit-input{
      width: 300px;
    }
    .edit-textarea{
      width: 300px;
    }
    .el-icon-info{
      color: #3988ff;
      cursor: pointer;
      font-size: 16px;
    }
  }
}
</style>
