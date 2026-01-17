// Sentry Error Tracking Configuration
// Install: npm install @sentry/react

/*
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

export function initSentry() {
  if (import.meta.env.PROD) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new BrowserTracing(),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% of transactions
      
      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
      
      // Environment
      environment: import.meta.env.MODE,
      
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      
      // Custom tags
      initialScope: {
        tags: {
          app: 'sublimes-drive',
          platform: 'web',
        },
      },
      
      // Filter errors
      beforeSend(event, hint) {
        // Don't send certain errors
        const error = hint.originalException as Error;
        if (error?.message?.includes('ResizeObserver')) {
          return null; // Ignore ResizeObserver errors
        }
        return event;
      },
      
      // Privacy
      beforeBreadcrumb(breadcrumb) {
        // Sanitize sensitive data from breadcrumbs
        if (breadcrumb.category === 'console') {
          return null;
        }
        return breadcrumb;
      },
    });
  }
}

// Custom error logging
export function logError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

// Custom event tracking
export function logEvent(message: string, data?: Record<string, any>) {
  Sentry.captureMessage(message, {
    level: 'info',
    extra: data,
  });
}

// Set user context
export function setUser(user: { id: string; email?: string; role?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}

// Clear user context (on logout)
export function clearUser() {
  Sentry.setUser(null);
}

// Performance monitoring
export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({
    name,
    op,
  });
}
*/

import { SENTRY_DSN, APP_VERSION, MODE } from '../../lib/env';

// Sentry configuration
const SENTRY_CONFIG = {
  dsn: SENTRY_DSN,
  environment: MODE || 'development',
  release: APP_VERSION || '2.0.0',
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
};

// Using browser console for now - will integrate full Sentry after npm install
export function initSentry() {
  if (!SENTRY_DSN) {
    console.warn('🔍 Sentry not configured (missing VITE_SENTRY_DSN)');
    return;
  }

  console.log('🔍 Sentry initialized', {
    environment: SENTRY_CONFIG.environment,
    release: SENTRY_CONFIG.release,
  });
  
  // Set up global error handler
  window.addEventListener('error', (event) => {
    // Filter out clipboard errors (expected in Figma iframe environment)
    if (event.message?.includes('Clipboard')) {
      return; // Silently ignore clipboard errors
    }
    
    logError(new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    // Filter out clipboard errors (expected in Figma iframe environment)
    const errorMessage = event.reason?.message || String(event.reason);
    if (errorMessage.includes('Clipboard') || errorMessage.includes('NotAllowedError')) {
      return; // Silently ignore clipboard errors
    }
    
    logError(new Error(event.reason), {
      type: 'unhandledRejection',
    });
  });
}

export function logError(error: Error, context?: Record<string, any>) {
  // Filter out clipboard errors (expected in Figma iframe environment)
  if (error?.message?.includes('Clipboard') || error?.message?.includes('NotAllowedError')) {
    return; // Silently ignore clipboard errors
  }
  
  console.error('🚨 [Sentry Error]:', error.message, {
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  });
  
  // TODO: Send to Sentry after npm install @sentry/react
}

export function logEvent(message: string, data?: Record<string, any>) {
  console.log('📊 [Sentry Event]:', message, data);
}

export function setUser(user: { id: string; email?: string; role?: string }) {
  console.log('👤 [Sentry User]:', user);
}

export function clearUser() {
  console.log('🔓 [Sentry] User context cleared');
}

export function startTransaction(name: string, op: string) {
  console.log('⏱️ [Sentry Transaction]:', name, op);
  return {
    finish: () => console.log('✅ [Sentry] Transaction finished:', name),
  };
}
