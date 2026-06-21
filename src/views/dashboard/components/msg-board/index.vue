<template>
  <div class="dashboard-wrap">
    <div class="title-bar">系统总览大屏</div>

    <div class="message-bar">
      <span class="message-bar-item">
        <b class="animation-1"></b>
        <b class="animation-2"></b>
        <b class="animation-3"></b>
        <p>消息总量</p>
        <strong>{{ summaryInfo?.msg_total ?? 0 }}</strong>
      </span>
      <span class="message-bar-item">
        <b class="animation-1"></b>
        <b class="animation-2"></b>
        <b class="animation-3"></b>
        <p>启动总量</p>
        <strong>{{ summaryInfo?.start_total ?? 0 }}</strong>
      </span>
      <span class="message-bar-item">
        <b class="animation-1"></b>
        <b class="animation-2"></b>
        <b class="animation-3"></b>
        <p>设备总量</p>
        <strong>{{ summaryInfo?.device_total ?? 0 }}</strong>
      </span>

      <div class="time-bar">
        <h2>
          <strong>{{ systemStatusInfo?.status || '正常运行' }}</strong>
          <span>系统状态综合评估</span>
          <b class="logoline"></b>
          <b class="logoline1"></b>
          <b class="logoline2"></b>
          <b class="logoline3"></b>
        </h2>
        <div class="date-timer">
          <div>
            <strong id="H">{{ timeData.hours || '' }}</strong>
            <strong id="M">{{ timeData.minutes || '' }}</strong>
          </div>
          <em id="D">{{ timeData.weekday || '' }}</em>
          <ul>
            <li id="Y">{{ timeData.year || '' }}</li>
            <li id="MH">{{ timeData.month || '' }}</li>
            <li id="TD">{{ timeData.day || '' }}</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="middle">
      <div class="left-area">
        <ul>
          <li>
            <span class="submenu-item">
              <b>{{ systemStatusInfo?.service_status?.count }}</b>
              <span>{{ systemStatusInfo?.service_status?.info }}<em></em></span>
            </span>
          </li>
          <li>
            <span class="submenu-item">
              <b>{{ systemStatusInfo?.msg_status?.count }}</b>
              <span>{{ systemStatusInfo?.msg_status?.info }}<em></em></span>
            </span>
          </li>
          <li>
            <span class="submenu-item">
              <b>{{ systemStatusInfo?.to_do?.count }}</b>
              <span>{{ systemStatusInfo?.to_do?.info }}<em></em></span>
            </span>
          </li>
        </ul>
      </div>

      <div class="center-area">
        <div class="pandect-area">
          <span class="pandect-area-left">
            <b></b>
          </span>
          <div class="pandect-area-center">
            <msgChartTrend :timeObject="timeObject" />
          </div>
          <span class="pandect-area-right">
            <b></b>
          </span>
        </div>
      </div>

      <div class="right-area">
        <h3>系统运行效率</h3>
        <div class="area-inbox-1">
          <dl>
            <dt>消息接收时延</dt>
            <dd class="font12">
              <span>{{ efficiencyInfo?.receive_delay ?? 0 }}</span
              ><b></b>
            </dd>

            <dt class="ml-20">每分钟接收消息数</dt>
            <dd class="font-red ml-20">
              <span>{{ efficiencyInfo?.msg_count_for_minute ?? 0 }}</span
              ><b></b>
            </dd>

            <dt>消息处理时延</dt>
            <dd>
              <span>{{ efficiencyInfo?.process_delay ?? 0 }}</span
              ><b></b>
            </dd>
          </dl>

          <div class="round-1"></div>
          <div class="round-2"></div>
          <div class="round-3">{{ efficiencyInfo?.ratio ?? 0 }}%</div>
          <div class="round-4"></div>
        </div>
      </div>
    </div>

    <div class="chart-bar">
      <div class="chart-bar-item details1-area">
        <span class="detailsl-area-left"></span>
        <div class="details1-area-center">
          <msgChartLocation :timeObject="timeObject" />
        </div>
        <span class="detailsl-area-right"></span>
      </div>
      <div class="chart-bar-item details2-area">
        <span class="details2-area-left"></span>
        <div class="details2-area-center">
          <msgChartDevice :timeObject="timeObject" />
        </div>
        <span class="details2-area-right"></span>
      </div>
    </div>

    <div class="bottom-area">
      <div class="area-button">
        <button
          class="transparent-border-button"
          :class="activeKey == 0 ? 'button-active' : ''"
          @click="getTime(0)"
        >
          近一天
        </button>
        <button
          class="transparent-border-button"
          :class="activeKey == -1 ? 'button-active' : ''"
          @click="getTime(-1)"
        >
          昨天
        </button>
        <button
          class="transparent-border-button"
          :class="activeKey == 7 ? 'button-active' : ''"
          @click="getTime(7)"
        >
          最近7天
        </button>
      </div>
      <div class="area-text">
        <img class="img-border" :src="left_border" />
        <div class="msg-content">
          <h4>当前信息：</h4>
          <div ref="textOuterRef" class="text-outer" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
            <div ref="textInnerRef" class="text-inner">
              <span class="text-item" v-for="(item, index) in realInfo" :key="index"
                >* {{ item }}</span
              >
            </div>
          </div>
        </div>
        <img class="img-border" :src="right_border" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch, ref, reactive } from 'vue';

