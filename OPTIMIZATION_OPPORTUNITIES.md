# Performance Optimization Opportunities

Based on comprehensive code analysis of the Robotics Club Manager application.

---

## High Priority Optimizations

### 1. Analytics Page - Heavy Client-Side Loading

**File:** `/src/app/dashboard/analytics/page.tsx`

**Issue:**
- Client component with 8 sequential API calls on mount
- All charts load immediately (recharts is 180KB)
- No caching between renders
- useEffect re-fetches on every timeRange change

**Current Code Pattern:**
```typescript
useEffect(() => {
  loadAnalyticsData() // 8 sequential fetches
}, [timeRange])
```

**Recommended Fix:**
```typescript
// 1. Convert to Server Component where possible
export default async function AnalyticsPage() {
  const initialData = await getInitialAnalytics();
  return <AnalyticsClient initialData={initialData} />;
}

// 2. Lazy load chart components
const LineChart = lazy(() => import('@/components/analytics/line-chart'));
const BarChart = lazy(() => import('@/components/analytics/bar-chart'));
const PieChart = lazy(() => import('@/components/analytics/pie-chart'));

// 3. Add Suspense boundaries
<Suspense fallback={<ChartSkeleton />}>
  <LineChart data={data} />
</Suspense>

// 4. Implement parallel data fetching
const [stats, growth, skills] = await Promise.all([
  getDashboardStats(),
  getStudentGrowthData(),
  getSkillsDistribution(),
]);
```

**Expected Impact:**
- 40% faster initial load
- 180KB deferred for chart library
- Better perceived performance with skeletons

---

### 2. Optimize Icon Imports

**Current:** 541 icon imports across 106 files

**Issue:**
While we've enabled `optimizePackageImports` for lucide-react, verify it's working correctly.

**Verification Command:**
```bash
npm run analyze
# Look for lucide-react in bundle analysis
```

**If Not Optimized:**
```typescript
// Instead of:
import { Icon1, Icon2, Icon3 } from 'lucide-react';

// Use named imports (better for tree-shaking):
import Icon1 from 'lucide-react/dist/esm/icons/icon1';
```

**Expected Impact:**
- 50KB reduction in icon bundle

---

### 3. Add Database Indexes

**Files to Update:** `prisma/schema.prisma`

**Current Missing Indexes:**

```prisma
model Student {
  id String @id @default(cuid())
  name String
  email String @unique
  createdAt DateTime @default(now())

  // ADD:
  @@index([name])
  @@index([createdAt])
}

model Task {
  id String @id @default(cuid())
  status TaskStatus
  dueDate DateTime?
  assignedToId String?

  // ADD:
  @@index([status])
  @@index([dueDate])
  @@index([assignedToId, status])
  @@index([status, dueDate])
}

model Project {
  id String @id @default(cuid())
  status ProjectStatus
  startDate DateTime
  endDate DateTime?

  // ADD:
  @@index([status])
  @@index([startDate])
}

model StudentSkill {
  studentId String
  skillId String
  proficiency ProficiencyLevel

  // ADD:
  @@index([studentId])
  @@index([skillId])
  @@index([proficiency])
}
```

**After Adding:**
```bash
npx prisma migrate dev --name add_performance_indexes
```

**Expected Impact:**
- 50-70% faster filtered queries
- Better performance on lists with filters

---

## Medium Priority Optimizations

### 4. Implement Pagination

**Files:**
- `/src/app/dashboard/students/page.tsx`
- `/src/app/dashboard/projects/page.tsx`
- `/src/app/dashboard/reports/page.tsx`

**Current Issue:**
All items loaded at once, no pagination

**Recommended Implementation:**
```typescript
// In actions file
export async function getStudents(page = 1, pageSize = 20) {
  const skip = (page - 1) * pageSize;

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      take: pageSize,
      skip: skip,
      orderBy: { name: 'asc' },
    }),
    prisma.student.count(),
  ]);

  return {
    students,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
```

**Expected Impact:**
- 10x faster initial load for large datasets
- Better memory usage
- Improved UX with loading states

---

### 5. Add Virtual Scrolling for Large Lists

**Files:**
- `/src/components/students/student-list-client.tsx`
- `/src/components/tasks/task-card.tsx` (if in a long list)

**Recommended Library:**
```bash
npm install react-virtual
```

