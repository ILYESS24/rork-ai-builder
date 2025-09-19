import { NextRequest, NextResponse } from 'next/server'
import { generateCodeWithAI, generateTemplate } from '@/lib/ai-providers'
import { createProject } from '@/lib/database'
import { requireAuth } from '@/lib/auth'
import { createFullHTML, validateCode, extractCodeMetadata } from '@/lib/code-execution'
import { z } from 'zod'

const GenerateRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt requis'),
  provider: z.enum(['openai', 'anthropic']).optional().default('openai'),
  model: z.string().optional(),
  template: z.enum(['landing', 'dashboard', 'portfolio', 'ecommerce', 'blog']).optional(),
  customizations: z.string().optional(),
  saveProject: z.boolean().optional().default(true),
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const { prompt, provider, model, template, customizations, saveProject } = GenerateRequestSchema.parse(body)

    // Générer le code avec l'IA
    let generatedCode
    if (template) {
      generatedCode = await generateTemplate(template, customizations, provider)
    } else {
      generatedCode = await generateCodeWithAI(prompt, provider, model)
    }

    // Valider le code généré
    const htmlValidation = validateCode(generatedCode.html, 'html')
    const cssValidation = validateCode(generatedCode.css || '', 'css')
    const jsValidation = validateCode(generatedCode.javascript || '', 'javascript')

    if (!htmlValidation.isValid) {
      return NextResponse.json({
        error: 'Code HTML invalide',
        details: htmlValidation.errors
      }, { status: 400 })
    }

    // Créer le HTML complet
    const fullHTML = createFullHTML({
      html: generatedCode.html,
      css: generatedCode.css,
      javascript: generatedCode.javascript,
      framework: generatedCode.framework as any,
      dependencies: generatedCode.dependencies,
    })

    // Extraire les métadonnées
    const metadata = extractCodeMetadata({
      html: generatedCode.html,
      css: generatedCode.css,
      javascript: generatedCode.javascript,
      framework: generatedCode.framework as any,
      dependencies: generatedCode.dependencies,
    })

    // Sauvegarder le projet si demandé
    let projectId = null
    if (saveProject) {
      const project = await createProject({
        user_id: user.id,
        name: metadata.title,
        description: metadata.description,
        code: fullHTML,
        framework: generatedCode.framework,
      })
      projectId = project.id
    }

    return NextResponse.json({
      success: true,
      code: fullHTML,
      metadata: {
        ...metadata,
        framework: generatedCode.framework,
        dependencies: generatedCode.dependencies,
        validation: {
          html: htmlValidation,
          css: cssValidation,
          javascript: jsValidation,
        },
      },
      projectId,
    })

  } catch (error) {
    console.error('Error generating code:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Données invalides',
        details: error.errors
      }, { status: 400 })
    }

    return NextResponse.json({
      error: 'Erreur lors de la génération',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

// Endpoint pour améliorer le code existant
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { code, feedback, provider } = await request.json()

    if (!code || !feedback) {
      return NextResponse.json({
        error: 'Code et feedback requis'
      }, { status: 400 })
    }

    // Analyser et améliorer le code
    const improvedCode = await analyzeAndImproveCode(code, feedback, provider)

    // Créer le HTML complet
    const fullHTML = createFullHTML({
      html: improvedCode.html,
      css: improvedCode.css,
      javascript: improvedCode.javascript,
      framework: improvedCode.framework as any,
      dependencies: improvedCode.dependencies,
    })

    return NextResponse.json({
      success: true,
      code: fullHTML,
      metadata: extractCodeMetadata({
        html: improvedCode.html,
        css: improvedCode.css,
        javascript: improvedCode.javascript,
        framework: improvedCode.framework as any,
        dependencies: improvedCode.dependencies,
      }),
    })

  } catch (error) {
    console.error('Error improving code:', error)
    return NextResponse.json({
      error: 'Erreur lors de l\'amélioration du code'
    }, { status: 500 })
  }
}
