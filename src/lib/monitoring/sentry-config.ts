import * as Sentry from '@sentry/nextjs'

// Configuration Sentry avancée
export function initSentry() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    
    // Performance monitoring
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Session replay
    replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.5,
    replaysOnErrorSampleRate: 1.0,
    
    // Configuration avancée
    environment: process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA || 'development',
    
    // Filtrage des erreurs
    beforeSend(event, hint) {
      // Filtrer les erreurs de développement
      if (process.env.NODE_ENV === 'development') {
        console.log('Sentry Event:', event)
      }
      
      // Filtrer certaines erreurs connues
      if (event.exception) {
        const error = hint.originalException
        if (error instanceof Error) {
          // Ignorer les erreurs de réseau courantes
          if (error.message.includes('Network Error') || 
              error.message.includes('fetch')) {
            return null
          }
          
          // Ignorer les erreurs de résolution DNS
          if (error.message.includes('getaddrinfo ENOTFOUND')) {
            return null
          }
        }
      }
      
      return event
    },
    
    // Configuration des tags
    initialScope: {
      tags: {
        component: 'rork-ai-builder',
        version: process.env.npm_package_version || '1.0.0',
      },
    },
    
    // Configuration des intégrations
    integrations: [
      new Sentry.BrowserTracing({
        // Configuration du tracing
        routingInstrumentation: Sentry.nextjsRouterInstrumentation,
        
        // URLs à tracer
        tracingOrigins: [
          'localhost',
          'rork-ai-builder.onrender.com',
          /^\//,
        ],
      }),
      new Sentry.Replay({
        // Configuration du replay
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    
    // Configuration des breadcrumbs
    beforeBreadcrumb(breadcrumb) {
      // Filtrer les breadcrumbs sensibles
      if (breadcrumb.category === 'fetch' && breadcrumb.data) {
        const url = breadcrumb.data.url
        if (url && (url.includes('api-key') || url.includes('secret'))) {
          return null
        }
      }
      
      return breadcrumb
    },
  })
}

