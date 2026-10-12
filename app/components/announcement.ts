// Announcement bar dismissal (port of initDismissible() in design/assets/js/main.js).
// Shared by the root layout (pre-paint script) and the close button (client).
// Change ANNOUNCEMENT_ID when the message changes, so it shows again for
// visitors who closed the old one.

export const ANNOUNCEMENT_ID = 'announce-1'
export const ANNOUNCEMENT_STORAGE_KEY = `lk-dismissed-${ANNOUNCEMENT_ID}`
// Set on <html> once dismissed; the bar hides itself with CSS
export const ANNOUNCEMENT_ATTR = 'data-announcement-dismissed'

// Runs in <head> before the first paint, so a dismissed bar never flashes
export const ANNOUNCEMENT_SCRIPT = `(function () {
  try {
    if (localStorage.getItem('${ANNOUNCEMENT_STORAGE_KEY}') === 'true') {
      document.documentElement.setAttribute('${ANNOUNCEMENT_ATTR}', '');
    }
  } catch (e) {}
})();`
