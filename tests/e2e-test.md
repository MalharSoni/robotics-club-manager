# Robotics Club Manager - E2E Test Plan

## Test URL
Production: https://robotics-club-manager.vercel.app
Local: http://localhost:3000

## Test Credentials
- Email: coach@robotics.com
- Password: password123

## Test Scenarios

### 1. Homepage & Login
- [ ] Navigate to homepage
- [ ] Verify login page loads
- [ ] Fill in email and password
- [ ] Submit login form
- [ ] Verify redirect to /dashboard
- [ ] Check for user name in header

### 2. Dashboard
- [ ] Verify dashboard stats cards display
  - Total Students card
  - Active Tasks card
  - Team card
  - Curriculum card
- [ ] Check Supabase UI styling (green primary color)
- [ ] Verify hover effects on cards
- [ ] Check Team Roster section
- [ ] Check Active Tasks section

### 3. Navigation
- [ ] Click Students link in sidebar
- [ ] Verify navigation to /dashboard/students
- [ ] Click Stats link
- [ ] Verify navigation to /dashboard/stats
- [ ] Click Dashboard to return
- [ ] Test all 9 navigation links

### 4. Student Stats Page
- [ ] Navigate to /dashboard/stats
- [ ] Verify page title "Student Stats Quick-Entry"
- [ ] Check date picker (Saturday only)
- [ ] Verify student cards display
- [ ] Test attendance buttons (Present/Absent/Excused)
- [ ] Test performance rating stars (1-5)
- [ ] Test X-Factor notes textarea
- [ ] Check character counter (280 chars)
- [ ] Test task progress toggle

### 5. UI/UX Checks
- [ ] Verify Supabase theme colors (Jungle Green #34B27B)
- [ ] Check dark mode background
- [ ] Verify card shadows and borders
- [ ] Test responsive layout (mobile/tablet/desktop)
- [ ] Check button hover states
- [ ] Verify badge colors (success, warning, info)

### 6. Performance
- [ ] Measure page load time (should be < 2s)
- [ ] Check for console errors
- [ ] Verify no 404 errors
- [ ] Test database connection

## Expected Results

✅ All pages load without errors
✅ Login works with test credentials
✅ Dashboard displays team data
✅ Student stats page is interactive
✅ Supabase UI styling is applied
✅ Navigation works between all pages
✅ No console errors
✅ Fast load times (< 2 seconds)

## Run Tests

Once deployed, use this agent to run automated tests.
