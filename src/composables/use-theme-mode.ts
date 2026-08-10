import { computed, ref, watch } from 'vue';
import { darkTheme } from 'naive-ui';

const STORAGE_KEY = 'zenvis-theme-mode';
type ThemeMode = 'light' | 'dark';

const preferredMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const mode = ref<ThemeMode>(preferredMode());

watch(
  mode,
  value => {
    if (typeof document === 'undefined') return;
    document.documentElement.dataset.theme = value;
    document.documentElement.style.colorScheme = value;
    window.localStorage.setItem(STORAGE_KEY, value);
  },
  { immediate: true },
);

export const useThemeMode = () => {
  const isDark = computed(() => mode.value === 'dark');
  const naiveTheme = computed(() => (isDark.value ? darkTheme : null));

  const toggleTheme = () => {
    mode.value = isDark.value ? 'light' : 'dark';
  };

  return {
    mode,
    isDark,
    naiveTheme,
    toggleTheme,
  };
};
