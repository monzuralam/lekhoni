import type { Announcement } from '@/lib/theme-settings'

// Announcement bar dismissal and schedule (port of initDismissible() in
// design/assets/js/main.js). Shared by the root layout (pre-paint script),
// the bar and its close button (client).
//
// The id changes with the bar's text and link (lib/theme-settings.ts), so a
// new message shows again for visitors who closed the old one.

export const announcementStorageKey = (id: string) => `lk-dismissed-${id}`

// Set on <html> when the bar should stay hidden; the bar hides itself with CSS
export const ANNOUNCEMENT_ATTR = 'data-announcement-dismissed'

// Runs in <head> before the first paint, so the bar never flashes when it was
// closed before or is outside its "Show from / until" window. The schedule is
// checked in the browser because pages are prerendered and cached.
export function announcementScript (announcement: Announcement | null) {
  if (!announcement) return ''
  const config = JSON.stringify({
    key: announcement.dismissible ? announcementStorageKey(announcement.id) : null,
    start: announcement.startsAt,
    end: announcement.endsAt,
    attr: ANNOUNCEMENT_ATTR
  }).replace(/</g, '\\u003c')
  return `(function (c) {
  var hide = false, now = Date.now();
  if (c.start && now < Date.parse(c.start)) hide = true;
  if (c.end && now > Date.parse(c.end)) hide = true;
  try {
    if (c.key && localStorage.getItem(c.key) === 'true') hide = true;
  } catch (e) {}
  if (hide) document.documentElement.setAttribute(c.attr, '');
})(${config});`
}
