#!/bin/bash

# Robotics Club Manager - One-Command Vercel Deployment
# Run this script: ./deploy.sh

set -e

echo "🚀 Deploying Robotics Club Manager to Vercel..."
echo ""

# Initialize git if needed
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Robotics Club Manager with Supabase UI

    Features:
    - Supabase UI design (Jungle Green theme)
    - Student Stats quick-entry page
    - Dashboard with clean card design
    - Connected to Supabase PostgreSQL database
    - Next.js 16 with App Router
    - Prisma ORM
    - NextAuth v5

    🤖 Generated with Claude Code"
fi

# Deploy to Vercel
echo ""
echo "🌐 Deploying to Vercel..."
echo "Please follow the prompts:"
echo "  - Select your team: malhar-sonis-projects"
echo "  - Project name: robotics-club-manager (or press Enter)"
echo "  - Link to existing project: No"
echo ""

vercel

echo ""
echo "✅ Preview deployed! Now deploying to production..."
vercel --prod

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📝 NEXT STEPS:"
echo ""
echo "1. Go to Vercel Dashboard:"
echo "   https://vercel.com/malhar-sonis-projects/robotics-club-manager/settings/environment-variables"
echo ""
echo "2. Add these environment variables (for Production, Preview, and Development):"
echo ""
echo "   DATABASE_URL=postgresql://postgres:RoboticsClub2026!@db.qrducdpazrxttkcqpufm.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
echo ""
echo "   DIRECT_URL=postgresql://postgres:RoboticsClub2026!@db.qrducdpazrxttkcqpufm.supabase.co:5432/postgres"
echo ""
echo "   AUTH_SECRET=kN8zR2xL9pQ5vW7tY4bC6mF3sG1hD0jK"
echo ""
echo "   AUTH_URL=https://robotics-club-manager.vercel.app"
echo ""
echo "   NEXT_PUBLIC_APP_URL=https://robotics-club-manager.vercel.app"
echo ""
echo "3. Redeploy to activate environment variables:"
echo "   vercel --prod"
echo ""
echo "🎨 Your app will be live with beautiful Supabase UI!"
