import OpenAI from 'openai'
import { Anthropic } from '@anthropic-ai/sdk'
import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages'
import { RunnableSequence } from '@langchain/core/runnables'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { PromptTemplate } from '@langchain/core/prompts'
import { VectorStoreRetriever } from '@langchain/core/vectorstores'
import { PineconeClient } from '@pinecone-database/pinecone'
import { OpenAIEmbeddings } from '@langchain/openai'

// Configuration des clients IA
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const langchainOpenAI = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4o',
  temperature: 0.7,
  streaming: true,
})

const langchainAnthropic = new ChatAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  modelName: 'claude-3-5-sonnet-20240620',
  temperature: 0.7,
  streaming: true,
})

// Configuration Pinecone pour RAG
const pinecone = new PineconeClient()
const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
})

export type AIProvider = 'openai' | 'anthropic' | 'langchain-openai' | 'langchain-anthropic'

export interface CodeGenerationOptions {
  provider: AIProvider
  framework?: 'html' | 'react' | 'vue' | 'nextjs' | 'svelte'
  style?: 'tailwind' | 'css' | 'styled-components' | 'emotion'
  features?: string[]
  complexity?: 'simple' | 'intermediate' | 'advanced'
  responsive?: boolean
  accessibility?: boolean
  seo?: boolean
  performance?: boolean
}

export interface TemplateContext {
  type: 'landing' | 'dashboard' | 'portfolio' | 'ecommerce' | 'blog' | 'saas'
  industry?: string
  targetAudience?: string
  branding?: {
    colors?: string[]
    fonts?: string[]
    style?: string
  }
}

// Templates avancés avec LangChain
const CODE_GENERATION_TEMPLATE = PromptTemplate.fromTemplate(`
Tu es un expert développeur web full-stack avec 10+ ans d'expérience.

CONTEXTE:
- Framework: {framework}
- Style: {style}
- Complexité: {complexity}
- Responsive: {responsive}
- Accessibilité: {accessibility}
- SEO: {seo}
- Performance: {performance}

RÈGLES STRICTES:
1. Génère UNIQUEMENT du code HTML/CSS/JS complet et fonctionnel
2. Utilise {style} pour le styling
3. Code responsive et moderne
4. Respecte les standards d'accessibilité WCAG 2.1
5. Optimisé pour les performances
6. Structure sémantique HTML5
7. Pas de frameworks externes sauf {framework}
8. Code propre et commenté

PROMPT UTILISATEUR: {prompt}

Génère le code complet:
`)

const TEMPLATE_GENERATION_TEMPLATE = PromptTemplate.fromTemplate(`
Tu es un expert en design UX/UI et développement web.

TYPE DE TEMPLATE: {templateType}
INDUSTRIE: {industry}
AUDIENCE CIBLE: {targetAudience}
BRANDING: {branding}

Crée un template complet pour {templateType} avec:
- Design moderne et professionnel
- Structure claire et intuitive
- Optimisé pour {industry}
- Adapté à {targetAudience}
- Couleurs et style: {branding}

Génère le code HTML/CSS/JS complet:
`)

// Fonction de génération de code avancée
export async function generateAdvancedCode(
  prompt: string,
  options: CodeGenerationOptions = { provider: 'openai' }
): Promise<{ code: string; metadata: any; suggestions: string[] }> {
  try {
    const template = await CODE_GENERATION_TEMPLATE.format({
      prompt,
      framework: options.framework || 'html',
      style: options.style || 'tailwind',
      complexity: options.complexity || 'intermediate',
      responsive: options.responsive ? 'oui' : 'non',
      accessibility: options.accessibility ? 'oui' : 'non',
      seo: options.seo ? 'oui' : 'non',
      performance: options.performance ? 'oui' : 'non',
    })

    let response: string
    let metadata: any = {}

    switch (options.provider) {
      case 'openai':
        const openaiResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: template },
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        })
        response = openaiResponse.choices[0].message?.content || ''
        metadata = {
          provider: 'openai',
          model: 'gpt-4o',
          tokens: openaiResponse.usage?.total_tokens,
        }
        break

      case 'anthropic':
        const anthropicResponse = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 4000,
          messages: [
            { role: 'user', content: template + '\n\n' + prompt },
          ],
        })
        response = anthropicResponse.content[0].text || ''
        metadata = {
          provider: 'anthropic',
          model: 'claude-3-5-sonnet-20240620',
          tokens: anthropicResponse.usage?.input_tokens + anthropicResponse.usage?.output_tokens,
        }
        break

      case 'langchain-openai':
        const chain = RunnableSequence.from([
          langchainOpenAI,
          new StringOutputParser(),
        ])
        response = await chain.invoke([
          new SystemMessage(template),
          new HumanMessage(prompt),
        ])
        metadata = { provider: 'langchain-openai', model: 'gpt-4o' }
        break

      case 'langchain-anthropic':
        const anthropicChain = RunnableSequence.from([
          langchainAnthropic,
          new StringOutputParser(),
        ])
        response = await anthropicChain.invoke([
          new SystemMessage(template),
          new HumanMessage(prompt),
        ])
        metadata = { provider: 'langchain-anthropic', model: 'claude-3-5-sonnet' }
        break

      default:
        throw new Error(`Provider non supporté: ${options.provider}`)
    }

    // Générer des suggestions d'amélioration
    const suggestions = await generateImprovementSuggestions(response, options)

    return {
      code: response,
      metadata,
      suggestions,
    }
  } catch (error) {
    console.error('Erreur génération code avancée:', error)
    throw error
  }
}

