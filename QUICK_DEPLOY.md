# 🚀 Quick Deploy - 3 Minutes

Since CLI automation isn't working with interactive prompts, here's the fastest way:

## Option 1: One-Click GitHub Import (Recommended - 2 minutes)

1. **Click this link**: https://app.netlify.com/start/deploy?repository=https://github.com/MalharSoni/robotics-club-manager

2. **Connect to GitHub** (if prompted)

3. **Click "Save & Deploy"**

4. **Wait 2-3 minutes** for build to complete

5. **Add environment variables** (see below)

---

## Option 2: Manual Import (3 minutes)

1. Go to: https://app.netlify.com/start

2. Click: **"Import from Git"**

3. Choose: **GitHub**

4. Select: **`MalharSoni/robotics-club-manager`**

5. **Build settings** (should auto-detect from netlify.toml):
   - Build command: `npm run build`
   - Publish directory: `.next`

6. Click: **"Deploy"**

7. Wait for build (will fail without env vars - that's OK)

---

## Required Environment Variables

After site is created, go to: **Site Settings → Environment Variables**

Add these 3 variables:

### 1. DATABASE_URL
```
Key: DATABASE_URL
Value: (get from Supabase - see below)
```

### 2. NEXTAUTH_SECRET
```
Key: NEXTAUTH_SECRET
Value: 8c9f2e1a7b4d3c6a5e8f9d0c1b2a3e4f5d6c7b8a9e0f1d2c3b4a5e6f7d8c9
```

### 3. NEXTAUTH_URL
```
Key: NEXTAUTH_URL
Value: https://YOUR-SITE-NAME.netlify.app
```
(Replace YOUR-SITE-NAME with actual Netlify URL)

### 4. Optional - Cloudflare R2 (for file uploads)
```
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=
```

---

## Get Database URL (Supabase - 2 minutes)

1. Go to: https://supabase.com/dashboard/projects

2. Click: **"New Project"**

3. Settings:
   - Name: `ctrc-dashboard`
   - Password: (create strong password)
   - Region: **US East (N. Virginia)**

4. Click: **"Create new project"** (wait ~2 minutes)

5. Go to: **Settings → Database**

6. Find **"Connection string"** section

7. Copy the **URI** (NOT Transaction Pooler)

8. Replace `[YOUR-PASSWORD]` with your actual password

9. Paste into Netlify as `DATABASE_URL`

---

## After Deployment

Once site is deployed with env vars set:

1. **Run database migrations**:
```bash
cd ~/robotics-club-manager
npx prisma db push
npx prisma db seed
```

2. **Visit your site**: `https://your-site.netlify.app`

3. **Login**:
   - Email: `coach@example.com`
   - Password: `password123`

4. **Change password immediately!**

---

## Troubleshooting

**Build fails?**
- Check all 3 env vars are set
- DATABASE_URL has real password (not `[YOUR-PASSWORD]`)
- Trigger redeploy after adding env vars

**Can't login?**
- Run `npx prisma db push` and `npx prisma db seed`
- Check NEXTAUTH_URL matches your actual site URL

**Need help?**
- Check Netlify build logs for specific errors
- Verify DATABASE_URL connects (try with Prisma Studio locally)
