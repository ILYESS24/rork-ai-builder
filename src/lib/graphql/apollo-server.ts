import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { schema } from './schema'
import { auth } from '@clerk/nextjs'
import { prisma } from '@/lib/database'
import { MonitoringService } from '@/lib/monitoring/sentry-config'

// Configuration Apollo Server
const server = new ApolloServer({
  schema,
  introspection: process.env.NODE_ENV !== 'production',
  plugins: [
    // Plugin de logging
    {
      requestDidStart() {
        return {
          didResolveOperation({ request, operationName }) {
            console.log(`GraphQL Operation: ${operationName || 'Anonymous'}`)
          },
          didEncounterErrors({ request, errors }) {
            console.error('GraphQL Errors:', errors)
            errors.forEach(error => {
              MonitoringService.captureError(error, {
                component: 'GraphQL',
                operation: request.operationName,
                query: request.query?.substring(0, 200),
              })
            })
          },
        }
      },
    },
    // Plugin de métriques
    {
      requestDidStart() {
        const startTime = Date.now()
        
        return {
          willSendResponse({ request, response }) {
            const duration = Date.now() - startTime
            
            MonitoringService.captureUsageMetric(
              'graphql',
              'operation_completed',
              {
                operation: request.operationName,
                duration,
                hasErrors: response.body.kind === 'single' && 
                  response.body.singleResult.errors?.length > 0,
              }
            )
          },
        }
      },
    },
  ],
  formatError: (error) => {
    // Masquer les erreurs sensibles en production
    if (process.env.NODE_ENV === 'production') {
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
      }
    }
    return error
  },
})

// Context pour GraphQL
export interface GraphQLContext {
  user: {
    id: string
    email: string
    plan: string
  } | null
  prisma: typeof prisma
  monitoring: typeof MonitoringService
}

// Handler Apollo Server pour Next.js
const handler = startServerAndCreateNextHandler(server, {
  context: async (req): Promise<GraphQLContext> => {
    try {
      // Authentification avec Clerk
      const { userId } = auth()
      
      if (!userId) {
        return {
          user: null,
          prisma,
          monitoring: MonitoringService,
        }
      }

      // Récupérer les informations utilisateur
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: {
          id: true,
          email: true,
          plan: true,
        },
      })

      if (!user) {
        return {
          user: null,
          prisma,
          monitoring: MonitoringService,
        }
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          plan: user.plan,
        },
        prisma,
        monitoring: MonitoringService,
      }
    } catch (error) {
      console.error('Erreur contexte GraphQL:', error)
      MonitoringService.captureError(error as Error, {
        component: 'GraphQL',
        action: 'context_creation',
      })
      
      return {
        user: null,
        prisma,
        monitoring: MonitoringService,
      }
    }
  },
})

export { handler as GET, handler as POST }

// Utilitaires GraphQL
export class GraphQLUtils {
  // Valider les permissions utilisateur
  static async validateUserPermission(
    context: GraphQLContext,
    requiredPermission: string
  ): Promise<boolean> {
    if (!context.user) {
      return false
    }

    // Logique de validation des permissions
    // TODO: Implémenter avec un système de rôles/permissions
    return true
  }

  // Obtenir les limites d'utilisation
  static async getUserLimits(
    context: GraphQLContext
  ): Promise<{
    projects: number
    generations: number
    storage: number
  }> {
    if (!context.user) {
      return { projects: 0, generations: 0, storage: 0 }
    }

    const user = await context.prisma.user.findUnique({
      where: { id: context.user.id },
      select: {
        plan: true,
        projectsCount: true,
        generationsUsed: true,
        storageUsed: true,
      },
    })

    if (!user) {
      return { projects: 0, generations: 0, storage: 0 }
    }

    // Définir les limites selon le plan
    const planLimits = {
      FREE: { projects: 5, generations: 50, storage: 100 * 1024 * 1024 }, // 100MB
      PRO: { projects: -1, generations: 1000, storage: 10 * 1024 * 1024 * 1024 }, // 10GB
      ENTERPRISE: { projects: -1, generations: -1, storage: 100 * 1024 * 1024 * 1024 }, // 100GB
    }

    const limits = planLimits[user.plan as keyof typeof planLimits] || planLimits.FREE

    return {
      projects: limits.projects === -1 ? -1 : limits.projects - user.projectsCount,
      generations: limits.generations === -1 ? -1 : limits.generations - user.generationsUsed,
      storage: limits.storage === -1 ? -1 : limits.storage - Number(user.storageUsed),
    }
  }

  // Vérifier si l'utilisateur peut effectuer une action
  static async canPerformAction(
    context: GraphQLContext,
    action: 'create_project' | 'generate_code' | 'upload_file'
  ): Promise<boolean> {
    const limits = await this.getUserLimits(context)

    switch (action) {
      case 'create_project':
        return limits.projects !== 0 // 0 ou négatif = limite atteinte
      case 'generate_code':
        return limits.generations !== 0
      case 'upload_file':
        return limits.storage > 0
      default:
        return false
    }
  }

  // Logger une action utilisateur
  static async logUserAction(
    context: GraphQLContext,
    action: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    if (!context.user) return

    try {
      await context.prisma.usageLog.create({
        data: {
          userId: context.user.id,
          action,
          metadata,
        },
      })

      context.monitoring.captureUsageMetric(context.user.id, action, metadata)
    } catch (error) {
      console.error('Erreur logging action:', error)
    }
  }

  // Obtenir les statistiques utilisateur
  static async getUserStats(
    context: GraphQLContext
  ): Promise<{
    projectsCount: number
    generationsCount: number
    templatesCount: number
    collaborationsCount: number
  }> {
    if (!context.user) {
      return {
        projectsCount: 0,
        generationsCount: 0,
        templatesCount: 0,
        collaborationsCount: 0,
      }
    }

    const [projectsCount, generationsCount, templatesCount, collaborationsCount] = await Promise.all([
      context.prisma.project.count({
        where: { userId: context.user.id },
      }),
      context.prisma.aIGeneration.count({
        where: { userId: context.user.id },
      }),
      context.prisma.template.count({
        where: { userId: context.user.id },
      }),
      context.prisma.collaboration.count({
        where: { userId: context.user.id },
      }),
    ])

    return {
      projectsCount,
      generationsCount,
      templatesCount,
      collaborationsCount,
    }
  }
}

// Directives GraphQL personnalisées
export const directiveResolvers = {
  // Directive @auth pour protéger les résolveurs
  auth: (next: any, source: any, args: any, context: GraphQLContext) => {
    if (!context.user) {
      throw new Error('Authentification requise')
    }
    return next()
  },

  // Directive @rateLimit pour limiter les requêtes
  rateLimit: (next: any, source: any, args: any, context: GraphQLContext, info: any) => {
    // TODO: Implémenter la limitation de débit
    return next()
  },

  // Directive @cache pour mettre en cache les résultats
  cache: (next: any, source: any, args: any, context: GraphQLContext, info: any) => {
    // TODO: Implémenter la mise en cache
    return next()
  },
}

export default server
