# Music Money v1.2

A lightweight Apple-inspired family subscription payment tracker.

## Features

- Two accounts included by default
- Add, rename and manage accounts
- Add/edit members
- Individual monthly prices
- Automatically follows the current month
- Previous/next month navigation
- Record real payment amounts instead of only a paid checkbox
- Automatically handles underpayments, normal payments and overpayments
- Carries overpayment credit into future months
- Shows outstanding balance
- Shows credit held
- Member search
- Individual payment history
- Data persists in the browser using localStorage
- No build step, framework or external dependency

## Run locally

Open `index.html` in a browser.

## GitHub Pages

1. Create a new GitHub repository.
2. Upload `index.html`, `style.css`, and `app.js`.
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select your main branch and `/ (root)`.
6. Save.

GitHub will give you a public Pages URL.

## Important

This first version stores data locally in the browser. If you open the app on another phone/browser, it will have its own data.

A future version can add cloud sync/login, CSV export, receipts, reminders, payment filters and a proper reports dashboard.


## v1.1
- GH₵15/month
- 12 preloaded members across 2 accounts
- Payment markers mapped to their reference months
- Premium black/white/Volt/red/blue visual system
- Apple Music-inspired opening screen with glass effect
- Main plus button removed


## v1.2
- Member rows show last payment date and total debt only.
- Payment marker emojis are hidden from the main list.
- Cinematic Apple-family-services opening with Music, TV and iCloud orbiting the center and a dashboard preview behind.
- Account groups remain separate.


## v1.4
- Full-screen iPhone-safe planetary opening scene.
- Apple Music, Apple TV and iCloud logo images with fallbacks.
- Only the Open Music Money button is interactive while the intro is open.
- Body scrolling is locked until the intro is dismissed.
