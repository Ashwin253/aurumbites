This is a [Next.js](https://nextjs.org) project for the Aurum Bites website.

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Shopify Shop Page

A new `/shop` route is wired to Shopify's Storefront API and is compatible with a Hydrogen-backed storefront setup.

It now includes:

- Collection filtering on `/shop?collection=...`
- Product detail pages at `/shop/[handle]`
- Cart actions with Shopify checkout handoff when credentials are configured
- A preview cart fallback when Shopify credentials are not configured yet

Add these environment variables in `.env.local` to load live products:

```bash
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-token
# Optional, defaults to 2026-01
SHOPIFY_STOREFRONT_API_VERSION=2026-01
```

The page shows fallback catalog cards until those values are configured.
