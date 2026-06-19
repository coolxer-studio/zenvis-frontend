<template>
  <div class="container">
    <!-- 顶部下拉标签 -->
    <div class="drawer-trigger" @click="toggleDrawer">
      <el-icon v-if="drawerVisible"><ArrowUp /></el-icon>
      <el-icon v-else><ArrowDown /></el-icon>
    </div>
    
    <!-- 三个面板 -->
    <div class="panels-container">
      <el-splitter direction="horizontal">
        <el-splitter-panel collapsible :size="20" min="10">
          <ViewLeft />
        </el-splitter-panel>
        <el-splitter-panel collapsible :size="50" min="20">
          <ViewCenter :suggestions="mySuggestions" />
        </el-splitter-panel>
        <el-splitter-panel v-if="route.query.type && route.query.type !== 'ask'" collapsible :size="30" min="20">
          <ViewRightPlugin v-if="route.query.type && route.query.type === 'agent_plugin'" />
          <ViewRightInspect v-if="route.query.type && route.query.type === 'agent_inspect'" />
          <ViewRightAnalysis v-if="route.query.type && route.query.type === 'agent_analysis'" />
          <ViewRightDispose v-if="route.query.type && route.query.type === 'agent_dispose'" />
          <ViewRightCheck v-if="route.query.type && route.query.type === 'agent_check'" />
          <ViewRightReport v-if="route.query.type && route.query.type === 'agent_report'" />
        </el-splitter-panel>
      </el-splitter>
    </div>
    
    <!-- 自定义下拉抽屉 -->
    <div class="custom-drawer" :class="{ 'drawer-open': drawerVisible }">
      <ViewDrawer @close="toggleDrawer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import ViewLeft from './components/view-left.vue'
import ViewCenter from './components/view-center.vue'
import ViewRightPlugin from './components/view-right-plugin.vue'
import ViewRightInspect from './components/view-right-inspect.vue'
import ViewRightAnalysis from './components/view-right-analysis.vue'
import ViewRightDispose from './components/view-right-dispose.vue'
import ViewRightCheck from './components/view-right-check.vue'
import ViewRightReport from './components/view-right-report.vue'

import ViewDrawer from './components/view-drawer.vue'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  ArrowDown, ArrowUp, Monitor, Paperclip, Position, Opportunity, Promotion,
  MagicStick, Reading, DataAnalysis, ScaleToOriginal, Search, VideoPlay,
  Loading
} from '@element-plus/icons-vue'

const route = useRoute()

// 抽屉显示状态
const drawerVisible = ref(false)

// 切换抽屉显示/隐藏
const toggleDrawer = () => {
  drawerVisible.value = !drawerVisible.value
}

