# 🚀 Deployment Instructions - Copy/Paste Ready

## Step 1: Import to Netlify (2 minutes)

1. Open: https://app.netlify.com/start
2. Click: **"Import from Git"**
3. Choose: **GitHub**
4. Select: **`MalharSoni/robotics-club-manager`**
5. Click: **"Deploy"** (it will fail - that's expected without env vars)

---

## Step 2: Get Free PostgreSQL Database (3 minutes)

### Option A: Supabase (Recommended)
1. Go to: https://supabase.com/dashboard/projects
2. Click: **"New Project"**
3. Name: `ctrc-dashboard`
4. Password: (choose a strong password)
5. Region: **US East**
6. Click: **"Create new project"** (wait 2 minutes)
7. Go to: **Settings → Database**
8. Copy the **Connection String** (URI format, not Pooler)
9. Replace `[YOUR-PASSWORD]` with your actual password

### Option B: Neon (Alternative)
1. Go to: https://console.neon.tech/
2. Click: **"Create Project"**
3. Copy the connection string

---

## Step 3: Add Environment Variables to Netlify (2 minutes)

1. In Netlify, go to: **Site Settings → Environment Variables**
2. Click: **"Add a variable"**
3. Add these 3 required variables:

### Variable 1: DATABASE_URL
```
Key: DATABASE_URL
Value: [PASTE YOUR POSTGRESQL CONNECTION STRING FROM STEP 2]
```

### Variable 2: NEXTAUTH_SECRET
```
Key: NEXTAUTH_SECRET
Value: GENERATED_SECRET_BELOW
```

### Variable 3: NEXTAUTH_URL
```
Key: NEXTAUTH_URL
Value: https://YOUR-SITE-NAME.netlify.app
```
(Replace YOUR-SITE-NAME with your actual Netlify URL)

---

## Step 4: Optional - R2 File Uploads (Skip for now)

Only add these if you want file upload functionality:

```
CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name
```

---

## Step 5: Redeploy (1 minute)

1. Go to: **Deploys** tab
2. Click: **"Trigger deploy"** → **"Deploy site"**
3. Wait 2-3 minutes
4. Click the live URL!

---

## Step 6: Run Database Migrations (1 minute)

After first deploy, you need to set up the database schema:

```bash
cd ~/robotics-club-manager
npx prisma db push
npx prisma db seed
```

This creates all tables and adds sample data.

---

## 🎉 Done!

Your app will be live at: `https://your-site-name.netlify.app`

**Default Login:**
- Email: `coach@example.com`
- Password: `password123`

(Change this after first login!)

---

## Troubleshooting

**Deploy fails?**
- Check all 3 env vars are set correctly
- Make sure DATABASE_URL has the real password (not [YOUR-PASSWORD])
- Trigger redeploy after adding env vars

**Can't log in?**
- Run the Prisma commands in Step 6
- Make sure NEXTAUTH_URL matches your actual Netlify URL

**Need help?**
Just ask!
