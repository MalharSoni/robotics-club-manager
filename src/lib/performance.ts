/**
 * Performance Monitoring Utilities
 * Provides comprehensive performance tracking for the Robotics Club Manager app
 */

import { Metric } from 'web-vitals';

// Performance Budgets (in milliseconds)
export const PERFORMANCE_BUDGETS = {
  // Core Web Vitals
  LCP: 2500, // Largest Contentful Paint
  FID: 100,  // First Input Delay
  CLS: 0.1,  // Cumulative Layout Shift (score, not ms)
  FCP: 1800, // First Contentful Paint
  TTFB: 600, // Time to First Byte
  INP: 200,  // Interaction to Next Paint

  // Custom metrics
  RENDER_TIME: 16, // 60fps = 16ms per frame
  API_CALL: 1000,
  DB_QUERY: 500,
  PAGE_LOAD: 3000,
} as const;

// Performance metric types
export type PerformanceMetricType =
  | 'render'
  | 'api'
  | 'query'
  | 'page-load'
  | 'component-mount'
  | 'custom';

export interface PerformanceMetric {
  name: string;
  type: PerformanceMetricType;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// In-memory storage for metrics (replace with proper backend in production)
class PerformanceStore {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;

  add(metric: PerformanceMetric) {
    this.metrics.push(metric);

    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.logMetric(metric);
    }
  }

  getMetrics(type?: PerformanceMetricType): PerformanceMetric[] {
    if (type) {
      return this.metrics.filter(m => m.type === type);
    }
    return this.metrics;
  }

  getAverageByType(type: PerformanceMetricType): number {
    const typeMetrics = this.getMetrics(type);
    if (typeMetrics.length === 0) return 0;

    const sum = typeMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / typeMetrics.length;
  }

  getRecentMetrics(count: number = 10): PerformanceMetric[] {
    return this.metrics.slice(-count);
  }

  clear() {
    this.metrics = [];
  }

  private logMetric(metric: PerformanceMetric) {
    const budget = this.getBudget(metric);
    const status = budget && metric.value > budget ? '⚠️ SLOW' : '✓';

    console.log(
      `${status} [${metric.type}] ${metric.name}: ${metric.value.toFixed(2)}ms`,
      metric.metadata || ''
    );
  }

  private getBudget(metric: PerformanceMetric): number | null {
    switch (metric.type) {
      case 'render':
        return PERFORMANCE_BUDGETS.RENDER_TIME;
      case 'api':
        return PERFORMANCE_BUDGETS.API_CALL;
      case 'query':
        return PERFORMANCE_BUDGETS.DB_QUERY;
      case 'page-load':
        return PERFORMANCE_BUDGETS.PAGE_LOAD;
      default:
        return null;
    }
  }
}

export const performanceStore = new PerformanceStore();

/**
 * Measure component render time
 * @example
 * const stopMeasure = measureRender('StudentList');
 * // ... component renders
 * stopMeasure();
 */
export function measureRender(componentName: string) {
  const startTime = performance.now();

  return (metadata?: Record<string, unknown>) => {
    const duration = performance.now() - startTime;

    performanceStore.add({
      name: componentName,
      type: 'render',
      value: duration,
      timestamp: Date.now(),
      metadata,
    });

    return duration;
  };
}

/**
 * Measure database query time
 * @example
 * const measure = measureQuery('getStudents');
 * const students = await prisma.student.findMany();
 * measure.end({ count: students.length });
 */
export function measureQuery(queryName: string) {
  const startTime = performance.now();

  return {
    end: (metadata?: Record<string, unknown>) => {
      const duration = performance.now() - startTime;

      performanceStore.add({
        name: queryName,
        type: 'query',
        value: duration,
        timestamp: Date.now(),
        metadata,
      });

      return duration;
    },
  };
}

/**
 * Measure API call time
 * @example
 * const measure = measureAPI('/api/students');
 * const response = await fetch('/api/students');
 * measure.end({ status: response.status });
 */
export function measureAPI(apiPath: string) {
  const startTime = performance.now();

  return {
    end: (metadata?: Record<string, unknown>) => {
      const duration = performance.now() - startTime;

      performanceStore.add({
        name: apiPath,
        type: 'api',
        value: duration,
        timestamp: Date.now(),
        metadata,
      });

      return duration;
    },
  };
}

