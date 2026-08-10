import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const read = (path: string) => readFileSync(resolve(repositoryRoot, path), 'utf8');

test('Plugin UI Kit v1 exposes the stable light-only contract', () => {
  const css = read('public/amis/plugin-ui/v1/zenvis-plugin-ui.css');
  const runtime = read('public/amis/plugin-ui/v1/zenvis-plugin-ui.js');
  const chart = read('public/amis/plugin-ui/v1/zenvis-plugin-chart.js');

  [
    '--zv-bg-canvas',
    '--zv-bg-surface',
    '--zv-text-primary',
    '--zv-text-secondary',
    '--zv-border',
    '.zv-metric-card',
    '.zv-chart-card',
    '.zv-tone-danger',
  ].forEach(value => assert.ok(css.includes(value), 'missing UI contract value: ' + value));
  assert.match(runtime, /version: VERSION/);
  assert.match(runtime, /colorScheme: 'light'/);
  assert.match(runtime, /type !== 'zenvis:ui'/);
  assert.match(chart, /darkMode: false/);
  assert.doesNotMatch(css, /data-theme=['\"]dark/);
  assert.doesNotMatch(runtime, /zenvis:theme|darkTheme/);
});

test('AMIS entry points load the versioned UI Kit before page rendering', () => {
  ['public/amis/app.html', 'public/amis/page.html'].forEach(path => {
    const source = read(path);
    assert.match(source, /plugin-ui\/v1\/zenvis-plugin-ui\.css/);
    assert.match(source, /plugin-ui\/v1\/zenvis-plugin-ui\.js/);
    assert.match(source, /plugin-ui\/v1\/zenvis-plugin-chart\.js/);
    assert.doesNotMatch(source, /zenvis:theme|allowedThemes|data\.theme/);
  });
});

test('host application no longer exposes dark-mode behavior', () => {
  const sources = [
    'src/App.vue',
    'src/assets/styles/design-system.scss',
    'src/components/layout/components/nav-menu-modern.vue',
    'src/components/plugin-frame.vue',
    'src/stores/modules/app.ts',
    'src/theme/naive-theme.ts',
    'src/views/policy/components/rightEdit.vue',
    'public/amis/zenvis-modern.css',
  ].map(read);
  const combined = sources.join('\\n');

  assert.equal(existsSync(resolve(repositoryRoot, 'src/composables/use-theme-mode.ts')), false);
  assert.doesNotMatch(
    combined,
    /useThemeMode|zenvisDarkTheme|vs-dark|zenvis:theme|data-theme=['\"]dark|切换为深色模式/,
  );
});

test('starter templates are present and the AMIS template is valid JSON', () => {
  const amisTemplate = read('doc/plugin-ui/templates/amis-dashboard.json');
  const htmlTemplate = read('doc/plugin-ui/templates/html-page.html');

  assert.doesNotThrow(() => JSON.parse(amisTemplate));
  assert.match(amisTemplate, /zv-metric-card/);
  assert.match(htmlTemplate, /ZenVisPluginUI\.onReady/);
});
