import type { GlobalThemeOverrides } from 'naive-ui';

const fontFamily =
  'Inter, "Alibaba PuHuiTi", "PingFang SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const zenvisLightTheme: GlobalThemeOverrides = {
  common: {
    primaryColor: '#4f6ef7',
    primaryColorHover: '#6682ff',
    primaryColorPressed: '#3f5bd8',
    primaryColorSuppl: '#6682ff',
    infoColor: '#2f80ed',
    successColor: '#12b981',
    warningColor: '#f59e0b',
    errorColor: '#ef476f',
    bodyColor: '#f4f7fb',
    cardColor: '#ffffff',
    modalColor: '#ffffff',
    popoverColor: '#ffffff',
    tableColor: '#ffffff',
    inputColor: '#ffffff',
    actionColor: '#f7f9fc',
    textColorBase: '#172033',
    borderColor: '#e2e8f2',
    dividerColor: '#e8edf5',
    borderRadius: '12px',
    borderRadiusSmall: '9px',
    fontFamily,
    fontSize: '14px',
    boxShadow1: '0 1px 2px rgba(15, 23, 42, 0.04)',
    boxShadow2: '0 12px 32px rgba(15, 23, 42, 0.10)',
    boxShadow3: '0 24px 64px rgba(15, 23, 42, 0.14)',
  },
  Button: {
    borderRadiusTiny: '7px',
    borderRadiusSmall: '8px',
    borderRadiusMedium: '10px',
    borderRadiusLarge: '12px',
    fontWeight: '600',
  },
  Card: {
    borderRadius: '16px',
  },
  Dialog: {
    borderRadius: '18px',
  },
  Drawer: {
    borderRadius: '18px 0 0 18px',
  },
  Input: {
    borderRadius: '10px',
  },
  DataTable: {
    borderRadius: '14px',
    thColor: '#f7f9fc',
    thColorHover: '#f1f5fb',
    tdColorHover: '#f7f9ff',
    borderColor: '#e8edf5',
    thFontWeight: '650',
  },
};

export const zenvisDarkTheme: GlobalThemeOverrides = {
  common: {
    primaryColor: '#8096ff',
    primaryColorHover: '#9aaaff',
    primaryColorPressed: '#667ce8',
    primaryColorSuppl: '#9aaaff',
    infoColor: '#54a5ff',
    successColor: '#32d69b',
    warningColor: '#ffbd5a',
    errorColor: '#ff718d',
    bodyColor: '#0b1120',
    cardColor: '#111a2e',
    modalColor: '#111a2e',
    popoverColor: '#141f35',
    tableColor: '#111a2e',
    inputColor: '#0f182a',
    actionColor: '#17233a',
    textColorBase: '#edf4ff',
    borderColor: '#263551',
    dividerColor: '#22304a',
    borderRadius: '12px',
    borderRadiusSmall: '9px',
    fontFamily,
    fontSize: '14px',
    boxShadow1: '0 1px 2px rgba(0, 0, 0, 0.22)',
    boxShadow2: '0 16px 36px rgba(0, 0, 0, 0.30)',
    boxShadow3: '0 30px 70px rgba(0, 0, 0, 0.38)',
  },
  Button: {
    borderRadiusTiny: '7px',
    borderRadiusSmall: '8px',
    borderRadiusMedium: '10px',
    borderRadiusLarge: '12px',
    fontWeight: '600',
  },
  Card: {
    borderRadius: '16px',
  },
  Dialog: {
    borderRadius: '18px',
  },
  Drawer: {
    borderRadius: '18px 0 0 18px',
  },
  Input: {
    borderRadius: '10px',
  },
  DataTable: {
    borderRadius: '14px',
    thColor: '#16223a',
    thColorHover: '#1a2944',
    tdColorHover: '#17243d',
    borderColor: '#22304a',
    thFontWeight: '650',
  },
};
