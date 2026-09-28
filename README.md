# Music Money v1.67

Clean, professional mobile-first Apple-style music subscription tracker.

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
