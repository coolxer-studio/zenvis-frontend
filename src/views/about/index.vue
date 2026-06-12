<template>
  <div class="main-content about_it">
    <table id="about_it_id" class="product_info">
      <tr>
        <td class="left_td">产品名称：</td>
        <td>{{systemInfo?.productName}}</td>
      </tr>
      <tr>
        <td class="left_td">产品版本：</td>
        <td>{{systemInfo?.productVersion}}</td>
      </tr>
      <tr>
        <td class="left_td">产品简介：</td>
        <td>
          <pre class="pre-style">{{systemInfo?.productIntroduction}}</pre>
        </td>
      </tr>
      <tr>
        <td class="left_td">客服电话：</td>
        <td>{{systemInfo?.servicePhone}}</td>
      </tr>
      <tr>
        <td class="left_td">客服邮箱：</td>
        <td>{{systemInfo?.serviceEmail}}</td>
      </tr>
      <tr>
        <td class="left_td">技术支持：</td>
        <td>{{systemInfo?.technicalEmail}}</td>
      </tr>
    </table>
  </div>

</template>
<script setup lang="ts">
  import {ref} from "vue";
  import { SystemService } from '@/service/api/api-system';
import { SystemInfo } from '@/service/types/type-system';
  const systemInfo = ref<SystemInfo>();
  const getSystemInfoFun = async () => {
      try {
        systemInfo.value = await SystemService.getSystemInfo();
      } catch (error) {
        console.error('获取系统信息失败:', error);
      }
    };
  getSystemInfoFun()
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
      .pre-style{
        white-space: pre-wrap; /* css-3 */
        white-space: -moz-pre-wrap; /* Mozilla, since 1999 */
        white-space: -pre-wrap; /* Opera 4-6 */
        white-space: -o-pre-wrap; /* Opera 7 */
        word-wrap: break-word; /* Internet Explorer 5.5+ */
        margin: 0;
        color: #495b73;
        line-height: 35px;
        font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei","\5FAE\8F6F\96C5\9ED1",Arial,sans-serif;
      }
      .el-icon-info{
        color: #3988ff;
        cursor: pointer;
        font-size: 16px;
      }
    }
  }
</style>
