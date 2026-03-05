/**
 * Instrumentation for Performance Monitoring
 * This file is automatically loaded by Next.js for both server and client
 */

export async function register() {
  // Only run on server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[Instrumentation] Server-side monitoring initialized');

    // Initialize server-side performance monitoring
    const startTime = Date.now();

    // Log server start time
    console.log(`[Performance] Server initialization: ${Date.now() - startTime}ms`);
  }

  // Only run on edge runtime
  if (process.env.NEXT_RUNTIME === 'edge') {
    console.log('[Instrumentation] Edge runtime monitoring initialized');
  }
}

export async function onRequestError(
  err: Error,
  request: Request,
  context: {
    routerKind: 'Pages Router' | 'App Router';
    routePath: string;
    routeType: 'render' | 'route' | 'action' | 'middleware';
  }
) {
  // Log errors for monitoring
  console.error('[Performance Error]', {
    error: err.message,
    stack: err.stack,
    url: request.url,
    method: request.method,
    ...context,
  });

  // In production, you would send this to an error tracking service
  // like Sentry, DataDog, or your own logging service
}
