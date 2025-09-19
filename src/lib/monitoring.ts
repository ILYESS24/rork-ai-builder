import * as Sentry from '@sentry/nextjs'

// Configuration Sentry
export function initSentry() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    
    // Performance Monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Release tracking
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    
    beforeSend(event) {
      // Filtrer les erreurs sensibles
      if (event.exception) {
        const error = event.exception.values?.[0]
        if (error?.value?.includes('API_KEY')) {
          return null
        }
      }
      return event
    },
  })
}

// Fonctions utilitaires pour le monitoring
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    tags: {
      component: 'ai-builder',
    },
    extra: context,
  })
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.captureMessage(message, level)
}

export function startTransaction(name: string, op: string) {
  return Sentry.startTransaction({ name, op })
}

export function addBreadcrumb(message: string, category: string, data?: any) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
  })
}

// Métriques personnalisées
export function trackCodeGeneration(provider: string, framework: string, success: boolean) {
  Sentry.addBreadcrumb({
    message: 'Code generation completed',
    category: 'ai-generation',
    data: {
      provider,
      framework,
      success,
      timestamp: new Date().toISOString(),
    },
  })
}

export function trackUserAction(action: string, userId: string, metadata?: any) {
  Sentry.addBreadcrumb({
    message: `User action: ${action}`,
    category: 'user-action',
    data: {
      action,
      userId,
      metadata,
      timestamp: new Date().toISOString(),
    },
  })
}

export function trackPerformance(operation: string, duration: number, metadata?: any) {
  Sentry.addBreadcrumb({
    message: `Performance: ${operation}`,
    category: 'performance',
    data: {
      operation,
      duration,
      metadata,
      timestamp: new Date().toISOString(),
    },
  })
}
