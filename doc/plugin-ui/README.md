# ZenVis Plugin UI Kit v1

ZenVis Plugin UI Kit 是宿主提供的亮色插件界面契约。插件负责业务结构和数据，宿主统一负责颜色、间距、卡片、表格、交互反馈、响应式和图表可读性。

## 公共资源

AMIS 宿主页面已经自动加载以下资源，普通低代码插件不需要重复引用：

~~~html
<link rel="stylesheet" href="/amis/plugin-ui/v1/zenvis-plugin-ui.css" />
<script src="/amis/plugin-ui/v1/zenvis-plugin-ui.js"></script>
<script src="/amis/plugin-ui/v1/zenvis-plugin-chart.js"></script>
~~~

独立 HTML 插件应按上述顺序主动引用。UI Kit v1 仅提供亮色模式。

## 插件类型

### AMIS JSON

- 优先使用 page、service、grid、panel、card、crud、form 和 chart。
- 使用 zv-page、zv-metric-card、zv-chart-card、zv-table-shell 等语义类。
- 不要使用背景色工具类表达业务含义。
- 不要在 tpl 中写固定文字颜色、背景色、阴影或圆角。

参考 templates/amis-dashboard.json。

### 独立 HTML

- 引入 UI Kit CSS 和运行时脚本。
- 使用 window.ZenVisPluginUI.getToken() 读取设计变量。
- 使用 window.ZenVisPluginUI.observeResize() 监听容器尺寸。
- 不要使用 transform: scale() 缩放整个页面。

参考 templates/html-page.html。

### 独立 Vue 页面

只有复杂交互确实无法由 AMIS 表达时才单独构建 Vue 页面。页面应使用 Naive UI 亮色主题，并继续引用 UI Kit Token；不要在每个插件复制一套 themeOverrides。

## 稳定 Token

v1 保证以下 Token 可用：

- 品牌：--zv-primary、--zv-primary-hover、--zv-primary-soft
- 状态：--zv-info、--zv-success、--zv-warning、--zv-danger
- 背景：--zv-bg-canvas、--zv-bg-surface、--zv-bg-elevated、--zv-bg-muted
- 文字：--zv-text-primary、--zv-text-secondary、--zv-text-muted
- 结构：--zv-border、--zv-divider、--zv-radius-sm、--zv-radius、--zv-radius-lg
- 阴影：--zv-shadow-sm、--zv-shadow-md、--zv-shadow-lg
- 动效：--zv-motion

## 布局要求

- Grid 列必须同时考虑 md、sm 和 xs。
- Flex/Grid 子项必须允许 min-width: 0。
- 页面不能出现整体横向滚动；宽表只在表格容器内滚动。
- 长标题使用省略、换行或 tooltip，不能依靠固定宽度。
- 图表必须在容器尺寸变化后 resize。
- 页面必须覆盖加载中、空数据、错误和无权限状态。
- 动画应尊重 prefers-reduced-motion。

## 提交前检查

1. 运行 yarn test 和 yarn build:pro。
2. 在 1680、1280 和 1024 宽度检查布局。
3. 检查长中文、长英文、空数据和大数值。
4. 确认页面没有固定文字颜色和背景色。
5. 确认 iframe 加载、表格滚动和图表 resize 正常。

v1 的破坏性变更必须发布到新的版本目录，不允许直接改变既有插件的语义。
