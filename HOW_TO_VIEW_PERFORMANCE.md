# How to View Performance Data

Quick guide to accessing and understanding performance metrics for the Robotics Club Manager.

---

## Method 1: Performance Dashboard (Recommended)

### Step 1: Start the App
```bash
npm run dev
```

### Step 2: Navigate to Dashboard
Open your browser and go to:
```
http://localhost:3000/dashboard/performance
```

### Step 3: Generate Data
To see meaningful metrics:
1. Navigate through different pages
2. Create/edit students, projects, or tasks
3. Load the analytics page (generates many metrics)
4. Return to performance dashboard

### Step 4: View Metrics

The dashboard shows:

**Overview Cards:**
- Render Performance (avg component render time)
- API Calls (avg response time)
- Database Queries (avg query time)
- Page Load (avg total load time)

**Memory Usage:**
- JavaScript heap usage
- Visual percentage bar
- Warnings if over 80%

**Tabs:**
1. Recent Metrics - Last 20 measurements
2. Performance Budgets - Target values
3. Recommendations - Actionable suggestions

### Step 5: Export Data (Optional)
Click "Export" button to download metrics as JSON for analysis.

---

## Method 2: Browser DevTools

### Chrome DevTools

1. **Open DevTools:** Press `F12` or `Cmd+Option+I` (Mac)

2. **Performance Tab:**
   - Click "Record" button
   - Navigate through the app
   - Stop recording
   - Analyze flame graph

3. **Lighthouse:**
   - Open DevTools
   - Go to "Lighthouse" tab
   - Select categories: Performance, Accessibility
   - Click "Generate report"

4. **Network Tab:**
   - View all requests
   - Check "Disable cache" for accurate testing
   - Filter by type (JS, CSS, Images)
   - Look for slow requests

5. **Memory Tab:**
   - Take heap snapshots
   - Compare snapshots to find leaks
   - Monitor memory over time

### Firefox DevTools

1. **Open DevTools:** Press `F12`
2. **Performance Tab:** Similar to Chrome
3. **Network Tab:** View request timings
4. **Memory Tab:** Profile memory usage

---

## Method 3: Console Logs (Development)

In development mode, performance metrics are automatically logged to the console:

```
✓ [render] StudentList: 12.34ms
✓ [api] /api/students: 156.78ms
✓ [query] getStudents: 45.67ms
⚠️ SLOW [api] /api/analytics: 1234.56ms
```

Look for:
- ✓ indicates within budget
- ⚠️ SLOW indicates exceeded budget

---

## Method 4: Bundle Analysis

### View Bundle Size

```bash
npm run analyze
```

This will:
1. Build the production app
2. Open interactive visualization at http://localhost:8888
3. Show all bundles with sizes

### What to Look For:
- Large dependencies (red blocks)
- Duplicate packages
- Unused code
- Opportunities for code splitting

### Reading the Visualization:
- **Size of box** = Size of module
- **Color** = Different file types
- **Hover** = See exact sizes
- **Click** = Drill down into packages

---

## Method 5: Vercel Analytics (Production)

After deploying to Vercel:

1. **Access Dashboard:**
   - Go to https://vercel.com
   - Select your project
   - Click "Analytics" tab

2. **View Web Vitals:**
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)
   - FCP (First Contentful Paint)
   - TTFB (Time to First Byte)
   - INP (Interaction to Next Paint)

3. **Filter Data:**
   - By page
   - By device type
   - By geographic region
   - By time range

4. **Real User Monitoring:**
   - Actual user experience data
   - 75th percentile scores
   - Performance over time

---

## Understanding the Metrics

### Core Web Vitals

**LCP (Largest Contentful Paint)**
- Measures loading performance
- Good: ≤ 2.5s
- Poor: > 4.0s
- What it means: Time until main content is visible

**FID (First Input Delay)**
- Measures interactivity
- Good: ≤ 100ms
- Poor: > 300ms
- What it means: Time to respond to first user interaction

**CLS (Cumulative Layout Shift)**
- Measures visual stability
- Good: ≤ 0.1
- Poor: > 0.25
- What it means: How much content moves while loading

**INP (Interaction to Next Paint)**
- Measures responsiveness
- Good: ≤ 200ms
- Poor: > 500ms
- What it means: Time for UI to respond to interactions

### Custom Metrics

**Component Render Time**
- Budget: 16ms (for 60fps)
- Measures how long components take to render
- High values indicate expensive computations

**API Response Time**
- Budget: 1000ms
- Measures server response time
- High values indicate slow backend or network

**Database Query Time**
- Budget: 500ms
- Measures database performance
- High values indicate need for indexes

**Page Load Time**
- Budget: 3000ms
- Measures total load time
- High values indicate need for optimization

---

## Interpreting Results

### Good Performance
```
✓ All metrics within budgets
✓ Memory usage < 60%
✓ No slow queries
✓ Fast render times
```

### Needs Improvement
```
⚠️ Some metrics slightly over budget
⚠️ Memory usage 60-80%
⚠️ Occasional slow queries
⚠️ Some slow renders
```

### Poor Performance
```
❌ Many metrics over budget
❌ Memory usage > 80%
❌ Frequent slow queries
❌ Consistently slow renders
```

---

## Troubleshooting

### No Metrics Showing
- Navigate through the app to generate data
- Wait a few seconds for metrics to populate
- Check browser console for errors
- Refresh the performance dashboard

### Inaccurate Metrics
- Clear browser cache
- Restart development server
- Close other browser tabs
- Test in incognito mode

### High Memory Usage
- Check for memory leaks
- Close unused tabs
- Restart browser
- Review recent code changes

### Slow Performance
- Check Network tab for large requests
- Review database queries
- Look for expensive renders
- Check for infinite loops

---

## Tips for Accurate Testing

1. **Test in Production Mode:**
   ```bash
   npm run build
   npm start
   ```

2. **Test with Realistic Data:**
   - Seed database with sample data
   - Test with 100+ records
   - Simulate real user actions

3. **Test on Different Devices:**
   - Desktop (fast connection)
   - Mobile (slow connection)
   - Tablet (medium connection)

4. **Test Network Conditions:**
   - Chrome DevTools > Network > Throttling
   - Test: Fast 3G, Slow 3G, Offline

5. **Test Multiple Scenarios:**
   - First visit (cold cache)
   - Return visit (warm cache)
   - Multiple tabs open
   - Background processes running

---

## Next Steps

After viewing performance data:

1. **Identify Issues:**
   - Note metrics exceeding budgets
   - List slow pages/components
   - Check memory trends

2. **Prioritize Fixes:**
   - Start with highest impact
   - Fix quick wins first
   - Plan complex optimizations

3. **Implement Optimizations:**
   - Refer to `OPTIMIZATION_OPPORTUNITIES.md`
   - Test each change
   - Measure improvements

4. **Monitor Ongoing:**
   - Set up weekly reviews
   - Track trends over time
   - Prevent regressions

---

## Resources

- **Full Documentation:** See `PERFORMANCE_MONITORING_REPORT.md`
- **Quick Start:** See `PERFORMANCE_QUICK_START.md`
- **Optimization Guide:** See `OPTIMIZATION_OPPORTUNITIES.md`

---

For questions or issues, refer to the troubleshooting section or review the full documentation.
