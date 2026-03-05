#!/bin/bash

# Deployment script for Robotics Club Manager
# Deploys to Vercel with Supabase database

set -e  # Exit on error

echo "🚀 Starting deployment process..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required env vars are set
echo "📋 Checking environment variables..."

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ ERROR: DATABASE_URL not set${NC}"
    echo "Please set your Supabase connection string:"
    echo "export DATABASE_URL='postgresql://postgres:password@db.xxx.supabase.co:5432/postgres'"
    exit 1
fi

if [ -z "$AUTH_SECRET" ]; then
    echo -e "${YELLOW}⚠️  WARNING: AUTH_SECRET not set${NC}"
    echo "Generating new AUTH_SECRET..."
    export AUTH_SECRET=$(openssl rand -base64 32)
    echo -e "${GREEN}✅ Generated: $AUTH_SECRET${NC}"
    echo "Add this to your Vercel environment variables!"
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi

# Push database schema
echo ""
echo "📊 Pushing database schema to production..."
npx prisma db push --accept-data-loss || {
    echo -e "${RED}❌ Failed to push database schema${NC}"
    exit 1
}

echo -e "${GREEN}✅ Schema pushed successfully${NC}"

# Run migrations if needed
echo ""
echo "🔄 Running database migrations..."
npx prisma migrate deploy || echo -e "${YELLOW}⚠️  No migrations to deploy${NC}"

# Seed database
echo ""
echo "🌱 Seeding production database..."
read -p "Do you want to seed the database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run db:seed || echo -e "${YELLOW}⚠️  Seeding skipped or failed${NC}"
fi

# Build locally to check for errors
echo ""
echo "🏗️  Building project locally..."
npm run build || {
    echo -e "${RED}❌ Build failed. Fix errors before deploying.${NC}"
    exit 1
}

echo -e "${GREEN}✅ Local build successful${NC}"

# Deploy to Vercel
echo ""
echo "🚢 Deploying to Vercel..."
vercel --prod || {
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
}

echo ""
echo -e "${GREEN}🎉 Deployment successful!${NC}"
echo ""
echo "Next steps:"
echo "1. Go to Vercel Dashboard: https://vercel.com/dashboard"
echo "2. Add these environment variables:"
echo "   - DATABASE_URL"
echo "   - DIRECT_URL (for Supabase)"
echo "   - AUTH_SECRET"
echo "   - AUTH_URL (your Vercel URL)"
echo "   - NEXT_PUBLIC_APP_URL (your Vercel URL)"
echo "3. Redeploy: vercel --prod"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to update AUTH_URL with your actual Vercel URL!${NC}"
