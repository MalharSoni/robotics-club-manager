'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getPerformanceSummary,
  performanceStore,
  PERFORMANCE_BUDGETS,
  checkPerformanceBudget,
  getMemoryUsage,
  exportMetrics,
  PerformanceMetric,
} from '@/lib/performance';
import {
  ActivityIcon,
  ZapIcon,
  DatabaseIcon,
  ServerIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  DownloadIcon,
  RefreshCwIcon,
  AlertTriangleIcon,
  CheckCircle2Icon,
} from 'lucide-react';

interface MetricStats {
  avg: number;
  min: number;
  max: number;
  count: number;
  budget: number | null;
  status: 'good' | 'warning' | 'poor';
}

export default function PerformancePage() {
  const [summary, setSummary] = useState<ReturnType<typeof getPerformanceSummary> | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [memory, setMemory] = useState<ReturnType<typeof getMemoryUsage>>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshData = () => {
    const newSummary = getPerformanceSummary();
    const allMetrics = performanceStore.getMetrics();
    const memoryInfo = getMemoryUsage();

    setSummary(newSummary);
    setMetrics(allMetrics);
    setMemory(memoryInfo);
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    refreshData();

    // Auto-refresh every 5 seconds
    const interval = setInterval(refreshData, 5000);

    return () => clearInterval(interval);
  }, []);

  const calculateStats = (type: 'render' | 'api' | 'query' | 'page-load'): MetricStats => {
    const typeMetrics = metrics.filter((m) => m.type === type);

    if (typeMetrics.length === 0) {
      return {
        avg: 0,
        min: 0,
        max: 0,
        count: 0,
        budget: null,
        status: 'good',
      };
    }

    const values = typeMetrics.map((m) => m.value);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    let budget: number | null = null;
    switch (type) {
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

    let status: 'good' | 'warning' | 'poor' = 'good';
    if (budget) {
      if (avg > budget * 1.5) status = 'poor';
      else if (avg > budget) status = 'warning';
    }

    return { avg, min, max, count: typeMetrics.length, budget, status };
  };

  const renderStats = calculateStats('render');
  const apiStats = calculateStats('api');
  const queryStats = calculateStats('query');
  const pageLoadStats = calculateStats('page-load');

  const handleExport = () => {
    const data = exportMetrics();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: 'good' | 'warning' | 'poor') => {
    switch (status) {
      case 'good':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
    }
  };

  const getStatusIcon = (status: 'good' | 'warning' | 'poor') => {
    switch (status) {
      case 'good':
        return <CheckCircle2Icon className="h-4 w-4" />;
      case 'warning':
      case 'poor':
        return <AlertTriangleIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performance Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time performance metrics and optimization insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCwIcon className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <DownloadIcon className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Render Performance</CardTitle>
            <ZapIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {renderStats.avg.toFixed(2)}ms
              </div>
              <Badge variant={renderStats.status === 'good' ? 'default' : 'destructive'}>
                {renderStats.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Budget: {renderStats.budget}ms | {renderStats.count} samples
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span>Min: {renderStats.min.toFixed(2)}ms</span>
              <span>Max: {renderStats.max.toFixed(2)}ms</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <ServerIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {apiStats.avg.toFixed(2)}ms
              </div>
              <Badge variant={apiStats.status === 'good' ? 'default' : 'destructive'}>
                {apiStats.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Budget: {apiStats.budget}ms | {apiStats.count} samples
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span>Min: {apiStats.min.toFixed(2)}ms</span>
              <span>Max: {apiStats.max.toFixed(2)}ms</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Queries</CardTitle>
            <DatabaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {queryStats.avg.toFixed(2)}ms
              </div>
              <Badge variant={queryStats.status === 'good' ? 'default' : 'destructive'}>
                {queryStats.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Budget: {queryStats.budget}ms | {queryStats.count} samples
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span>Min: {queryStats.min.toFixed(2)}ms</span>
              <span>Max: {queryStats.max.toFixed(2)}ms</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Page Load</CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">
                {pageLoadStats.avg.toFixed(2)}ms
              </div>
              <Badge variant={pageLoadStats.status === 'good' ? 'default' : 'destructive'}>
                {pageLoadStats.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Budget: {pageLoadStats.budget}ms | {pageLoadStats.count} samples
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span>Min: {pageLoadStats.min.toFixed(2)}ms</span>
              <span>Max: {pageLoadStats.max.toFixed(2)}ms</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Memory Usage */}
      {memory && (
        <Card>
          <CardHeader>
            <CardTitle>Memory Usage</CardTitle>
            <CardDescription>JavaScript heap memory statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Memory Usage</span>
                  <span className="text-sm text-muted-foreground">
                    {memory.usedPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      memory.usedPercentage > 80
                        ? 'bg-red-500'
                        : memory.usedPercentage > 60
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${memory.usedPercentage}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Used</p>
                  <p className="font-medium">
                    {(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total</p>
                  <p className="font-medium">
                    {(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Limit</p>
                  <p className="font-medium">
                    {(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics */}
      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Metrics</TabsTrigger>
          <TabsTrigger value="budgets">Performance Budgets</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Performance Metrics</CardTitle>
              <CardDescription>Last 20 performance measurements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {summary?.recent.map((metric, idx) => {
                  const check = checkPerformanceBudget(metric);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            check.passes ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                        <div>
                          <p className="font-medium text-sm">{metric.name}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {metric.type}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{metric.value.toFixed(2)}ms</p>
                        {check.budget && (
                          <p className="text-xs text-muted-foreground">
                            Budget: {check.budget}ms
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {summary?.recent.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No metrics recorded yet. Navigate through the app to collect data.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Budgets</CardTitle>
              <CardDescription>Target thresholds for optimal performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Core Web Vitals</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>LCP (Largest Contentful Paint)</span>
                        <span className="font-mono">{PERFORMANCE_BUDGETS.LCP}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>FID (First Input Delay)</span>
                        <span className="font-mono">{PERFORMANCE_BUDGETS.FID}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>CLS (Cumulative Layout Shift)</span>
                        <span className="font-mono">{PERFORMANCE_BUDGETS.CLS}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>FCP (First Contentful Paint)</span>
                        <span className="font-mono">{PERFORMANCE_BUDGETS.FCP}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>TTFB (Time to First Byte)</span>
                        <span className="font-mono">{PERFORMANCE_BUDGETS.TTFB}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>INP (Interaction to Next Paint)</span>
                        <span className="font-mono">{PERFORMANCE_BUDGETS.INP}ms</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold mb-2">Custom Metrics</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Component Render Time</span>
                        <span className="font-mono">{PERFORMANCE_BUDGETS.RENDER_TIME}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>API Call Duration</span>
                        <span className="font-mono">{PERFORMANCE_BUDGETS.API_CALL}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Database Query Time</span>
                        <span className="font-mono">{PERFORMANCE_BUDGETS.DB_QUERY}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Page Load Time</span>
                        <span className="font-mono">{PERFORMANCE_BUDGETS.PAGE_LOAD}ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Recommendations</CardTitle>
              <CardDescription>Optimization suggestions based on current metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {renderStats.status !== 'good' && renderStats.count > 0 && (
                  <div className="p-4 border border-yellow-500 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Slow Component Renders Detected</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Average render time ({renderStats.avg.toFixed(2)}ms) exceeds budget (
                          {renderStats.budget}ms). Consider using React.memo() or useMemo() for
                          expensive computations.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {apiStats.status !== 'good' && apiStats.count > 0 && (
                  <div className="p-4 border border-yellow-500 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Slow API Calls</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Average API call time ({apiStats.avg.toFixed(2)}ms) exceeds budget (
                          {apiStats.budget}ms). Consider implementing caching or pagination.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {queryStats.status !== 'good' && queryStats.count > 0 && (
                  <div className="p-4 border border-yellow-500 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangleIcon className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">Slow Database Queries</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Average query time ({queryStats.avg.toFixed(2)}ms) exceeds budget (
                          {queryStats.budget}ms). Review database indexes and optimize queries.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {memory && memory.usedPercentage > 80 && (
                  <div className="p-4 border border-red-500 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangleIcon className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold">High Memory Usage</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Memory usage is at {memory.usedPercentage.toFixed(1)}%. Consider
                          cleaning up unused objects and implementing virtual scrolling for large
                          lists.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {renderStats.status === 'good' &&
                  apiStats.status === 'good' &&
                  queryStats.status === 'good' &&
                  (!memory || memory.usedPercentage < 80) && (
                    <div className="p-4 border border-green-500 rounded-lg">
                      <div className="flex items-start gap-3">
                        <CheckCircle2Icon className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <h4 className="font-semibold">Performance is Good</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            All metrics are within acceptable ranges. Keep up the good work!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">General Best Practices</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Use React.lazy() for code splitting large components</li>
                    <li>• Implement pagination for large data sets</li>
                    <li>• Use proper image optimization with Next.js Image component</li>
                    <li>• Minimize bundle size by analyzing with ANALYZE=true npm run build</li>
                    <li>• Use Suspense boundaries for better loading experiences</li>
                    <li>• Implement proper caching strategies for API calls</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
