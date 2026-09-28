# Music Money v1.76

Clean, professional mobile-first Apple-style music subscription tracker.

## v1.76 changes
- WhatsApp reminders no longer include the year (e.g. "Last payment was for August").
- Reminders for the boys start with "Gee," again; the ladies (Dorcas, Ama) keep "Hello Name, please…".

## v1.75 changes
- New app icon: original winged-blade hero emblem in a gold hexagon on near-black (no letter).

## v1.74 changes
- New app icon: original gold shield badge with a white M and a star on a navy background.

## v1.73 changes
- Names stay in caps inside the app, but WhatsApp reminders use only the first letter of each name capitalised (e.g. Dorcas, Ama’s Sister).

## v1.72 changes
- New app icon: a clean black-and-white M with a coin/note head (icons/, favicon, apple-touch-icon, manifest).
- Names are all caps. Dorcas is DORCAS and the Justice member is just JUSTICE; saved names from older versions are cleaned up on load.
- The male WhatsApp reminder no longer starts with a hardcoded "Gee,"; it uses the member's name.
- Homepage buttons now use one click handler that is set up first, and the CSS/JS links carry a version so a stale cached copy can't break them.

## v1.71 changes
- Backup: Settings → Export backup saves all data as a JSON file (share sheet on iPhone); Import backup restores it after a confirmation. The data on the device is copied to `music-money-v1-before-import` first.
- Reminders: a Mark paid button records the amount due for that reminder (including linked members) through the viewed month.

## v1.70 changes
- The landing page is now the permanent Overview: it no longer disappears. The bottom bar (Overview / People / Reminders / Payments) and the top links switch between pages, and Overview / the Music Money name returns home.
- Each page shows only its own content; the browser back button returns to the previous page.
- Reminders are all collapsed until you tap their arrow.

## v1.69 changes (fix only, no design changes)
- Fixed the crash that left the People list blank: render() wrote to two elements (heroBalance, heroPaid) that no longer exist in the landing page, throwing before People, Payments, Reminders and the photo gallery were drawn.
- Landing-page People and Payments buttons now take you to the correct section, and the top-bar People/Payments links inside the app work too.
- Saved data (localStorage key music-money-v1) is now loaded as-is; members or accounts added by the user are no longer dropped when the app starts.

## v1.67 changes
- Reworked the opening page into a light-only, Apple-inspired product presentation.
- Removed the 29 branding from the visible interface and app metadata.
- Added a frosted top navigation with Music Money, People and Payments.
- Added a hero with a single foldable iPhone Duo-style product visual and Music Money displayed on its inner screen.
- Added three full-width feature sections: “See who's paid.”, “Remind in one tap.” and “Every payment, on record.”
- Added a Reminders section that calculates unpaid months from payment history.
- Added automatic WhatsApp reminder text generation.
- Added support for members who pay for another member, combining their outstanding amounts into one message.
- Added a Send on WhatsApp action that opens WhatsApp with the message pre-filled; contact selection remains manual.
- Kept the existing member, account, payment-history and localStorage functionality.
- Reworked the app dashboard into the same light, simple visual language.
- Replaced the old 29 app icon artwork with a simple Music Money icon.

## WhatsApp reminder logic
The reminder amount is calculated from each member's monthly price and unpaid months. If a payer has another member linked through `paysFor`, the amounts are combined and the dependent is not shown as a separate reminder.

## GitHub Pages
Upload the files in this folder to the root of your GitHub repository and enable GitHub Pages from the `main` branch and `/ (root)`.
