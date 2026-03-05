# 🚀 Deploy in 3 Simple Steps

## Step 1: Run Vercel Deploy

```bash
vercel
```

When prompted, answer:
- **Set up and deploy?** → `Y`
- **Which scope?** → Select `malhar-sonis-projects` (press Enter)
- **Link to existing project?** → `N`
- **What's your project's name?** → `robotics-club-manager` (or press Enter)
- **In which directory is your code located?** → `./` (press Enter)
- **Want to override settings?** → `N` (press Enter)

✅ This deploys a preview. Your URL will be shown!

## Step 2: Add Environment Variables

Go to: https://vercel.com/dashboard

Click on `robotics-club-manager` → Settings → Environment Variables

Add these 5 variables (select **Production**, **Preview**, and **Development** for each):

```
DATABASE_URL
postgresql://postgres:RoboticsClub2026!@db.qrducdpazrxttkcqpufm.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1

DIRECT_URL
postgresql://postgres:RoboticsClub2026!@db.qrducdpazrxttkcqpufm.supabase.co:5432/postgres

AUTH_SECRET
kN8zR2xL9pQ5vW7tY4bC6mF3sG1hD0jK

AUTH_URL
https://robotics-club-manager.vercel.app

NEXT_PUBLIC_APP_URL
https://robotics-club-manager.vercel.app
```

## Step 3: Deploy to Production

```bash
vercel --prod
```

✅ Done! Your app is live at: **https://robotics-club-manager.vercel.app**

---

## 🎨 What You'll See

- **Supabase-style UI** - Clean Jungle Green (#34B27B) theme
- **Dark mode** - Professional developer-focused design
- **Student Stats Page** - Quick attendance & performance tracking
- **Dashboard** - Beautiful cards with your team data

## Login

- Email: `coach@robotics.com`
- Password: `password123`

---

## Troubleshooting

**If the app shows database errors:**

The Supabase database needs the schema. Run this from Vercel dashboard:

1. Go to your deployment → "..." menu → "Redeploy"
2. Check "Use existing Build Cache"
3. Click "Redeploy"

Or wait a few minutes for the database to fully activate.

**Need help?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions.
