# Music Money v2.0.3

## v2.0.3 changes
- **Offline:** service worker (`sw.js`) caches the whole app; works with no signal after one online open. Landing photos are cached the first time they load; gradient fallback if never loaded.
- **Mark paid** straight from the People list, no confirm, with a 2-second **Undo** toast (also on recorded payments).
- **WhatsApp numbers** per member; reminders open the right chat. Editable in the member sheet.
- **Face ID lock** (Settings): privacy lock, re-locks after 30s in background.
- **Backup:** "Last backup" date in Settings and a nudge after 14 days.
- Current month now follows today's date. Version shown in Settings.

Upgrade: open once online, then reopen. If the old Home Screen icon still fails offline, remove it and re-add it once.
Data key `music-money-v1` unchanged.