import dayjs from 'dayjs';

import msgChartTrend from './msg-chart-trend.vue';
import msgChartLocation from './msg-chart-location.vue';
import msgChartDevice from './msg-chart-device.vue';
import { HomeService } from '@/service/api';

import left_border from '@a/images/bg01righttext.png';
import right_border from '@a/images/bg02righttext.png';

const activeKey = ref(0);
const timeObject = ref({});
const summaryInfo = ref({});
const systemStatusInfo = ref({});
const efficiencyInfo = ref({});
const realInfo = ref([]);

// 时间相关数据
const timeData = reactive({
  year: '',
  month: '',
  day: '',
  weekday: '',
  hours: '',
  minutes: ''
});

// 滚动相关
const textOuterRef = ref(null);
const textInnerRef = ref(null);
let scrollTimer = null;
const intervalTime = 100;

const getTime = (num = 0) => {
  const end = new Date();
  const start = new Date();
  activeKey.value = num;

  switch (num) {
    case 0:
      timeObject.value = {
        start_time: dayjs(new Date(new Date(new Date().toLocaleDateString()).getTime())).format(
          'YYYY-MM-DD HH:mm:ss',
        ),
        end_time: dayjs(
          new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1),
        ).format('YYYY-MM-DD HH:mm:ss'),
      };
      break;
    case 7:
      timeObject.value = {
        start_time: dayjs(
          new Date(
            Number(new Date(new Date(new Date().toLocaleDateString()).getTime())) -
              3600 * 1000 * 24 * 6,
          ),
        ).format('YYYY-MM-DD HH:mm:ss'),
        end_time: dayjs(
          new Date(new Date(end.toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1),
        ).format('YYYY-MM-DD HH:mm:ss'),
      };
      break;
    default:
      start.setTime(
        Number(new Date(new Date(new Date().toLocaleDateString()).getTime())) -
          3600 * 1000 * 24 * 1,
      );
      end.setTime(
        Number(
          new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1),
        ) -
          3600 * 1000 * 24 * 1,
      );
      timeObject.value = {
        start_time: dayjs(start).format('YYYY-MM-DD HH:mm:ss'),
        end_time: dayjs(end).format('YYYY-MM-DD HH:mm:ss'),
      };
  }
};

const querySystemStatus = () => {
  HomeService.getSystemStatus()
    .then(data => {
      systemStatusInfo.value = data;
    })
    .catch(error => {
      console.error('获取系统状态失败:', error);
    });
};

const querySystemEfficiency = () => {
  HomeService.getSystemEfficiency()
    .then(data => {
      efficiencyInfo.value = data;
    })
    .catch(error => {
      console.error('获取系统效率失败:', error);
    });
};

const querySystemRealInfo = () => {
  HomeService.getSystemRealInfo()
    .then(data => {
      realInfo.value = data?.info_list || [];
    })
    .catch(error => {
      console.error('获取实时信息失败:', error);
    });
};

const querySystemSummary = params => {
  HomeService.getSystemSummary(params)
    .then(data => {
      summaryInfo.value = data;
    })
    .catch(error => {
      console.error('获取系统摘要失败:', error);
    });
};

