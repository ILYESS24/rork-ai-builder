import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'
import { generateAdvancedCode, generateTemplate, enhanceWithRAG, streamCodeGeneration } from '@/lib/ai/advanced-ai'
import { checkUserLimits, incrementUsage } from '@/lib/payments/stripe-service'
import { MonitoringService } from '@/lib/monitoring/sentry-config'
import { prisma } from '@/lib/database'
import { z } from 'zod'

// Schéma de validation pour la génération avancée
const AdvancedGenerationSchema = z.object({
  prompt: z.string().min(10, 'Le prompt doit contenir au moins 10 caractères'),
  provider: z.enum(['openai', 'anthropic', 'langchain-openai', 'langchain-anthropic']).default('openai'),
  framework: z.enum(['html', 'react', 'vue', 'nextjs', 'svelte']).default('html'),
  style: z.enum(['tailwind', 'css', 'styled-components', 'emotion']).default('tailwind'),
  complexity: z.enum(['simple', 'intermediate', 'advanced']).default('intermediate'),
  features: z.array(z.string()).default([]),
  responsive: z.boolean().default(true),
  accessibility: z.boolean().default(true),
  seo: z.boolean().default(false),
  performance: z.boolean().default(true),
  useRAG: z.boolean().default(false),
  saveProject: z.boolean().default(true),
  templateType: z.enum(['landing', 'dashboard', 'portfolio', 'ecommerce', 'blog', 'saas']).optional(),
  templateContext: z.object({
    industry: z.string().optional(),
    targetAudience: z.string().optional(),
    branding: z.object({
      colors: z.array(z.string()).optional(),
      fonts: z.array(z.string()).optional(),
      style: z.string().optional(),
    }).optional(),
  }).optional(),
})

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Authentification
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    // Validation des données
    const body = await request.json()
    const validatedData = AdvancedGenerationSchema.parse(body)

    // Vérifier les limites d'utilisation
    const canGenerate = await checkUserLimits(userId, 'generation')
    if (!canGenerate) {
      return NextResponse.json(
        { error: 'Limite de générations atteinte. Veuillez upgrader votre plan.' },
        { status: 429 }
      )
    }

    // Capturer les métriques de début
    MonitoringService.captureUsageMetric(userId, 'code_generation_started', {
      provider: validatedData.provider,
      framework: validatedData.framework,
      complexity: validatedData.complexity,
      promptLength: validatedData.prompt.length,
    })

    let result: any

    // Génération basée sur le type
    if (validatedData.templateType) {
      // Génération de template
      result = await generateTemplate(
        {
          type: validatedData.templateType,
          industry: validatedData.templateContext?.industry,
          targetAudience: validatedData.templateContext?.targetAudience,
          branding: validatedData.templateContext?.branding,
        },
        {
          provider: validatedData.provider,
          framework: validatedData.framework,
          style: validatedData.style,
          complexity: validatedData.complexity,
          features: validatedData.features,
          responsive: validatedData.responsive,
          accessibility: validatedData.accessibility,
          seo: validatedData.seo,
          performance: validatedData.performance,
        }
      )
    } else {
      // Génération de code personnalisée
      result = await generateAdvancedCode(
        validatedData.prompt,
        {
          provider: validatedData.provider,
          framework: validatedData.framework,
          style: validatedData.style,
          complexity: validatedData.complexity,
          features: validatedData.features,
          responsive: validatedData.responsive,
          accessibility: validatedData.accessibility,
          seo: validatedData.seo,
          performance: validatedData.performance,
        }
      )
    }

    // Amélioration avec RAG si demandée
    if (validatedData.useRAG) {
      result.code = await enhanceWithRAG(
        validatedData.prompt,
        result.code,
        {
          provider: validatedData.provider,
          framework: validatedData.framework,
          style: validatedData.style,
          complexity: validatedData.complexity,
          features: validatedData.features,
          responsive: validatedData.responsive,
          accessibility: validatedData.accessibility,
          seo: validatedData.seo,
          performance: validatedData.performance,
        }
      )
    }

    // Sauvegarder le projet si demandé
    let projectId = null
    if (validatedData.saveProject) {
      try {
        const project = await prisma.project.create({
          data: {
            userId,
            name: validatedData.templateType 
              ? `Template ${validatedData.templateType}` 
              : 'Projet généré par IA',
            description: validatedData.prompt.substring(0, 200),
            code: result.code,
            framework: validatedData.framework.toUpperCase() as any,
            language: validatedData.framework,
            features: validatedData.features,
            tags: validatedData.templateType ? [validatedData.templateType] : [],
            isPublic: false,
          },
        })
        projectId = project.id

        // Créer la première version
        await prisma.projectVersion.create({
          data: {
            projectId: project.id,
            versionNumber: 1,
            code: result.code,
            changes: 'Version générée par IA',
          },
        })

        // Créer une collaboration pour l'utilisateur (propriétaire)
        await prisma.collaboration.create({
          data: {
            projectId: project.id,
            userId,
            role: 'OWNER',
          },
        })
      } catch (dbError) {
        MonitoringService.captureDatabaseError('create_project', 'projects', dbError)
        console.error('Erreur sauvegarde projet:', dbError)
      }
    }

    // Sauvegarder la génération IA
    try {
      await prisma.aIGeneration.create({
        data: {
          userId,
          prompt: validatedData.prompt,
          code: result.code,
          provider: validatedData.provider,
          model: result.metadata?.model || 'unknown',
          metadata: result.metadata,
          suggestions: result.suggestions || [],
        },
      })
    } catch (dbError) {
      MonitoringService.captureDatabaseError('create_ai_generation', 'ai_generations', dbError)
      console.error('Erreur sauvegarde génération IA:', dbError)
    }

    // Incrémenter l'utilisation
    await incrementUsage(userId, 'generation')

    // Calculer le temps de génération
    const generationTime = Date.now() - startTime

    // Capturer les métriques de performance
    MonitoringService.captureCodeGenerationMetrics(
      validatedData.provider,
      result.metadata?.model || 'unknown',
      validatedData.prompt.length,
      result.code.length,
      generationTime,
      true
    )

    // Capturer les métriques d'utilisation
    MonitoringService.captureUsageMetric(userId, 'code_generation_completed', {
      provider: validatedData.provider,
      framework: validatedData.framework,
      complexity: validatedData.complexity,
      generationTime,
      codeLength: result.code.length,
      projectId,
    })

    // Réponse avec toutes les données
    return NextResponse.json({
      success: true,
      data: {
        code: result.code,
        metadata: result.metadata,
        suggestions: result.suggestions || [],
        preview: result.preview,
        projectId,
        generationTime,
        usage: {
          promptLength: validatedData.prompt.length,
          codeLength: result.code.length,
          provider: validatedData.provider,
          model: result.metadata?.model,
        },
      },
    })

  } catch (error) {
    const generationTime = Date.now() - startTime

    // Capturer l'erreur
    if (error instanceof z.ZodError) {
      MonitoringService.captureMessage('Validation error in code generation', 'warning', {
        errors: error.errors,
        userId,
      })
      
      return NextResponse.json(
        { 
          error: 'Données invalides', 
          details: error.errors 
        },
        { status: 400 }
      )
    }

    // Capturer les erreurs d'IA
    MonitoringService.captureAIError(
      'unknown',
      'unknown',
      'Error in generation',
      error
    )

    // Capturer les métriques d'erreur
    MonitoringService.captureCodeGenerationMetrics(
      'unknown',
      'unknown',
      0,
      0,
      generationTime,
      false
    )

    console.error('Erreur génération avancée:', error)

    return NextResponse.json(
      { 
        error: 'Erreur lors de la génération du code',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

// Endpoint pour le streaming
export async function GET(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return new Response('Non authentifié', { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const prompt = searchParams.get('prompt')
    const provider = searchParams.get('provider') as any || 'openai'

    if (!prompt) {
      return new Response('Prompt requis', { status: 400 })
    }

    // Vérifier les limites
    const canGenerate = await checkUserLimits(userId, 'generation')
    if (!canGenerate) {
      return new Response('Limite de générations atteinte', { status: 429 })
    }

    // Créer un stream de réponse
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Capturer le début de la génération
          MonitoringService.captureUsageMetric(userId, 'streaming_generation_started', {
            provider,
            promptLength: prompt.length,
          })

          let generatedCode = ''

          // Stream de génération
          for await (const chunk of streamCodeGeneration(prompt, { provider })) {
            generatedCode += chunk
            
            // Envoyer le chunk au client
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ chunk })}\n\n`))
          }

          // Sauvegarder la génération complète
          try {
            await prisma.aIGeneration.create({
              data: {
                userId,
                prompt,
                code: generatedCode,
                provider,
                model: 'gpt-4o', // TODO: Récupérer le vrai modèle
                metadata: { streaming: true },
                suggestions: [],
              },
            })

            await incrementUsage(userId, 'generation')
          } catch (dbError) {
            MonitoringService.captureDatabaseError('create_streaming_generation', 'ai_generations', dbError)
          }

          // Capturer la fin de la génération
          MonitoringService.captureUsageMetric(userId, 'streaming_generation_completed', {
            provider,
            codeLength: generatedCode.length,
          })

          // Envoyer la fin du stream
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ done: true, code: generatedCode })}\n\n`))
          controller.close()

        } catch (error) {
          MonitoringService.captureAIError(provider, 'streaming', prompt, error)
          
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur inconnue' })}\n\n`)
          )
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    MonitoringService.captureError(error as Error, { endpoint: 'generate-advanced-streaming' })
    
    return new Response('Erreur serveur', { status: 500 })
  }
}
