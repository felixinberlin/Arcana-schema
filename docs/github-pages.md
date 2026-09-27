# Publishing to GitHub Pages

This guide explains how to deploy the **Arcana Schema** interactive web application, documentation, and public schema endpoints to **GitHub Pages**.

---

## 🚀 Quick Setup (Automated GitHub Actions)

The repository includes an automated workflow at [`.github/workflows/deploy-pages.yml`](../.github/workflows/deploy-pages.yml) that:
1. Installs dependencies and runs all 104 validation tests (`npm test`).
2. Builds the React/Vite web application (`npm run build`).
3. Copies `schemas/`, `catalog/`, `contexts/`, and `SPECIFICATION.md` into `dist/`.
4. Creates a `.nojekyll` file to ensure directories with underscores (such as `schemas/v2/_shared/`) are served without interference from Jekyll.
5. Deploys the artifact directly to GitHub Pages using the official GitHub Pages deployment action.

---

## ⚙️ Step-by-Step GitHub Configuration

### Step 1: Push Repository to GitHub
Ensure your repository is pushed to GitHub:
```bash
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git branch -M main
git push -u origin main
```

### Step 2: Enable GitHub Pages in Repository Settings
1. Open your repository on GitHub.
2. Go to **Settings** (tab at the top).
3. In the left sidebar, click on **Pages** (under the "Code and automation" section).
4. Under **Build and deployment** > **Source**, change the dropdown from **"Deploy from a branch"** to **"GitHub Actions"**.
   > 💡 **Important:** Choosing **GitHub Actions** allows the included `.github/workflows/deploy-pages.yml` workflow to automatically manage builds and deployments.

### Step 3: Trigger the First Deployment
- The workflow triggers automatically on any push to the `main` branch.
- Alternatively, trigger it manually:
  1. Go to the **Actions** tab in your GitHub repository.
  2. In the left sidebar, click **Deploy to GitHub Pages**.
  3. Click the **Run workflow** button on the right.

### Step 4: Access Your Live Site
Once the workflow run completes (usually within 1–2 minutes), your site will be live at:
```text
https://<your-username>.github.io/<your-repo-name>/
```

---

## 🌐 Public Schema & Catalog Endpoints

Because the deployment workflow includes the schema directories, your GitHub Pages site acts as a live, CORS-friendly schema registry:

| Asset | Public URL on GitHub Pages |
| :--- | :--- |
| **Interactive App & Docs** | `https://<user>.github.io/<repo>/` |
| **Spread Schema (v2.0.0)** | `https://<user>.github.io/<repo>/schemas/v2/tarot-spread-definition-2.0.0.schema.json` |
| **Reading Schema (v1.0.0)** | `https://<user>.github.io/<repo>/schemas/v2/tarot-reading-1.0.0.schema.json` |
| **Catalog Schema (v2.0.0)** | `https://<user>.github.io/<repo>/schemas/v2/tarot-spread-catalog-2.0.0.schema.json` |
| **Shared Layout Definitions** | `https://<user>.github.io/<repo>/schemas/v2/_shared/layout.defs.json` |
| **JSON-LD Semantic Context** | `https://<user>.github.io/<repo>/contexts/tarot.jsonld` |
| **Canonical Spread Catalog** | `https://<user>.github.io/<repo>/catalog/index.json` |
| **Specification Document** | `https://<user>.github.io/<repo>/SPECIFICATION.md` |

---

## 🔧 Key Configuration Details

### 1. Relative Asset Paths (`base: './'`)
In `vite.config.ts`, `base: './'` is configured so that built assets (`./assets/index-*.js`, `./assets/index-*.css`) work out of the box whether your site is served from a repository subfolder (`https://username.github.io/repo/`) or a custom root domain (`https://arcanaschema.org`).

### 2. Disabling Jekyll (`.nojekyll`)
GitHub Pages runs Jekyll by default, which ignores folders starting with an underscore (such as `_shared/`). The workflow includes `touch dist/.nojekyll`, which bypasses Jekyll processing and ensures all modular sub-schemas (`schemas/v2/_shared/*.defs.json`) are accessible.

### 3. Custom Domain (Optional)
If you own a custom domain (e.g., `schema.yourdomain.org`):
1. In repository **Settings** > **Pages**, enter your domain under **Custom domain** and save.
2. Add a `CNAME` record in your DNS provider pointing to `<your-username>.github.io`.
3. Check the **Enforce HTTPS** box once DNS propagates.
