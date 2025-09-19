import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import { generateText, generateObject } from 'ai'
import { z } from 'zod'

// Configuration des clients
const openaiClient = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Schema pour la génération de code
const CodeGenerationSchema = z.object({
  html: z.string().describe('Code HTML complet'),
  css: z.string().describe('Code CSS pour le styling'),
  javascript: z.string().optional().describe('Code JavaScript pour les interactions'),
  framework: z.string().describe('Framework utilisé (React, Vue, Vanilla, etc.)'),
  dependencies: z.array(z.string()).optional().describe('Dépendances nécessaires'),
  description: z.string().describe('Description de ce qui a été généré')
})

export type CodeGeneration = z.infer<typeof CodeGenerationSchema>

// Fonction principale de génération de code
export async function generateCodeWithAI(
  prompt: string, 
  provider: 'openai' | 'anthropic' = 'openai',
  model?: string
): Promise<CodeGeneration> {
  try {
    const systemPrompt = `Tu es un développeur web expert qui crée des applications web modernes et fonctionnelles.
    
    Instructions importantes :
    - Génère toujours du code complet et fonctionnel
    - Utilise des frameworks modernes (React, Vue, ou HTML/CSS/JS vanilla)
    - Assure-toi que le design est responsive et moderne
    - Inclus des interactions JavaScript si nécessaire
    - Utilise Tailwind CSS pour le styling
    - Le code doit être prêt à être utilisé directement
    
    Format de réponse : Génère un objet JSON avec les champs html, css, javascript, framework, dependencies et description.`

    const result = await generateObject({
      model: provider === 'openai' 
        ? openai(model || 'gpt-4o')
        : anthropic(model || 'claude-3-5-sonnet-20241022'),
      schema: CodeGenerationSchema,
      system: systemPrompt,
      prompt: prompt,
    })

    return result.object
  } catch (error) {
    console.error(`Error generating code with ${provider}:`, error)
    
    // Fallback simple
    return {
      html: `<div class="min-h-screen bg-gray-100 flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-lg">
          <h1 class="text-2xl font-bold text-gray-800 mb-4">Application Générée</h1>
          <p class="text-gray-600">Une erreur s'est produite lors de la génération. Veuillez réessayer.</p>
        </div>
      </div>`,
      css: '',
      javascript: '',
      framework: 'vanilla',
      description: 'Code de fallback généré en cas d\'erreur'
    }
  }
}

// Fonction pour générer du code avec streaming
export async function generateCodeStream(
  prompt: string,
  provider: 'openai' | 'anthropic' = 'openai'
) {
  const systemPrompt = `Tu es un développeur web expert. Génère du code HTML/CSS/JS complet et moderne.`
  
  return generateText({
    model: provider === 'openai' 
      ? openai('gpt-4o')
      : anthropic('claude-3-5-sonnet-20241022'),
    system: systemPrompt,
    prompt: prompt,
  })
}

// Fonction pour analyser et améliorer le code existant
export async function analyzeAndImproveCode(
  code: string,
  feedback: string,
  provider: 'openai' | 'anthropic' = 'openai'
): Promise<CodeGeneration> {
  const prompt = `Voici le code existant :
  
  ${code}
  
  Feedback de l'utilisateur : ${feedback}
  
  Améliore ce code en tenant compte du feedback.`
  
  return generateCodeWithAI(prompt, provider)
}

// Fonction pour générer des templates prédéfinis
export async function generateTemplate(
  templateType: 'landing' | 'dashboard' | 'portfolio' | 'ecommerce' | 'blog',
  customizations?: string,
  provider: 'openai' | 'anthropic' = 'openai'
): Promise<CodeGeneration> {
  const templates = {
    landing: 'Crée une landing page moderne pour une startup tech avec header, hero section, features, testimonials et footer',
    dashboard: 'Crée un dashboard admin moderne avec sidebar, navigation, tableaux de données et graphiques',
    portfolio: 'Crée un portfolio personnel élégant avec sections about, projets, compétences et contact',
    ecommerce: 'Crée une boutique en ligne avec catalogue produits, panier, checkout et pages produit',
    blog: 'Crée un blog moderne avec liste d\'articles, article individuel, sidebar et navigation'
  }

  const basePrompt = templates[templateType]
  const fullPrompt = customizations ? `${basePrompt}. Personnalisations : ${customizations}` : basePrompt

  return generateCodeWithAI(fullPrompt, provider)
}
