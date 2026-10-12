// Theme constants and the pre-paint script, shared by the root layout (server)
// and ThemeToggle (client). Kept out of the client module so the layout gets
// the real string, not a client reference.

export const STORAGE_KEY = 'lk-theme'
export const THEME_COLORS = { light: '#faf8f5', dark: '#13161d' }

// Runs in <head> before the CSS: no flash of the wrong theme
export const THEME_SCRIPT = `(function () {
  try {
    var d = document.documentElement;
    var t = localStorage.getItem('${STORAGE_KEY}');
    if (t !== 'dark' && t !== 'light') t = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    d.setAttribute('data-theme', t);
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t === 'dark' ? '${THEME_COLORS.dark}' : '${THEME_COLORS.light}');
  } catch (e) {}
})();`
