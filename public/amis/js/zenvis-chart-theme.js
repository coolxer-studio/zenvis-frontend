(function () {
  'use strict';

  var updateTimer = 0;
  var chartModule = null;

  function currentPalette() {
    var dark = document.documentElement.dataset.theme === 'dark';
    return {
      dark: dark,
      heading: dark ? '#edf3fc' : '#172033',
      text: dark ? '#b6c2d4' : '#64748b',
      line: dark ? '#35435a' : '#dbe2ea',
      split: dark ? 'rgba(126, 140, 164, .18)' : '#edf1f6',
      surface: 'transparent',
      pieBorder: dark ? '#111827' : '#ffffff',
    };
  }

  function axisTheme(palette, includeSplitLine) {
    var option = {
      axisLine: { lineStyle: { color: palette.line } },
      axisTick: { lineStyle: { color: palette.line } },
      axisLabel: { color: palette.text },
      nameTextStyle: { color: palette.text },
    };
    if (includeSplitLine) {
      option.splitLine = { lineStyle: { color: palette.split, type: 'dashed' } };
    }
    return option;
  }

  function patchChart(host, palette) {
    var chart = chartModule && chartModule.getInstanceByDom(host);
    if (!chart) return;

    var current = chart.getOption() || {};
    var patch = {
      backgroundColor: palette.surface,
      darkMode: palette.dark,
      textStyle: { color: palette.text },
    };

    if (current.legend) {
      patch.legend = current.legend.map(function () {
        return {
          textStyle: { color: palette.text },
          pageTextStyle: { color: palette.text },
        };
      });
    }
    if (current.title) {
      patch.title = current.title.map(function () {
        return {
          textStyle: { color: palette.heading, fontWeight: 600 },
          subtextStyle: { color: palette.text },
        };
      });
    }
    if (current.xAxis) {
      patch.xAxis = current.xAxis.map(function () {
        return axisTheme(palette, true);
      });
    }
    if (current.yAxis) {
      patch.yAxis = current.yAxis.map(function () {
        return axisTheme(palette, true);
      });
    }
    if (current.radar) {
      patch.radar = current.radar.map(function () {
        return {
          axisName: { color: palette.text },
          splitLine: { lineStyle: { color: palette.split } },
          splitArea: { areaStyle: { color: ['transparent'] } },
          axisLine: { lineStyle: { color: palette.line } },
        };
      });
    }
    if (current.series) {
      patch.series = current.series.map(function (series) {
        return series.type === 'pie'
          ? {
              itemStyle: { borderColor: palette.pieBorder },
              label: { color: palette.text },
              labelLine: { lineStyle: { color: palette.line } },
            }
          : { label: { color: palette.text } };
      });
    }

    chart.setOption(patch, false, true);
    chart.resize();
  }

  function updateCharts() {
    updateTimer = 0;
    try {
      chartModule = chartModule || window.amisRequire('echarts');
    } catch (_) {
      return;
    }

    var palette = currentPalette();
    document.querySelectorAll('[_echarts_instance_]').forEach(function (host) {
      patchChart(host, palette);
    });
  }

  function scheduleUpdate() {
    window.clearTimeout(updateTimer);
    updateTimer = window.setTimeout(updateCharts, 80);
  }

  function start() {
    scheduleUpdate();
    var root = document.getElementById('root') || document.body;
    new MutationObserver(scheduleUpdate).observe(root, { childList: true, subtree: true });
  }

  window.addEventListener('message', function (event) {
    if (event.origin !== window.location.origin || event.data?.type !== 'zenvis:theme') return;
    scheduleUpdate();
    window.setTimeout(updateCharts, 260);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
