#!/bin/bash

# Robotics Club Manager - Automated Testing Script
# Uses Playwright MCP via Claude Code

set -e

echo "🧪 Robotics Club Manager - Automated E2E Tests"
echo "================================================"
echo ""

# Check if site is deployed
SITE_URL="https://robotics-club-manager.vercel.app"
LOCAL_URL="http://localhost:3000"

echo "🔍 Checking deployment status..."
if curl -s -o /dev/null -w "%{http_code}" $SITE_URL | grep -q "200\|301\|302"; then
    TEST_URL=$SITE_URL
    echo "✅ Production site is live: $SITE_URL"
else
    echo "⚠️  Production site not ready, checking local..."
    if curl -s -o /dev/null -w "%{http_code}" $LOCAL_URL | grep -q "200"; then
        TEST_URL=$LOCAL_URL
        echo "✅ Testing on local: $LOCAL_URL"
    else
        echo "❌ Neither production nor local site is available"
        echo ""
        echo "To test locally, run: npm run dev"
        echo "To test production, deploy first: vercel --prod"
        exit 1
    fi
fi

echo ""
echo "🎭 Running Playwright tests on: $TEST_URL"
echo ""

# Create test results directory
mkdir -p tests/results

# Run the test agent
echo "Launching Playwright test agent..."
echo ""

cat << EOF

TEST SUITE: Robotics Club Manager E2E Tests
============================================

Target URL: $TEST_URL
Test User: coach@robotics.com
Test Date: $(date)

Running automated tests with Playwright MCP...

EOF

# The test agent will be invoked separately via Claude Code
# This script prepares the environment and provides test context

echo "📋 Test Plan:"
echo "  1. Login & Authentication"
echo "  2. Dashboard Display"
echo "  3. Navigation Flow"
echo "  4. Student Stats Page"
echo "  5. UI/UX Verification"
echo "  6. Performance Check"
echo ""
echo "Ready to run tests!"
echo ""
echo "To execute, tell Claude: 'Run the Playwright tests on $TEST_URL'"