// 滚动处理函数
const startScroll = () => {
  // 先清除已存在的定时器
  if (scrollTimer) {
    clearInterval(scrollTimer);
  }

  // 确保DOM元素存在
  if (!textOuterRef.value || !textInnerRef.value) {
    return;
  }

  // 复制内容以实现无缝滚动
  const innerContent = textInnerRef.value.innerHTML;
  textInnerRef.value.innerHTML = innerContent + innerContent;

  // 只有当内容足够滚动时才启动定时器
  if (textInnerRef.value.offsetHeight > textOuterRef.value.offsetHeight) {
    scrollTimer = setInterval(() => {
      // 当滚动到底部时重置到顶部
      if (textOuterRef.value.scrollTop >= textInnerRef.value.offsetHeight / 2) {
        textOuterRef.value.scrollTop = 0;
      }
      textOuterRef.value.scrollTop += 1;
    }, intervalTime);
  }
};

// 鼠标悬停事件处理
const handleMouseEnter = () => {
  if (scrollTimer) {
    clearInterval(scrollTimer);
  };
};

const handleMouseLeave = () => {
  if (scrollTimer) {
    clearInterval(scrollTimer);
  }
  startScroll();
};

// 时间处理函数
const showTime = () => {
  const today = new Date();
  const weekdays = ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'];

  timeData.year = today.getFullYear() + '年';
  timeData.month = (today.getMonth() + 1) + '月';
  timeData.day = today.getDate() + '日';
  timeData.weekday = weekdays[today.getDay() - 1] || '';
  
  let hours = today.getHours();
  let minutes = today.getMinutes();
  
  timeData.hours = hours < 10 ? '0' + hours : hours + ':';
  timeData.minutes = minutes < 10 ? '0' + minutes : minutes;
};

let timeTimer = null;

onMounted(() => {
  // 初始化时间显示
  showTime();
  // 每秒更新时间
  timeTimer = setInterval(showTime, 1000);
  
  getTime();

  querySystemStatus();
  querySystemEfficiency();
  querySystemRealInfo();

  // 延迟启动滚动效果
  setTimeout(() => {
    startScroll();
  }, 3000);
});

// 组件销毁前清理定时器和事件监听
onBeforeUnmount(() => {
  if (scrollTimer) {
    clearInterval(scrollTimer);
  }
  if (timeTimer) {
    clearInterval(timeTimer);
  }
});

watch(
  () => timeObject.value,
  newValue => {
    querySystemSummary(newValue);
  },
  {
    deep: true,
  },
);

watch(
  () => realInfo.value,
  () => {
    // 当realInfo变化时重新启动滚动
    setTimeout(() => {
      startScroll();
    }, 100);
  }
);
</script>

