# ☁ OWAY Cloud Console

Cloudflare Infrastructure Dashboard — zero dependencies, pure HTML/CSS/JS.

![License](https://img.shields.io/badge/license-MIT-blue)
![Deploy](https://img.shields.io/badge/deploy-Cloudflare%20Pages-orange)

## Features

- **Overview** — stats cards, live clock, performance charts, resource pie chart
- **Workers** — list deployed workers, view source code, identify issues
- **D1** — database details, schema status, replication info
- **KV / R2** — empty state with recommended resources to create
- **Security** — audit checklist (4 passed, 4 warnings)
- **Cost** — monthly estimation table per resource
- **Actions** — prioritized recommendations (P0 → P2)

## Tech Stack

| Layer | Tech |
|-------|------|
| Markup | HTML5 |
| Styling | Custom CSS (dark theme, no framework) |
| Logic | Vanilla JS (ES modules) |
| Charts | Canvas 2D (zero dependencies) |
| Icons | Inline SVG |
| Font | IBM Plex Sans + IBM Plex Mono |
| Hosting | Cloudflare Pages |
| CI/CD | GitHub Actions |

**Zero npm dependencies. No build step. Just push and deploy.**

## Quick Start

```bash
# Clone
git clone https://github.com/kasidit-wansudon/oway-cloud-console.git
cd oway-cloud-console

# Open locally (any HTTP server works)
npx serve .
# or
python3 -m http.server 3000
```

Visit `http://localhost:3000`

## Deploy via GitHub Actions

### 1. Create Cloudflare Pages project

Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → Pages → Create a project → Direct Upload.

Or let the GitHub Action create it automatically on first deploy.

### 2. Set GitHub Secrets

Go to your repo → Settings → Secrets and variables → Actions → New repository secret:

| Secret | Value | How to get |
|--------|-------|------------|
| `CLOUDFLARE_ACCOUNT_ID` | `697c43d79ac741e0928ec176b8286726` | Dashboard → Overview → Account ID |
| `CLOUDFLARE_API_TOKEN` | `your-api-token` | Dashboard → My Profile → API Tokens → Create Token → "Edit Cloudflare Workers" template |

### 3. Push to deploy

```bash
git add .
git commit -m "Initial deploy"
git push origin main
```

GitHub Actions will auto-deploy to: `https://oway-cloud-console.pages.dev`

### 4. Connect custom subdomain

1. Go to Cloudflare Dashboard → Pages → oway-cloud-console → Custom domains
2. Add: `console.yourdomain.com`
3. Cloudflare will auto-configure DNS

## Project Structure

```
oway-cloud-console/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions → Cloudflare Pages
├── src/
│   ├── css/
│   │   └── style.css           # All styles (dark theme)
│   └── js/
│       ├── app.js              # Main application logic
│       ├── data.js             # Real Cloudflare data
│       ├── icons.js            # Inline SVG icons
│       └── charts.js           # Canvas chart renderers
├── index.html                  # Entry point
├── .gitignore
└── README.md
```

## Updating Data

Edit `src/js/data.js` with your latest Cloudflare configuration.

All data in `data.js` was sourced from the Cloudflare MCP API on 2026-03-28:
- Account: `697c43d79ac741e0928ec176b8286726`
- Workers: `d1-template`
- D1: `catcare` (APAC)
- KV: 0 namespaces
- R2: 0 buckets

## Recommended Subdomain

| Subdomain | Use |
|-----------|-----|
| `console.yourdomain.com` | This dashboard (recommended) |
| `ops.yourdomain.com` | Alternative |
| `dash.yourdomain.com` | Alternative |

## License

MIT