// Utilitaires de monitoring
export class MonitoringService {
  // Capturer une erreur avec contexte
  static captureError(error: Error, context?: Record<string, any>) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value)
        })
      }
      Sentry.captureException(error)
    })
  }

  // Capturer un message avec niveau
  static captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
    Sentry.withScope((scope) => {
      if (context) {
        Object.entries(context).forEach(([key, value]) => {
          scope.setContext(key, value)
        })
      }
      scope.setLevel(level)
      Sentry.captureMessage(message)
    })
  }

  // Capturer une transaction
  static captureTransaction(name: string, operation: string, data?: any) {
    return Sentry.startTransaction({
      name,
      op: operation,
      data,
    })
  }

  // Capturer une span
  static captureSpan(name: string, operation: string, callback: (span: Sentry.Span) => void) {
    return Sentry.startSpan({
      name,
      op: operation,
    }, callback)
  }

  // Capturer les métriques de performance
  static capturePerformanceMetric(name: string, value: number, unit: string = 'ms') {
    Sentry.addBreadcrumb({
      category: 'performance',
      message: `${name}: ${value}${unit}`,
      level: 'info',
      data: {
        name,
        value,
        unit,
      },
    })
  }

  // Capturer les métriques d'utilisation
  static captureUsageMetric(userId: string, action: string, metadata?: Record<string, any>) {
    Sentry.addBreadcrumb({
      category: 'usage',
      message: `User ${userId} performed ${action}`,
      level: 'info',
      data: {
        userId,
        action,
        ...metadata,
      },
    })
  }

  // Capturer les erreurs d'API
  static captureApiError(endpoint: string, method: string, statusCode: number, error: any) {
    Sentry.captureException(error, {
      tags: {
        endpoint,
        method,
        statusCode,
      },
      level: statusCode >= 500 ? 'error' : 'warning',
    })
  }

  // Capturer les erreurs de génération IA
  static captureAIError(provider: string, model: string, prompt: string, error: any) {
    Sentry.captureException(error, {
      tags: {
        ai_provider: provider,
        ai_model: model,
      },
      extra: {
        prompt: prompt.substring(0, 500), // Limiter la taille du prompt
      },
    })
  }

  // Capturer les erreurs de collaboration
  static captureCollaborationError(projectId: string, userId: string, action: string, error: any) {
    Sentry.captureException(error, {
      tags: {
        collaboration: true,
        projectId,
        userId,
        action,
      },
    })
  }

  // Capturer les erreurs de paiement
  static capturePaymentError(userId: string, amount: number, currency: string, error: any) {
    Sentry.captureException(error, {
      tags: {
        payment: true,
        userId,
        amount,
        currency,
      },
      level: 'error',
    })
  }

  // Capturer les métriques de génération de code
  static captureCodeGenerationMetrics(
    provider: string,
    model: string,
    promptLength: number,
    responseLength: number,
    generationTime: number,
    success: boolean
  ) {
    Sentry.addBreadcrumb({
      category: 'ai_generation',
      message: `Code generation: ${success ? 'success' : 'failed'}`,
      level: success ? 'info' : 'error',
      data: {
        provider,
        model,
        promptLength,
        responseLength,
        generationTime,
        success,
      },
    })

    // Capturer les métriques de performance
    this.capturePerformanceMetric('code_generation_time', generationTime)
    this.capturePerformanceMetric('code_generation_length', responseLength, 'chars')
  }

  // Capturer les métriques d'utilisation des templates
  static captureTemplateUsage(templateId: string, userId: string, category: string) {
    Sentry.addBreadcrumb({
      category: 'template_usage',
      message: `Template ${templateId} used by ${userId}`,
      level: 'info',
      data: {
        templateId,
        userId,
        category,
      },
    })
  }

  // Capturer les métriques de collaboration
  static captureCollaborationMetrics(
    projectId: string,
    activeUsers: number,
    changesCount: number,
    sessionDuration: number
  ) {
    Sentry.addBreadcrumb({
      category: 'collaboration',
      message: `Collaboration session: ${activeUsers} users, ${changesCount} changes`,
      level: 'info',
      data: {
        projectId,
        activeUsers,
        changesCount,
        sessionDuration,
      },
    })
  }

  // Capturer les erreurs de base de données
  static captureDatabaseError(operation: string, table: string, error: any) {
    Sentry.captureException(error, {
      tags: {
        database: true,
        operation,
        table,
      },
    })
  }

  // Capturer les erreurs d'authentification
  static captureAuthError(userId: string, action: string, error: any) {
    Sentry.captureException(error, {
      tags: {
        auth: true,
        userId,
        action,
      },
    })
  }

  // Configuration des utilisateurs pour Sentry
  static setUserContext(user: {
    id: string
    email: string
    plan?: string
    createdAt?: Date
  }) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.email,
    })

    Sentry.setContext('user', {
      plan: user.plan,
      createdAt: user.createdAt,
    })
  }

  // Nettoyer le contexte utilisateur
  static clearUserContext() {
    Sentry.setUser(null)
    Sentry.setContext('user', null)
  }
}

// Hook React pour le monitoring
export function useMonitoring() {
  const captureError = (error: Error, context?: Record<string, any>) => {
    MonitoringService.captureError(error, context)
  }

  const captureMessage = (message: string, level?: Sentry.SeverityLevel, context?: Record<string, any>) => {
    MonitoringService.captureMessage(message, level, context)
  }

  const captureUsage = (action: string, metadata?: Record<string, any>) => {
    MonitoringService.captureUsageMetric('current-user', action, metadata)
  }

  return {
    captureError,
    captureMessage,
    captureUsage,
  }
}

// Configuration des métriques personnalisées
export const Metrics = {
  // Métriques de performance
  CODE_GENERATION_TIME: 'code_generation_time',
  API_RESPONSE_TIME: 'api_response_time',
  PAGE_LOAD_TIME: 'page_load_time',
  
  // Métriques d'utilisation
  USER_REGISTRATION: 'user_registration',
  PROJECT_CREATION: 'project_creation',
  TEMPLATE_USAGE: 'template_usage',
  COLLABORATION_SESSION: 'collaboration_session',
  
  // Métriques d'erreur
  API_ERROR_RATE: 'api_error_rate',
  AI_ERROR_RATE: 'ai_error_rate',
  COLLABORATION_ERROR_RATE: 'collaboration_error_rate',
}

export default {
  initSentry,
  MonitoringService,
  useMonitoring,
  Metrics,
}
