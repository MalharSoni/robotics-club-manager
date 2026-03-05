#!/bin/bash
set -e

# Set Vercel org/team
export VERCEL_ORG_ID="team_XfY2vsfJTYQAMlD7KtzjnAwd"

# Deploy to Vercel (creates new project)
echo "🚀 Deploying to Vercel..."
vercel deploy --prod --yes --name robotics-club-manager 2>&1 || true