**Implementation:**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function StudentList({ students }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: students.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // estimated row height
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualItem => (
          <div key={virtualItem.key}>
            <StudentCard student={students[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Expected Impact:**
- Render only visible items
- Smooth scrolling with 1000+ items
- Constant memory usage regardless of list size

---

### 6. Optimize Image Loading

**Files:** Check all pages using images

**Current:** May be using standard `<img>` tags

**Recommended:**
```typescript
import Image from 'next/image';

// Instead of:
<img src="/avatar.jpg" alt="Avatar" />

// Use:
<Image
  src="/avatar.jpg"
  alt="Avatar"
  width={40}
  height={40}
  priority // for above-fold images
  placeholder="blur" // for better UX
/>
```

**Expected Impact:**
- Automatic format optimization (WebP/AVIF)
- Lazy loading by default
- Reduced Cumulative Layout Shift

---

### 7. Add Loading Skeletons

**Files:** All page components

**Current:** Simple "Loading..." text or spinners

**Recommended:**
```typescript
import { Skeleton } from '@/components/ui/skeleton';

function StudentListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  );
}

// In page:
<Suspense fallback={<StudentListSkeleton />}>
  <StudentList />
</Suspense>
```

**Expected Impact:**
- Better perceived performance
- Lower CLS (Cumulative Layout Shift)
- Professional loading experience

---

## Low Priority Optimizations

### 8. Implement Request Caching

**Files:** All server actions

**Current:** Every request hits database

**Recommended:**
```typescript
import { unstable_cache } from 'next/cache';

export const getStudents = unstable_cache(
  async () => {
    return await prisma.student.findMany();
  },
  ['students'],
  {
    revalidate: 60, // Cache for 60 seconds
    tags: ['students'],
  }
);

// Revalidate when data changes:
import { revalidateTag } from 'next/cache';

export async function createStudent(data) {
  const student = await prisma.student.create({ data });
  revalidateTag('students');
  return student;
}
```

**Expected Impact:**
- 10x faster repeated requests
- Reduced database load
- Better scalability

---

### 9. Code Split Form Libraries

**Files:** Forms using react-hook-form + zod

**Current:** All forms load validation libraries immediately

**Recommended:**
```typescript
// Lazy load heavy forms
const StudentFormDialog = lazy(() =>
  import('@/components/students/student-form-dialog')
);

// Use Suspense
<Suspense fallback={<FormSkeleton />}>
  <StudentFormDialog />
</Suspense>
```

**Expected Impact:**
- 120KB deferred (RHF + Zod)
- Faster initial page load
- Forms load on demand

---

### 10. Optimize Recharts Bundle

**File:** `/src/app/dashboard/analytics/page.tsx`

**Current:** Imports entire recharts library

**Recommended:**
```typescript
// Instead of importing from 'recharts'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Try importing specific components (if available)
import LineChart from 'recharts/lib/chart/LineChart';
// etc.

// OR switch to lighter alternative
// Consider: chart.js, nivo, or visx
```

**Expected Impact:**
- Potentially 50-100KB reduction
- Faster chart rendering

---

## Implementation Checklist

### Week 1
- [ ] Add database indexes (30 min)
- [ ] Implement pagination on Students page (2 hours)
- [ ] Add loading skeletons to main pages (1 hour)
- [ ] Lazy load Analytics page charts (1 hour)

### Week 2
- [ ] Optimize Analytics page data fetching (3 hours)
- [ ] Add virtual scrolling to long lists (2 hours)
- [ ] Implement request caching (2 hours)
- [ ] Verify icon tree-shaking (30 min)

### Week 3
- [ ] Code split heavy forms (2 hours)
- [ ] Optimize images with Next.js Image (1 hour)
- [ ] Review and optimize remaining pages (2 hours)

### Week 4
- [ ] Performance testing and measurement (2 hours)
- [ ] Fix any remaining issues (2 hours)
- [ ] Documentation updates (1 hour)

---

## Measurement Plan

Before implementing each optimization:

1. **Measure Baseline**
   ```bash
   npm run analyze
   # Record current bundle size
   ```

2. **Implement Optimization**

3. **Measure Impact**
   ```bash
   npm run analyze
   # Compare new bundle size
   # Check performance dashboard
   ```

4. **Document Results**
   - Record improvement %
   - Note any issues
   - Update this document

---

## Expected Overall Impact

After implementing all optimizations:

| Metric | Current (Est.) | Target | Improvement |
|--------|----------------|--------|-------------|
| Initial Bundle | 716 KB | 450 KB | 37% smaller |
| LCP | ~3.5s | <2.5s | 28% faster |
| FCP | ~2.2s | <1.8s | 18% faster |
| TTI | ~4.0s | <3.0s | 25% faster |
| Database Queries | 200-500ms | 50-150ms | 70% faster |
| Memory Usage | Variable | Stable | Consistent |

---

## Resources

- [Next.js Performance Docs](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance Guide](https://react.dev/learn/render-and-commit)
- [Web Vitals](https://web.dev/vitals/)
- [Prisma Performance](https://www.prisma.io/docs/guides/performance-and-optimization)

---

Last Updated: February 10, 2026
