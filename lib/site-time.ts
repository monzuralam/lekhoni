// ACF date_time_picker values come back as the site's wall-clock time tagged
// +00:00. Re-attach the real site timezone ("+06:00" or "Asia/Dhaka").
// Used by the flash sale countdown and the announcement bar schedule.
export function toSiteTime (value: string, timezone: string) {
  const wallClock = value.slice(0, 19)
  if (/^[+-]\d{2}:\d{2}$/.test(timezone)) return `${wallClock}${timezone}`
  try {
    const guess = Date.parse(`${wallClock}Z`)
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hourCycle: 'h23',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric'
      })
        .formatToParts(guess)
        .map(part => [part.type, Number(part.value)])
    )
    const asZone = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second)
    return new Date(guess - (asZone - guess)).toISOString()
  } catch {
    return `${wallClock}Z`
  }
}