// Génération de templates avec contexte
export async function generateTemplate(
  context: TemplateContext,
  options: CodeGenerationOptions = { provider: 'openai' }
): Promise<{ code: string; metadata: any; preview: string }> {
  try {
    const template = await TEMPLATE_GENERATION_TEMPLATE.format({
      templateType: context.type,
      industry: context.industry || 'général',
      targetAudience: context.targetAudience || 'professionnels',
      branding: JSON.stringify(context.branding || {}),
    })

    const result = await generateAdvancedCode(template, options)
    
    // Générer une description du template
    const preview = await generateTemplatePreview(result.code, context)

    return {
      code: result.code,
      metadata: { ...result.metadata, templateType: context.type },
      preview,
    }
  } catch (error) {
    console.error('Erreur génération template:', error)
    throw error
  }
}

// Génération de suggestions d'amélioration
async function generateImprovementSuggestions(
  code: string,
  options: CodeGenerationOptions
): Promise<string[]> {
  try {
    const improvementPrompt = `
Analyse ce code et suggère 3 améliorations spécifiques:

CODE:
${code.substring(0, 1000)}...

CONTEXTE:
- Framework: ${options.framework}
- Style: ${options.style}
- Complexité: ${options.complexity}

Suggère des améliorations pour:
1. Performance
2. Accessibilité
3. UX/UI

Réponds uniquement avec 3 suggestions concrètes et actionables.
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: improvementPrompt }],
      temperature: 0.7,
      max_tokens: 500,
    })

    return response.choices[0].message?.content?.split('\n').filter(line => line.trim()) || []
  } catch (error) {
    console.error('Erreur génération suggestions:', error)
    return []
  }
}

// Génération de preview de template
async function generateTemplatePreview(code: string, context: TemplateContext): Promise<string> {
  try {
    const previewPrompt = `
Décris ce template en 2-3 phrases:

CODE: ${code.substring(0, 500)}...
TYPE: ${context.type}
INDUSTRIE: ${context.industry}

Focus sur:
- Fonctionnalités principales
- Design et style
- Cas d'usage
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: previewPrompt }],
      temperature: 0.7,
      max_tokens: 200,
    })

    return response.choices[0].message?.content || 'Template moderne et professionnel'
  } catch (error) {
    console.error('Erreur génération preview:', error)
    return 'Template moderne et professionnel'
  }
}

// RAG avec Pinecone pour améliorer les réponses
export async function enhanceWithRAG(
  query: string,
  code: string,
  options: CodeGenerationOptions
): Promise<string> {
  try {
    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_INDEX_NAME) {
      return code // Pas de RAG disponible
    }

    // Initialiser Pinecone
    await pinecone.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT || 'us-west1-gcp',
    })

    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME)

    // Rechercher des documents similaires
    const queryEmbedding = await embeddings.embedQuery(query)
    const searchResponse = await index.query({
      vector: queryEmbedding,
      topK: 5,
      includeMetadata: true,
    })

    if (searchResponse.matches && searchResponse.matches.length > 0) {
      const context = searchResponse.matches
        .map(match => (match.metadata as any)?.content || '')
        .join('\n')

      // Améliorer le code avec le contexte RAG
      const enhancementPrompt = `
CONTEXTE DE RÉFÉRENCE:
${context}

CODE ACTUEL:
${code}

Améliore ce code en utilisant les meilleures pratiques du contexte de référence.
Garde la même structure mais améliore la qualité, performance et accessibilité.
`

      const enhancedCode = await generateAdvancedCode(enhancementPrompt, options)
      return enhancedCode.code
    }

    return code
  } catch (error) {
    console.error('Erreur RAG:', error)
    return code
  }
}

// Fonction de streaming pour les réponses en temps réel
export async function* streamCodeGeneration(
  prompt: string,
  options: CodeGenerationOptions = { provider: 'openai' }
): AsyncGenerator<string, void, unknown> {
  try {
    const template = await CODE_GENERATION_TEMPLATE.format({
      prompt,
      framework: options.framework || 'html',
      style: options.style || 'tailwind',
      complexity: options.complexity || 'intermediate',
      responsive: options.responsive ? 'oui' : 'non',
      accessibility: options.accessibility ? 'oui' : 'non',
      seo: options.seo ? 'oui' : 'non',
      performance: options.performance ? 'oui' : 'non',
    })

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: template },
        { role: 'user', content: prompt },
      ],
      stream: true,
      temperature: 0.7,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  } catch (error) {
    console.error('Erreur streaming:', error)
    throw error
  }
}

export default {
  generateAdvancedCode,
  generateTemplate,
  enhanceWithRAG,
  streamCodeGeneration,
}
