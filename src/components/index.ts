import { App } from 'vue';
import layout_blank from './layout/layout-blank.vue';
import layout_full from './layout/layout-full.vue';
import layout_header from './layout/layout-header.vue';
import BaseChart from './echarts/base-chart.vue';

const components = [
  layout_blank,
  layout_full,
  layout_header,
  BaseChart,
];

export default function (app: App) {
  components.forEach(item => {
    if (item.name) {
      app.component(item.name, item);
    }
  });
}