// 定义建议接口
interface Suggestion {
  type: string
  label: string
  icon: any
}
// 建议数据
const mySuggestions = ref<Suggestion[]>([
  { type :'agent_inspect', label: '智能巡检', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAEaklEQVR4nO2czYtWVRjAf+9YyrgoLRc1Bn0soi91G0gTBNEiNKMvXVYWjKULF5GLEKRNFBRBpY3/g6sW0oxitck+VlqTmRISUVOT1YQOWG888CxEPPfec++57znn3ucHDwwv9z3P1517nnPOc18wDMMwDMMwDMMwDMMwDDfDBpILw5R9TNq4PviYtHF98DFp4/rgY9LG9cHHpI3rg4+5BzcUloDIWAIi05sEDID1wE5gP3AUOA0sAEsqC/rZEb1Grl2n322LTidgAEwCB4FfG0yIvwDTwAMtJKOTCVgObAdONaxEribfAc+rjhB0LgHbgHMtBP5K+RHYmnAcRq74dmBmBIG/Uj5W3anEIYriLTqBDiPJn8DTCcRh5MiE+LpHoC4As8BrwGPA3cBq4FqV1frZFr3miH6nytj/AfvoEcuADysG53PgOeC6Gnqu10n3eEVdB9S2TjOoGPzjwEMB9T4MfFkxCZ2m7LGzCEwBYy3olrv7ZeCfEhs6+zh6osTxE/ocb5t7gW9K5gSZSzrFHcAfBU5/AqwaoT0yaX9WYI9UZrfRIWZKgj8ewaaVJUk4TEfYVvLYWRXRthuAbwvse4rMWV6wvbA4omd+GfcVTMxndZ2RLdsL7q4p0mFngZ3PknHNf6qgzh8jHaRE/cph61zL5wqtMVlwV4VcZIXikQJ7N5IhBwu2F5quaqf1zlzU8vZr4G09OWvCFw6b5ZQtKwYFJ1myt1OHO4FjJYu5Vxva/YJj3J9zewytdzhyoebG2mTFbeubG9otJfFFx9iygs4GV1UhW8p17vyFCsEXmQhg+1HH2C+REfsdTshevS/HKgY/xCNI2OsY+30ywnUXyWGK74Q79JAlTcKEyh5gg6fOxwP+90bjrMOJuzzHmfZMwNVEqiMf7nGM8wMZ8ZvDiRs9x5kLkAApUX1Y4xhnnoxYcjjh25Pzd4AEyDrBhxWOcaQ6yj4B4xES8FeNbersEzAfqEycC5AA2W72YcIxjiwss+GMwwnZ+vXhQIAE+JaP6xzjSPNvNnzqcGKz5zgPBkiANOb6sLng5C77hZh0Rfgy0yD4hwN2bnxARuxyOCHB9OWWgjmlSH4Hbq2hb9YxnmyvJEHTR0LXpXViOzhMXCwBWAJ6La0T28Fh4mIJoOMJMAzDMAzDMOrwRoVS7gzwYqC3Fse0z7/oPYC6B/hZIi1+71asqU8Cu2s2XE3od09W1PVObu2HTRhoz86/FYNzSQ953tQ32+XUaq2eMY/r39IO+Qzwll57qeLYYsMrZETIFeAm4HzEVau0PD6aQByiKr4JOBQh+B/pYU8qcYiueCvw/QgCL78b9GTCcYiq+Bp9r6zqxOkjJ/TdBNERgk4m4HI2am/oTw2Cfk5bW+4nPJ1PwOVIP9EO4D39KZrTelB/UWVeP5vVa6ZG8EJFrxKQIpaAyFgCIpNcAqpILgxT9jFp4/rgY9LG9cHHpI3rg49JG9cHH5M2LhB98NEwDMMwDMMwDMMwDMNgtPwPbwOTJQFzeWQAAAAASUVORK5CYII=' },
  { type :'agent_analysis', label: '研判分析', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAAECklEQVR4nO2d304UMRSHf7vcsDyAYiJc8CwSfQqFV4DwFioirJLovcClJKjvIMErFRH/XShciNxghGAxJR0zGTq709mZtj/mfEkTsukM55xvt9t2GgAEQWg20wC+mDYVOpimMQHgFMCZaafmNcETc6niJ02/JnhiyyJg09cvbzq3LMVP2mTo4C47IwC2ewh4B6ADcoYBPADw07R581po2gDWehQ/aSumLy33LEndjeCdv1ag+ElbZf4kfLck9CPwmL/tUPyk6WtughCVk1DLYwwTZlr5pkThs23L3ItmnRBawDSAvxUUPtv0Yu0OCAgt4FsNxU+a3raIntACvtYo4DMICC1gKrPPU+UQdBsEhBaQ/hLerKDwrwt+CY8D2AXwEcAYGi4gzaRZ4boWXl9zA8WZTV2rfw5GbAJgFlUrDsV/VmL1vp66Xv8cjBgFwGwvrBYsvutWxDUAJ6l7HAMYRSBiFZB8Et73KP7bEu98LeuV5V4vQu0pxSwAZnshT4DLmJ+8823FT9pL08crsQvIeyCjZztFGDdfsuuZYSevnZi+s75mRwwC5gZ4JLk7wJRWT1Frh0HAxAAP5XcGEPABHmAQALOxprcWPjmucK8DmAHw3Mx2+hX92PSdMdfWDouAKrhqZjt5xd8AcAWeKSugDU7aORI2WKahHQBLAA5NexjJM2QXRi0LMf3pAIOABUtf/VyZjfRWhB7zwSJg39JXP1dmg3IzrpXTV9+DjTEzz9/xNdu5rAKGIz3XVPgbPVYBbdZzTdlZymKfQ0uxCeiYmIvGH9u5pvOPYzag+0QC5i33n68ofi/sWYLRMxcWAXs1xu+Fs5wWWkC7YPyuBRUB6C1Aj99dh5WzCKhYwILjytmXgHZTBOw7rpzrFuA6y6IW0CohrG4BrrMsZ0QAevZ3nWU5IwJQaX9nRABEQIIIEAEXEAEQAaUDaomA/ogAiIAEESACLiACIAJKB9QSAf0RARABaQ4t/fXxkTxEQMUCupb+CxXF46M/vYAOgGUAvwEcAXgc+JFk4wSkry2SJL2AX5abHxAdS1E1F/TA0lfXrDKWLL9An0TIo2kCFi199WuVkYy5R6kxl+looqpZQMfUJKnPcl1/b66OMbd1CQSkc6ls3B+EpgqIBhEQGNcEDh1Xtq64zlIaJ6DruLJ1xXWW0jgBHceVrSuus5TGCfA1i6hr5Rwd7Ako8vjpE1Dk8dMnoMjjp09AkcdPn4Aij58+AUUeP30Cijx++gQUefz0CSjy+OkTUOTx0yegyOOnT0CRx0+fgCKPnz4BRR4/fQKKPH76BBR5/NaTdJWeFKsZ9vitz3gfgYcuefzn/7n0CYA/pj01r7EwQh7/f4ZMY2WIPH5BEARBEARBQIZ/wh7FjCde9BQAAAAASUVORK5CYII=' },
  { type :'agent_dispose', label: '策略控制', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAABLklEQVR4nO3RQWrDUBBEwb7/pScbbwMRSJr+cRVoZ0zPfwkAAAAAAHyN+eVr2HD1O9IUHCNABFgzBccIEAHWTMExRwa4a8Q0HHPiZgEiwJaKzQJEgC0VmwWIAFsqNgsQAbZUbP6GAHPxqxi39T9PEGDZ8QHe/M0TBPgQ4MK4rd88QYCPioPb9ggQAbZU7BEgAmyp2CNABNh6FAEiQN3jjgDnBpibvle1Pe4IIMCr2h53BBDgVW2POwKcG+AqASJA3eOOAP/jcf+iYo8AEWBLxR4BIsCWij0CRIAtFXsEiABbKvbcNWIajrm4rWKzABHgaQIsE2CZAMsEKFWxWYAIsKViswARYEvFZgFy1ObqY+am70hTcIwAEWDNFBwjQARYMwXHfHUAAAAAAADyn/0AMXYlPrAEZHQAAAAASUVORK5CYII=' },
  { type :'agent_check', label: '核验检查', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAACNUlEQVR4nO3cQWvUQBiH8WdzULfq5xZU3GIVFwq1n8FD8RP1JFrarjlGAnNR7O4mM8mbbJ4fDPTQbSf/N51kMpOCJEmSJEmSJEmSJEmShvEceAf8AB6BL8A6ulNLCv8GaP5p2+iOLTn8BriP7tySw2+Au+gOLjn8BvgQ3cklh3+Tvk+FPQO+HQj/O/AiuqNTVQGrnp/1zM/wGrgGamAHfOwYVG74Z8DndGFuZtJ+AZ9KzWeuM87WEmf+dgKB9m3bEsNO3TO4EuFXwO8JBNm37dIxZBXgsUeApcb8aukFII35XYIsfcHdTiDIvq19rpWtS6BD3O2sgYt0YWtm0n6mE7fYQ8Vjg/VWM3gita85yQosguEHFsHwA4tg+IFFMPzAIhj+iNrbyjfAbWrt195qSpIkSfqfVcYui0VpFxUu0/Jau4P5beZEq/3s+7TAUgNXwMuC/T05lwUXVp5a2LkaoN8nYd+ifNci7FtV25VYvD5V9wWWGA8taT6McByztclc5z1mPXkz4vHMTs5OB/eEBu5sdjd0YV0CNfyBuD9oAtwfNJO/hFJn/tnS3w8oVYS+w852AoH2bYO/73xsEfqGX7k9fT8LQFwBHIIY5/2A6Ivw2vcD/uZtaCAnYoF8FBHIh3GBfBwd7CIzwGOKcD7i8cxKlSYTYyxJrkY4ntnJ+VcFXYpQuyj/tK8Fx223pfTwKhWhTkPFpsDGrPP0s+oUfvs7dEDpMXrluC9JkiRJkiRJkiSG9gdfsHro6hq3IwAAAABJRU5ErkJggg==' },
  { type :'agent_report', label: '报表制作', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAADcklEQVR4nO2dPYsUQRCG31XQQ8M7PyM1WsEfoCAniwaCf+KiM1f/gd5hbqAGZgaHoYKouRcYq4ii5iqHH4GeBiUNM7AM0z09HzvV1VUPVHS7fVX1zNb29N5ygGEYhmEYhmEYhiEWSjyeAVhCxnA3mLRL4G4uaZfA3VjSLoG7qaRdAndDSbsEX5Gp5UO5SpAqgHKRIFkA5SBBugCSLkGKgKcNEtzP90MgUgTsA/A4x1eCFAHIVYIkAVlKkCYgOwkSBWQlQaqAbCRIFpCFBCkCqGckK0GLACpu1pJDkwBCgqSWKJkAEzAqqSVKJiDRRHOtS0yiudYlJtFc6xKTaK51iUk017rEJJprXWISzbUuKYmeB3Aow7pEJDoFsAPgFYADGdUlItEVAB/m8noEYE8GdS0k0csDn7m7tbZrctuIeK46AasA/hRX6GSAvNwaDwP5XW14vioB02JGl8+9OUBem4HcXPwFcCnwfDUCViozuoz1HjmtNTS/jB8AziyortHok+gSgJeBK/Rij1FGkfEZwJGB6xqVrolOGma0i++BKzRmlKmgq4DNyCv0E4DDEest14wyFXQRsNZiRFDEDZRvlKmgrYDVljO6DN/2NDTKVNBGwOnKjKZKfGyQcKtmzQ1Jb5iLILZ433aTKrM+1NDq9rRplKkgpnjfkQAVsVPsYMqRshV47C6AWRG7gcdtdch5zBhVwEEATwL7/VkHYaFRtt1wpqROgGMvgNstzmSWG0ZWn22rSgEl6wD+RZ5KVm+s+hwtxOSsQoDjCoAHkaeeTbO++t4QA2kX0JaYG7em4+V5uJsvTgAatqd19wcp5DzK7xqrmInnjjf2I0aOnEf5XWMWs1Q582nzIfs8JqAHbnv6vsUpaR0moCfTuTvnLpgAZkwAMyaAGRPAjAlgxgQwYwKYMQHMmABmTAAzJoAZE8CMCWDGBDBjApgxAcyoEDBm+Eg5h8Hgbj4lkpsJqCHlHAaDu/mUSG4moIaUcxgM7uaTdgEp89NT/NEea/5qsebxwF9xq+CdpwHXeqz5usWaNzyPfQsl3Pc04HfRsGMd1rwTsaaL64Fvg96FEmYJvD/VhfuqrhpeJNDw6v8hUMUJAF8SaLyLbwBOQSHnAHxlbr67CM5CMScZx9Hz4pVoALgA4F6xFfTt6fuGW/dNsdupfcP9D8jOia0/IPJCAAAAAElFTkSuQmCC' },
  { type :'agent_plugin', label: '插件制作', icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAxElEQVR4nO2WUQrCMBBE5xgWzHfOrg3kYiomF1gRRgjBIu62icU82J+0nZlCOikw2DEOQACQORGAb2l+BSDV3HhtcwINzwAOnLlY25xMs6fxi4lraU0j+TDW+/cTwMoIIN/ouKJgLAFUOm6hYDTmKp1QFYwWtU5+UzAa1Dq5d4DIB2dWqxa1jueJZt2EJh3HzZNW+AzNOvKXTfiTAaT3cSy9Amh+ye5oQKyKZir6/9QigF8omguAIxrhiqJJfPNm5gOsxQPpMbGNA2kKSAAAAABJRU5ErkJggg==' }
])

</script>

<style scoped>
.container {
  height: 100%;
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  box-shadow: var(--el-border-color-light) 0px 0px 10px;
  position: relative;
  overflow: hidden;
}

/* 抽屉触发器样式 */
.drawer-trigger {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background-color: var(--el-color-primary);
  color: white;
  padding: 5px 15px;
  border-radius: 0 0 8px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.drawer-trigger .el-icon {
  transition: transform 0.3s;
}

/* 自定义抽屉样式 */
.custom-drawer {
  position: absolute;
  top: -100%;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: white;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 5;
  transition: top 0.3s ease;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
}

.custom-drawer.drawer-open {
  top: 0;
}

/* 面板容器 */
.panels-container {
  height: 100%;
  position: relative;
  z-index: 1;
}
</style>