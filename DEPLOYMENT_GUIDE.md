# 🚀 Deployment Guide - Robotics Club Manager

## Quick Deploy to Vercel + Supabase

### Step 1: Set Up Supabase Database (5 minutes)

1. **Create Supabase Account**
   - Go to: https://supabase.com
   - Sign up with GitHub (recommended)

2. **Create New Project**
   - Click "New Project"
   - Name: `robotics-club-manager`
   - Database Password: **Save this securely!**
   - Region: Choose closest to your users
   - Click "Create new project"
   - Wait 2-3 minutes for provisioning

3. **Get Connection String**
   - In your project dashboard, go to **Settings** → **Database**
   - Scroll to **Connection string** section
   - Select **URI** tab
   - Copy the connection string (looks like):
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
     ```
   - Replace `[YOUR-PASSWORD]` with your actual database password

### Step 2: Update Environment Variables

1. **Create Production ENV file**
   ```bash
   cp .env .env.production
   ```

2. **Edit `.env.production`** with your Supabase details:
   ```env
   # Supabase Database
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
   DIRECT_URL="postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"

   # NextAuth v5
   AUTH_URL="https://your-app-name.vercel.app"
   AUTH_SECRET="your-generated-secret"

   # App URL
   NEXT_PUBLIC_APP_URL="https://your-app-name.vercel.app"
   ```

3. **Generate AUTH_SECRET**
   ```bash
   openssl rand -base64 32
   ```
   Copy the output to `AUTH_SECRET`

### Step 3: Push Database Schema to Supabase

1. **Update Prisma schema for production**
   - Already configured to use `DIRECT_URL` for migrations

2. **Push schema to Supabase**
   ```bash
   DATABASE_URL="your-supabase-url" npx prisma db push
   ```

3. **Seed production database**
   ```bash
   DATABASE_URL="your-supabase-url" npm run db:seed
   ```

### Step 4: Deploy to Vercel

1. **Login to Vercel**
   ```bash
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **During setup:**
   - Link to existing project? **No**
   - Project name? `robotics-club-manager`
   - Directory? `./` (press Enter)
   - Want to modify settings? **No**

4. **Set environment variables in Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Select your project
   - Settings → Environment Variables
   - Add all variables from `.env.production`

5. **Redeploy**
   ```bash
   vercel --prod
   ```

### Step 5: Verify Deployment

1. **Check your deployment URL** (shown after `vercel --prod`)
2. **Test the app:**
   - Login: coach@robotics.com / password123
   - Navigate through all pages
   - Check database connections

---

## Alternative: One-Command Deploy Script

Run this script for automated deployment:

```bash
./scripts/deploy.sh
```

The script will:
- ✅ Check for required environment variables
- ✅ Push schema to production database
- ✅ Run seeds
- ✅ Deploy to Vercel
- ✅ Run post-deployment health checks

---

## Troubleshooting

### Database Connection Issues

If you see database errors:

1. **Check connection pooling**
   - Supabase uses PgBouncer
   - Use `?pgbouncer=true&connection_limit=1` in DATABASE_URL
   - Use DIRECT_URL for migrations

2. **Verify password**
   - Ensure no special characters are URL-encoded
   - Use quotes around connection string

3. **Check region**
   - Vercel deployment region should match Supabase region

### Slow Performance

1. **Enable connection pooling** (already configured)
2. **Use Vercel Edge Functions** for faster responses
3. **Add database indexes** (run `npm run db:optimize`)

### Build Failures

1. **Clear Vercel cache**
   ```bash
   vercel --force
   ```

2. **Check build logs**
   - Vercel Dashboard → Deployments → Latest → Logs

3. **Verify all env variables are set**

---

## Post-Deployment Checklist

- [ ] Database schema pushed successfully
- [ ] Seed data created (15 students, etc.)
- [ ] App loads without errors
- [ ] Login works (coach@robotics.com)
- [ ] All 9 feature areas accessible
- [ ] Performance monitoring active
- [ ] Student Stats page working
- [ ] Environment variables secured

---

## Cost Breakdown

### Free Tier Usage (Estimated)

**Supabase:**
- Database: 500MB (Free)
- Bandwidth: 2GB (Free)
- **Cost: $0/month** ✅

**Vercel:**
- Hosting: 100GB bandwidth (Free)
- Serverless functions: 100 hours (Free)
- **Cost: $0/month** ✅

**Total: $0/month for small teams (<50 students)**

### If You Exceed Free Tier:

**Supabase Pro:** $25/month (8GB database, 50GB bandwidth)
**Vercel Pro:** $20/month (unlimited bandwidth, 1000 hours functions)

---

## Need Help?

- Supabase Issues: https://supabase.com/docs
- Vercel Issues: https://vercel.com/docs
- Next.js Issues: https://nextjs.org/docs

**Common Error Fixes:**
- "Prisma timeout" → Check DATABASE_URL format
- "Auth error" → Verify AUTH_SECRET is set
- "Build failed" → Check all dependencies in package.json
