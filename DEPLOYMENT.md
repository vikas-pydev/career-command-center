# Career Command Center — Free Deployment Guide

This guide details how to deploy the Career Command Center completely free across multiple platforms.

---

## 1. Free Cloud Hosting on Render (Recommended)

Render offers a 100% free Web Service tier with custom domains and SSL.

### Step 1: Push to GitHub
1. Initialize and push your repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Career Command Center initial release"
   gh repo create career-command-center --public --source=. --remote=origin --push
   ```

### Step 2: Deploy on Render
1. Visit [https://dashboard.render.com/blueprints](https://dashboard.render.com/blueprints).
2. Click **New Blueprint Instance**.
3. Select your GitHub repository (`career-command-center`).
4. Render will automatically detect [`render.yaml`](file:///render.yaml) and configure:
   - **Build Command**: `npm install && npm run build:client`
   - **Start Command**: `npm run server`
   - **Environment Variables**: Pre-configured with Google Sheet ID `1NnQzoTppnqQQxO7o6Bzo6CZN-kajKLIHhvVFgi7XP6g`
5. Click **Apply**. Within 2-3 minutes your dashboard is live at `https://career-command-center.onrender.com`.

---

## 2. Free Cloud Hosting on Koyeb

Koyeb provides a free nano instance (512 MB RAM, 0.1 vCPU).
1. Go to [https://app.koyeb.com](https://app.koyeb.com).
2. Create App -> GitHub -> Select `career-command-center`.
3. Koyeb will automatically build using the included [`Dockerfile`](file:///Dockerfile).
4. Set Port: `3001` and deploy.

---

## 3. Instant Live Public HTTPS URL (Zero Setup, Free)

If you want to access your dashboard from your phone, share it with someone, or test from anywhere immediately while running locally:

```bash
# Using localtunnel
npx localtunnel --port 3001
```

Or using pinggy:
```bash
ssh -p 443 -R0:localhost:3001 a.pinggy.io
```

---

## 4. Google Sheets Auto-Sync & Webhook Trigger

The dashboard automatically syncs with your Google Sheet every 60 seconds.

If you also want **sub-second instant sync** whenever someone edits the sheet:
1. Open your [Google Sheet](https://docs.google.com/spreadsheets/d/1NnQzoTppnqQQxO7o6Bzo6CZN-kajKLIHhvVFgi7XP6g/edit).
2. Click **Extensions** > **Apps Script**.
3. Paste this simple trigger:
   ```javascript
   function onEdit(e) {
     var url = "https://your-deployed-app-url/api/integrations/webhook-sync";
     UrlFetchApp.fetch(url, {
       method: "post",
       muteHttpExceptions: true
     });
   }
   ```
4. Save the script. Any edit to any cell in the sheet will now instantly notify your dashboard!
