# Neutria — AI-Powered Resale Platform

## Deploy to Vercel

### Step 1 — Upload to GitHub
1. Go to github.com → New repository → name it "neutria"
2. Upload all these files to the repo

### Step 2 — Deploy on Vercel
1. Go to vercel.com/dashboard
2. Click "Add New Project"
3. Import your GitHub repo "neutria"
4. Click Deploy

### Step 3 — Add Environment Variables
In Vercel → Settings → Environment Variables, add:

```
ANTHROPIC_API_KEY=sk-ant-api03-...your key...
STRIPE_SECRET_KEY=sk_live_...your stripe secret...
NEXT_PUBLIC_STRIPE_KEY=pk_live_...your stripe publishable...
SHOPIFY_DOMAIN=pjn0-eu.myshopify.com
SHOPIFY_TOKEN=shpat_...your token...
NEXT_PUBLIC_APP_URL=https://neutria.co.uk
```

### Step 4 — Point your domain
In Vercel → Settings → Domains → Add "neutria.co.uk"
Then update your DNS to point to Vercel.

That's it. Neutria is live.
