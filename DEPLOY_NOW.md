# 🚀 Quick Vercel Deployment Guide

## Step 1: Deploy to Vercel (2 minutes)

Run this command and follow the prompts:

```bash
vercel
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your team (malhar-sonis-projects)
- **Link to existing project?** → No
- **Project name?** → `robotics-club-manager` (or press Enter)
- **Directory?** → `.` (press Enter)
- **Override settings?** → No (press Enter)

This will deploy a preview. Then deploy to production:

```bash
vercel --prod
```

## Step 2: Add Environment Variables in Vercel Dashboard

1. Go to: https://vercel.com/malhar-sonis-projects/robotics-club-manager/settings/environment-variables

2. Add these variables (copy from `.env.production.local`):

```
DATABASE_URL=postgresql://postgres:RoboticsClub2026!@db.qrducdpazrxttkcqpufm.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1

DIRECT_URL=postgresql://postgres:RoboticsClub2026!@db.qrducdpazrxttkcqpufm.supabase.co:5432/postgres

AUTH_SECRET=kN8zR2xL9pQ5vW7tY4bC6mF3sG1hD0jK

AUTH_URL=https://robotics-club-manager.vercel.app

NEXT_PUBLIC_APP_URL=https://robotics-club-manager.vercel.app
```

**IMPORTANT:** Make sure to select "Production", "Preview", and "Development" for each variable!

## Step 3: Redeploy

After adding environment variables, redeploy:

```bash
vercel --prod
```

## Step 4: Push Database Schema

Once deployed, the Vercel environment can connect to Supabase. Run:

```bash
# In Vercel dashboard, go to your deployment
# Click "..." menu → "Redeploy" → Check "Use existing Build Cache"
```

Or push schema locally (if connection works):

```bash
DATABASE_URL="postgresql://postgres:RoboticsClub2026!@db.qrducdpazrxttkcqpufm.supabase.co:5432/postgres" npx prisma db push
```

## ✅ Done!

Your app will be live at: **https://robotics-club-manager.vercel.app**

### Login Credentials:
- Email: `coach@robotics.com`
- Password: `password123`

---

## 🎨 What's New

Your app now has the **Supabase UI design**:
- Clean, professional dark mode
- Jungle Green (#34B27B) accents
- No flashy animations - pure functionality
- Matches Supabase's developer-focused aesthetic

Enjoy your new robotics club management system!
