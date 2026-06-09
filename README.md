# HomeMed Cabinet

A privacy-first, offline household medicine inventory manager with AI-friendly export capabilities. Built with React + TypeScript + Vite + Tailwind CSS.

![HomeMed Cabinet](https://u55bwvc5hp7qc.kimi.page)

## Features

- **Dashboard** — At-a-glance stats, expiring medicines, low stock alerts, emergency readiness score
- **Add Medicine** — Comprehensive form with image upload, auto-save draft
- **Medicine List** — Search, filter, sort, grid/list views, expandable details
- **Emergency Readiness** — Smart checklist for common emergency items
- **Export** — PDF, TXT, and JSON exports with built-in AI analysis prompt
- **Privacy-First** — No cloud, no account, no AI analysis — data stays on your device

## Deploy to GitHub Pages (Free)

### Option 1: One-Click Setup

1. **Create a new GitHub repository** (e.g., `homemed-cabinet`)

2. **Push this code to your repo:**

```bash
git remote add origin https://github.com/YOUR_USERNAME/homemed-cabinet.git
git branch -M main
git push -u origin main
```

3. **Enable GitHub Pages:**
   - Go to your repo on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select **GitHub Actions**

4. **Done!** The workflow in `.github/workflows/deploy.yml` will automatically build and deploy your site on every push. Your site will be live at:

```
https://YOUR_USERNAME.github.io/homemed-cabinet/
```

### Option 2: Manual Deploy (Already Built)

The `dist/` folder contains the pre-built static files. You can deploy it to any static host:

- **Netlify:** Drag and drop the `dist/` folder to [netlify.com](https://netlify.com)
- **Vercel:** Run `npx vercel dist`
- **Surge:** Run `npx surge dist`
- **Cloudflare Pages:** Upload the `dist/` folder

## Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| jsPDF | PDF export |
| date-fns | Date handling |
| Lucide React | Icons |
| shadcn/ui | UI components |

## Data Storage

All data is stored in your browser's `localStorage`:

| Key | Data |
|---|---|
| `homemed_medicines` | Your medicine inventory |
| `homemed_settings` | App preferences |
| `homemed_draft` | Unsaved form data |

No data ever leaves your device.

## License

MIT