<style lang="less" scoped>
.dashboard-wrap {
  min-height: 100%;
  color: #fff;
  padding-bottom: 30px;
  box-sizing: border-box;
  background: url('@a/images/bg002.jpg') 50% 50% no-repeat;
  background-size: 100% 100%;
  background-color: #000;

  .title-bar {
    font-size: 18px;
    text-align: center;
    padding: 12px 0 16px 0;
    background: url('@a/images/bg01top.png') center bottom no-repeat;
    font-weight: 500;
  }

  .message-bar {
    position: relative;
    padding-top: 20px;
    height: 120px;
    display: flex;
    justify-content: center;

    &-item {
      transition: all 0.1s ease;
      position: relative;
      display: inline-block;
      overflow: hidden;
      min-width: 145px;
      height: 56px;
      padding: 10px 0 0 30px;
      background: url('@a/images/bg01bigindex.png') 0 0 no-repeat;
      margin-right: 40px;

      &:last-of-type{
        margin-right: 0;
      }

      strong {
        display: block;
        color: #fff;
        font-family: 'electronicFont';
        font-size: 22px;
        line-height: 26px;
      }

      p {
        display: block;
        color: #b8b9bb;
        font-size: 12px;
        line-height: 16px;
      }

      .animation-1 {
        -webkit-animation-iteration-count: infinite; 
        -webkit-animation-name: bounceInLeft1;
        -webkit-animation-duration: 9000ms; 
        position: absolute;
        left: 12px;
        bottom: 1px;
        height: 5px;
        width: 345px;
        background: url('@a/images/bg04bigindex.png') 0 0 repeat-x;
      }

      .animation-2 {
        position: absolute;
        right: 0;
        top: 1px;
        height: 16px;
        width: 15px;
        background: url('@a/images/bg02bigindex.png') 0 0 no-repeat;
      }

      .animation-3 {
        position: absolute;
        right: -1px;
        bottom: 1px;
        height: 4px;
        width: 4px;
        background: url('@a/images/bg03bigindex.png') 50% 50% no-repeat;
      }
    }

    .time-bar{
      position: absolute;
      top: 0;
      left: 0;
      width: 300px;
      height: 200px;

      h2 {
        -webkit-animation: fadeInLeft 1s .1s ease both;
        font-size: 24px;
        font-weight: normal;
        position: absolute;
        left: 30px;
        top: 40px;
        color: #fff;

        strong {
          display: block;
          font-weight: normal;
          line-height: 24px;
        }

        span {
          height: 8px;
          font-size: 10px;
          display: block;
          line-height: 44px;
        }

        .logoline {
          position: absolute;
          left: 0;
          top: 32px;
          width: 200px;
          height: 2px;
          background: url('@a/images/logoline.png') 50% 50% no-repeat;
          display: block;
        }
  
        .logoline1 {
          position: absolute;
          z-index: 3;
          left: -30px;
          top: -34px;
          width: 41px;
          height: 29px;
          background: url('@a/images/logoline1.png') 50% 50% no-repeat;
          display: block;
        }
  
        .logoline2 {
          position: absolute;
          z-index: 3;
          left: 55px;
          top: 58px;
          width: 152px;
          height: 26px;
          background: url('@a/images/logoline2.png') 50% 50% no-repeat;
          display: block;
        }
  
        .logoline3 {
          -webkit-animation-duration: 2s;
          -webkit-animation-iteration-count: infinite;
          -webkit-animation-name: forotate;
          -webkit-animation-duration: 6000ms;
  
          position: absolute;
          z-index: -1;
          left: -10px;
          top: -41px;
          width: 121px;
          height: 121px;
          background: url('@a/images/logoline3.png') 50% 50% no-repeat;
          display: block;
        }
      }

      .date-timer {
        text-align: center;
        position: absolute;
        left: 146px;
        top: 26px;
        strong {
          display: inline-block;
          font-family: 'electronicFont';
          font-size: 36px;
          line-height: 50px;
        }
        em {
          display: block;
        }
        ul {
          font-family: 'electronicFont';
          font-size: 12px;
          margin-top: 4px;
          li {
            display: inline-block;
          }
        }
      }
    }
  }

  .middle{
    position: relative;
    display: flex;
    justify-content: center;

    .left-area {
      -webkit-animation: bounceInLeft 0.1s 1s ease both;
      background: url('@a/images/bg01submenu.png') 0 50% no-repeat;
      height: 564px;
      position: absolute;
      left: 0;
      top: 30px;
      min-width: 18px;
      ul {
        float: left;
        width: 120px;
        overflow: visible;
        margin: 30px 0 0 10px;
        display: block;
        li {
          font-size: 14px;
          display: block;
    
          .submenu-item {
            display: flex;
            font-family: 'electronicFont';
            transition: width ease 0.3s;
            border-top: 1px solid transparent;
            height: 26px;
            line-height: 26px;
            color: #fff;
    
            &:hover b,
            &.active b {
              background: url('@a/images/bg03submenu.png') 1px 50% no-repeat #0067e6;
            }
    
            &:hover span,
            .active span {
              left: 0;
              display: block;
              background: #0067e6;
            }
    
            &:hover span em,
            &.active span em {
              display: block;
              position: absolute;
              right: -10px;
              top: 0;
              height: 26px;
              width: 10px;
              background: url('@a/images/bg02submenu.png') 0 0 no-repeat;
            }
    
            b {
              display: inline-block;
              height: 26px;
              line-height: 26px;
              background: url('@a/images/bg03submenu.png') 1px 50% no-repeat #0050b3;
              min-width: 14px;
              padding: 0 8px;
            }

            &:hover span{
              -webkit-animation: bounceInLeft .2s .2s ease both;
            }

            &.active span{
              -webkit-animation: all 0s 0s ease both;
            }
    
            span {
              -webkit-animation: bounceInRight .2s .2s ease both;
              left: -140px;
              padding-left: 5px;
              padding-right: 10px;
              float: left;
              white-space: nowrap;
              font-family: 'microsoft yahei', simhei;
              height: 26px;
              line-height: 26px;
              background: #0050b3;
              position: relative;
    
              em {
                position: absolute;
                right: -10px;
                top: 0;
                height: 26px;
                width: 10px;
                background: url('@a/images/bg04submenu.png') right center no-repeat;
              }
            }
          }
        }
      }
    }

    .right-area {
      position: absolute;
      right: 0;
      top: 0px;
      color: #fff;

      -webkit-animation: bounceInRight2 0.8s 0.3s ease both;
    
      h3 {
        position: relative;
        top: 20px;
        background: url('@a/images/bg04rightarea.png') 6px bottom no-repeat;
        padding-bottom: 6px;
        padding-left: 6px;
        font-size: 14px;
        font-weight: normal;
        color: #fff;
    
        -webkit-animation-iteration-count: infinite;
        -webkit-animation-name: flash1;
        -webkit-animation-duration: 0.2ms;
    
        b {
          position: absolute;
          left: 0;
          top: 0;
          display: block;
          width: 7px;
          height: 7px;
          background: url('@a/images/bg03rightarea.png') right 0 no-repeat;
        }
      }

      .area-inbox-1 {
        width: 300px;
        height: 270px;
        background: url('@a/images/bg01rightarea.png') right bottom no-repeat;

        dl {
          padding: 78px 0 0 130px;
          font-size: 12px;
        
          dt {
            color: rgba(255, 255, 255, 0.3);
            margin-top: 4px;
          }
        
          dd {
            position: relative;
            height: 22px;
            line-height: 24px;
           
            span {
              font-family: 'electronicFont';
              position: relative;
              z-index: 1;
              font-size: 22px;
              margin-top: 6px;
              letter-spacing: 1px;
              opacity: 1;
            }
        
            b {
              -webkit-animation-iteration-count: infinite;
              -webkit-animation-name: flash2;
              -webkit-animation-duration: 3000ms;
              position: absolute;
              left: -5px;
              top: 30%;
              display: block;
              width: 74px;
              height: 17px;
              background: url('@a/images/bg07rightarea.png') left bottom no-repeat;
            }

            &:nth-child(2) b {
              -webkit-animation-iteration-count: infinite;
              -webkit-animation-name: flash2;
              -webkit-animation-duration: 5000ms;
            }
        
            &:nth-child(3) b {
              -webkit-animation-iteration-count: infinite;
              -webkit-animation-name: flash2;
              -webkit-animation-duration: 1000ms;
            }
          }
        
          dd.font12 {
            font-size: 12px;
            line-height: 24px;
          }
        
          dd.font-red {
            color: #ff3114;
          }
        
          dd.ml-20,
          dt.ml-20 {
            margin-left: -18px;
          }
        }
      }

      .round-1 {
        position: absolute;
        left: 94px;
        top: 98px;
        width: 168px;
        height: 168px;
        border-radius: 100%;
        border: 1px dashed #fff;
        -webkit-animation-iteration-count: infinite;
        -webkit-animation-name: forotate;
        -webkit-animation-duration: 19000ms;
      }

      .round-2 {
        position: absolute;
        left: 79px;
        top: 84px;
        width: 198px;
        height: 198px;
        border-radius: 100%;
        border: 1px dashed rgba(255, 255, 255, 0.5);
        -webkit-animation-iteration-count: infinite;
        -webkit-animation-name: forotate1;
        -webkit-animation-duration: 8000ms;
      }

      .round-3 {
        position: absolute;
        left: 50px;
        top: 68px;
        width: 40px;
        height: 40px;
        border: 1px solid rgba(255, 255, 255, 0.8);
        text-align: center;
        line-height: 40px;
        font-family: 'electronicFont';
        font-size: 14px;
        border-radius: 100%;
        background: url('@a/images/bg05rightarea.png') right bottom no-repeat;
        -webkit-animation-iteration-count: infinite;
        -webkit-animation-name: whitePulse;
        -webkit-animation-duration: 2s;
      }

      .round-4 {
        position: absolute;
        left: 36px;
        top: 105px;
        width: 23px;
        height: 23px;
        border-radius: 100%;
        background: url('@a/images/bg06rightarea.png') right bottom no-repeat;
        box-shadow: 0 0 12px #fff;
        -webkit-animation-iteration-count: infinite;
        -webkit-animation-name: forotate;
        -webkit-animation-duration: 4000ms;
      }
    }

    .center-area {
      flex: 1;
      margin: 30px 365px 0 265px;
      position: relative;

      .pandect-area {
        background: url('@a/images/bg02pandect.png') center top no-repeat;
        height: 292px;
        margin: 0 68px;
        position: relative;
        padding-top: 1px;

        .pandect-area-left {
          position: absolute;
          left: -68px;
          top: 0;
          display: block;
          width: 68px;
          height: 292px;
          background: url('@a/images/bg01pandect.png') center top no-repeat;
        }

        .pandect-area-right {
          position: absolute;
          right: -68px;
          top: 0;
          display: block;
          width: 68px;
          height: 292px;
          background: url('@a/images/bg03pandect.png') center top no-repeat;
        }
      }
    }
  }

  .chart-bar{
    display: flex;
    padding: 20px 50px;
    position: relative;

    &-item{
      display: flex;
      position: relative;
      flex: 1;
      margin-top: 30px;
      height: 240px;
      text-align: center;
    }

    .details1-area{
      margin-right: 40px;
    }

    .detailsl-area-left {
      display: block;
      width: 122px;
      background: url('@a/images/bg01details03.png') center bottom no-repeat;
    }
    .detailsl-area-right {
      display: block;
      width: 121px;
      background: url('@a/images/bg01details05.png') center bottom no-repeat;
    }
    .details1-area-center {
      flex: 1;
      background: url('@a/images/bg01details04.png') center bottom repeat-x;
    }

    .details2-area h3,
    .details2-area dl {
      margin-left: 40px !important;
    }
    .details2-area-left {
      display: block;
      width: 122px;
      background: url('@a/images/bg01details01.png') center bottom no-repeat;
    }
    .details2-area-right {
      display: block;
      width: 121px;
      background: url('@a/images/bg01details02.png') center bottom no-repeat;
    }
    .details2-area-center {
      flex: 1;
      float: left;
      background: url('@a/images/bg01details06.png') center bottom repeat-x;
    }
  }

  .bottom-area{
    height: 320px;
    margin-top: 20px;
 
    .area-text {
      display: flex;
      margin: auto;
      width: 600px;
      height: 270px;
      padding: 14px;

      h4{
        color: #fff;
      }
    
      .img-border {
        display: block;
        width: auto;
      }

      .msg-content{
        display: flex;
        flex-direction: column;
        flex: 1;
        padding: 8px 0;

        .text-outer{
          flex: 1;
          padding-bottom: 12px;
          overflow-y: auto;
  
          .text-inner{
            .text-item{
              display: block;
              color: rgba(255, 255, 255, 0.6);
              line-height: 28px;
            }
          }
        }
      
      }
    }

    .area-button{
      display: flex;
      justify-content: center;

      .transparent-border-button {
        margin: 10px;
        background: transparent;
        border: 1px solid #ccc;
        color: #333;
        padding: 5px 10px;
        font-size: 12px;
        cursor: pointer;
        transition: background-color 0.3s, color 0.3s, border-color 0.3s;
        border-radius: 10px;
      }
      
      .transparent-border-button:hover,
      .button-active {
        background: #f2f2f2;
        color: #555;
        border-color: #999;
      }
    }
  }

  @-webkit-keyframes bounceInLeft {
    0% {
      opacity: 0;
      -webkit-transform: translateX(-50px);
    }
    60% {
      opacity: 1;
      -webkit-transform: translateX(0px);
    }
    80% {
      -webkit-transform: translateX(-10px);
    }
    100% {
      -webkit-transform: translateX(0);
    }
  }

  @-webkit-keyframes bounceInRight {
    0% {
      -webkit-transform: translateX(0);
    }
    60% {
      -webkit-transform: translateX(10px);
    }
    80% {
      opacity: 1;
      -webkit-transform: translateX(0px);
    }
    100% {
      opacity: 0;
      -webkit-transform: translateX(50px);
    }
  }

  @-webkit-keyframes fadeInLeft {
    0% {
      opacity: 0;
      -webkit-transform: translateX(-1000px);
    }
    100% {
      opacity: 1;
      -webkit-transform: translateX(0);
    }
  }

  @-webkit-keyframes forotate {
    from {
      -webkit-transform: rotate(-360deg);
      opacity: 0.9;
    }
    to {
      -webkit-transform: rotate(0);
      opacity: 1;
    }
  }

  @-webkit-keyframes bounceInLeft1{
    0%{-webkit-transform:translateX(-115px)}
    100%{-webkit-transform:translateX(0)}
  }

  @-webkit-keyframes flash2 {
    0%,
    50%,
    100% {
      opacity: 0.2;
    }
    25%,
    75% {
      opacity: 0;
    }
  }

  @-webkit-keyframes whitePulse {
    from {
      box-shadow: 0 0 26px #fff, 0 0 4px #fff, 0 0 2px #fff, 0 0 0px #fff;
    }
    to {
      box-shadow: 0 0 0 #fff, 0 0 2px #fff, 0 0 4px #fff, 0 0 26px #fff;
    }
  }
}

</style>