/**
 * Measure page load time
 */
export function measurePageLoad(pageName: string) {
  if (typeof window === 'undefined') return;

  // Use Navigation Timing API
  const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  if (perfData) {
    const pageLoadTime = perfData.loadEventEnd - perfData.fetchStart;
    const domContentLoaded = perfData.domContentLoadedEventEnd - perfData.fetchStart;
    const timeToFirstByte = perfData.responseStart - perfData.fetchStart;

    performanceStore.add({
      name: pageName,
      type: 'page-load',
      value: pageLoadTime,
      timestamp: Date.now(),
      metadata: {
        domContentLoaded,
        timeToFirstByte,
        domInteractive: perfData.domInteractive - perfData.fetchStart,
      },
    });
  }
}

/**
 * Report Web Vitals to analytics
 */
export function reportWebVitals(metric: Metric) {
  const { name, value, id, rating } = metric;

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${name}:`, {
      value: name === 'CLS' ? value : `${value}ms`,
      rating,
      id,
    });
  }

  // Send to analytics endpoint
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, {
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_category: 'Web Vitals',
      event_label: id,
      non_interaction: true,
    });
  }

  // Store in our performance store
  const metricValue = name === 'CLS' ? value * 1000 : value;
  performanceStore.add({
    name,
    type: 'custom',
    value: metricValue,
    timestamp: Date.now(),
    metadata: { rating, id },
  });
}

/**
 * Mark a custom performance point
 */
export function markPerformance(name: string) {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(name);
  }
}

/**
 * Measure between two performance marks
 */
export function measurePerformance(name: string, startMark: string, endMark: string) {
  if (typeof performance !== 'undefined' && performance.measure) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];

      performanceStore.add({
        name,
        type: 'custom',
        value: measure.duration,
        timestamp: Date.now(),
      });

      return measure.duration;
    } catch (error) {
      console.error('Performance measurement failed:', error);
    }
  }
  return 0;
}

/**
 * Get performance summary
 */
export function getPerformanceSummary() {
  return {
    averages: {
      render: performanceStore.getAverageByType('render'),
      api: performanceStore.getAverageByType('api'),
      query: performanceStore.getAverageByType('query'),
      pageLoad: performanceStore.getAverageByType('page-load'),
    },
    recent: performanceStore.getRecentMetrics(20),
    budgets: PERFORMANCE_BUDGETS,
  };
}

/**
 * Check if performance meets budgets
 */
export function checkPerformanceBudget(metric: PerformanceMetric): {
  passes: boolean;
  budget: number | null;
  overBy: number | null;
} {
  let budget: number | null = null;

  switch (metric.type) {
    case 'render':
      budget = PERFORMANCE_BUDGETS.RENDER_TIME;
      break;
    case 'api':
      budget = PERFORMANCE_BUDGETS.API_CALL;
      break;
    case 'query':
      budget = PERFORMANCE_BUDGETS.DB_QUERY;
      break;
    case 'page-load':
      budget = PERFORMANCE_BUDGETS.PAGE_LOAD;
      break;
  }

  if (budget === null) {
    return { passes: true, budget: null, overBy: null };
  }

  const passes = metric.value <= budget;
  const overBy = passes ? null : metric.value - budget;

  return { passes, budget, overBy };
}

/**
 * Get memory usage (if available)
 */
export function getMemoryUsage() {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usedPercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
    };
  }
  return null;
}

/**
 * Monitor long tasks (tasks over 50ms)
 */
export function monitorLongTasks() {
  if (typeof window === 'undefined') return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        performanceStore.add({
          name: 'Long Task',
          type: 'custom',
          value: entry.duration,
          timestamp: Date.now(),
          metadata: {
            startTime: entry.startTime,
          },
        });
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
  } catch (error) {
    // PerformanceObserver not supported
    console.warn('Long task monitoring not supported');
  }
}

/**
 * Export metrics for analysis
 */
export function exportMetrics() {
  return {
    metrics: performanceStore.getMetrics(),
    summary: getPerformanceSummary(),
    timestamp: Date.now(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  };
}

// Extend window type for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params: Record<string, unknown>
    ) => void;
  }
}
