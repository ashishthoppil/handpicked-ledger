# Handpicked Ledger

Personal orders, expenses and reports app for **Handpicked by Mariam**. It's built for your phone (add it to your home screen) and prints courier labels from a laptop.

- **Income**: add orders and print a courier shipping label for each one.
- **Expense**: track what you spend.
- **Financial Reports**: income, expense and profit/loss for this month and this year, plus monthly averages.
- **Current capital**: set it from the sidebar.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. Locally the app uses a built-in database stored in `.data/`, so you don't need to set anything up. The passcode lock is off unless you set `APP_PASSCODE` in `.env.local`.

## Deploy on Vercel

1. Push this folder to a **private** GitHub repo, then import it at https://vercel.com/new.
2. In the Vercel project, open **Storage → Create Database → Neon (Postgres)** and connect it. This sets `DATABASE_URL` for you. The free plan is plenty.
3. In **Settings → Environment Variables**, add `APP_PASSCODE`. Pick something long, because anyone who has the URL can try to guess it.
4. Redeploy. The tables are created automatically on first use.

## Add to your phone's home screen

Open the deployed URL and unlock it with your passcode, then:

- **iPhone (Safari):** Share → *Add to Home Screen*
- **Android (Chrome):** ⋮ menu → *Add to Home screen* / *Install app*

On iPhone, the home-screen app keeps its own login, so you'll enter the passcode once more the first time you open it from the icon.

## Printing courier labels

On the laptop, open **Income** and click **Print** on an order. The browser's print dialog opens with only the label on the page.

- Use the **Label** switch above the table to pick the paper:
  - **A4 sheet**: a 100 × 150 mm label at the top of an A4 page. Cut along the border.
  - **4×6 thermal**: fills a 100 × 150 mm (4 × 6 in) thermal label.
- The laptop remembers your choice.
- In the print dialog, keep **Scale** at *Default/100%* and pick your printer. Long addresses shrink automatically to fit.

The sender details are in `components/shipping-label.tsx` (`SENDER`).
