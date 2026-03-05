# Performance Monitoring - Quick Start Guide

## Viewing Performance Data

### 1. Start Development Server
```bash
npm run dev
```

### 2. Access Performance Dashboard
Navigate to: `http://localhost:3000/dashboard/performance`

### 3. Generate Data
- Click through different pages
- Create/edit students, projects, tasks
- Metrics will automatically populate

---

## Using Performance Utilities

### Track Component Render Time
```typescript
import { measureRender } from '@/lib/performance';

function MyComponent() {
  const stopMeasure = measureRender('MyComponent');

  useEffect(() => {
    stopMeasure({ prop: 'value' });
  }, []);

  return <div>Content</div>;
}
```

### Track API Calls
```typescript
import { measureAPI } from '@/lib/performance';

async function fetchData() {
  const measure = measureAPI('/api/endpoint');
  const response = await fetch('/api/endpoint');
  const data = await response.json();
  measure.end({ status: response.status });
  return data;
}
```

### Track Database Queries
```typescript
import { measureQuery } from '@/lib/performance';

async function queryDatabase() {
  const measure = measureQuery('queryName');
  const result = await prisma.model.findMany();
  measure.end({ count: result.length });
  return result;
}
```

---

## Analyzing Bundle Size

### Run Bundle Analyzer
```bash
ANALYZE=true npm run build
```

This will:
1. Build the production app
2. Open interactive bundle visualization
3. Show sizes of all dependencies

---

## Performance Budgets

| Metric | Budget | Description |
|--------|--------|-------------|
| Component Render | 16ms | For 60fps |
| API Call | 1000ms | Maximum response time |
| Database Query | 500ms | Query execution time |
| Page Load | 3000ms | Total page load |
| LCP | 2500ms | Largest Contentful Paint |
| FID | 100ms | First Input Delay |

---

## Quick Optimization Checklist

- [ ] Use React.memo() for heavy components
- [ ] Implement React.lazy() for code splitting
- [ ] Add loading skeletons with Suspense
- [ ] Optimize images with Next.js Image
- [ ] Add database indexes for queries
- [ ] Use pagination for large lists
- [ ] Cache API responses where possible
- [ ] Remove console.logs (auto-removed in production)

---

## Common Issues

**No metrics showing?**
- Make sure you're navigating through the app
- Check browser console for errors
- Refresh the performance dashboard

**High memory usage?**
- Check for memory leaks
- Clear browser cache
- Restart development server

**Slow page loads?**
- Check Network tab in DevTools
- Look for large bundle sizes
- Review database query times

---

## Files Created

```
/src/lib/performance.ts                    - Performance utilities
/src/app/dashboard/performance/page.tsx   - Performance dashboard
/src/components/web-vitals.tsx            - Web Vitals tracking
/instrumentation.ts                        - Server-side monitoring
/PERFORMANCE_MONITORING_REPORT.md         - Full documentation
```

---

## Next Steps

1. Fix TypeScript build errors
2. Run full bundle analysis
3. Implement React.lazy() on Analytics page
4. Add database indexes
5. Set up production monitoring

---

For detailed information, see `PERFORMANCE_MONITORING_REPORT.md`
