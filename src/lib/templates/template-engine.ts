import { PromptTemplate } from '@langchain/core/prompts'
import { RunnableSequence } from '@langchain/core/runnables'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'
import { generateAdvancedCode } from '@/lib/ai/advanced-ai'

export interface TemplateConfig {
  id: string
  name: string
  description: string
  category: 'landing' | 'dashboard' | 'portfolio' | 'ecommerce' | 'blog' | 'saas' | 'corporate' | 'creative'
  industry?: string
  targetAudience?: string
  features: string[]
  frameworks: string[]
  styles: string[]
  complexity: 'simple' | 'intermediate' | 'advanced'
  previewImage?: string
  tags: string[]
  isPremium: boolean
  price?: number
}

export interface TemplateCustomization {
  colors?: {
    primary: string
    secondary: string
    accent: string
    background: string
    text: string
  }
  fonts?: {
    heading: string
    body: string
  }
  layout?: 'modern' | 'classic' | 'minimal' | 'creative'
  animations?: boolean
  darkMode?: boolean
  responsive?: boolean
  seo?: boolean
  analytics?: boolean
}

// Templates prédéfinis avec configurations avancées
export const TEMPLATE_LIBRARY: TemplateConfig[] = [
  {
    id: 'modern-landing',
    name: 'Landing Page Moderne',
    description: 'Page d\'accueil moderne avec hero section, fonctionnalités et témoignages',
    category: 'landing',
    industry: 'tech',
    targetAudience: 'startups',
    features: ['hero', 'features', 'testimonials', 'cta', 'footer'],
    frameworks: ['html', 'react', 'nextjs'],
    styles: ['tailwind', 'css'],
    complexity: 'intermediate',
    tags: ['modern', 'responsive', 'seo', 'analytics'],
    isPremium: false,
  },
  {
    id: 'ecommerce-dashboard',
    name: 'Dashboard E-commerce',
    description: 'Tableau de bord complet pour la gestion d\'un magasin en ligne',
    category: 'ecommerce',
    industry: 'retail',
    targetAudience: 'business',
    features: ['analytics', 'orders', 'products', 'customers', 'reports'],
    frameworks: ['react', 'nextjs', 'vue'],
    styles: ['tailwind', 'styled-components'],
    complexity: 'advanced',
    tags: ['dashboard', 'analytics', 'charts', 'tables'],
    isPremium: true,
    price: 99,
  },
  {
    id: 'portfolio-creative',
    name: 'Portfolio Créatif',
    description: 'Portfolio moderne pour créatifs avec galerie et animations',
    category: 'portfolio',
    industry: 'creative',
    targetAudience: 'designers',
    features: ['gallery', 'about', 'contact', 'animations', 'parallax'],
    frameworks: ['html', 'react', 'vue'],
    styles: ['css', 'emotion'],
    complexity: 'intermediate',
    tags: ['creative', 'animations', 'gallery', 'parallax'],
    isPremium: false,
  },
  {
    id: 'saas-platform',
    name: 'Plateforme SaaS',
    description: 'Interface complète pour une application SaaS avec authentification',
    category: 'saas',
    industry: 'software',
    targetAudience: 'enterprise',
    features: ['auth', 'dashboard', 'settings', 'billing', 'api'],
    frameworks: ['nextjs', 'react'],
    styles: ['tailwind'],
    complexity: 'advanced',
    tags: ['saas', 'auth', 'billing', 'api', 'enterprise'],
    isPremium: true,
    price: 199,
  },
  {
    id: 'corporate-website',
    name: 'Site Corporate',
    description: 'Site web professionnel pour entreprises avec pages multiples',
    category: 'corporate',
    industry: 'business',
    targetAudience: 'enterprise',
    features: ['home', 'about', 'services', 'team', 'contact', 'blog'],
    frameworks: ['html', 'nextjs'],
    styles: ['tailwind', 'css'],
    complexity: 'intermediate',
    tags: ['corporate', 'professional', 'multi-page', 'seo'],
    isPremium: false,
  },
]

// Template Engine avec LangChain
export class TemplateEngine {
  private openaiLLM: ChatOpenAI
  private anthropicLLM: ChatAnthropic

  constructor() {
    this.openaiLLM = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o',
      temperature: 0.7,
    })

    this.anthropicLLM = new ChatAnthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      modelName: 'claude-3-5-sonnet-20240620',
      temperature: 0.7,
    })
  }

  // Générer un template personnalisé
  async generateCustomTemplate(
    config: TemplateConfig,
    customization: TemplateCustomization = {},
    provider: 'openai' | 'anthropic' = 'openai'
  ): Promise<{ code: string; metadata: any; preview: string }> {
    const llm = provider === 'openai' ? this.openaiLLM : this.anthropicLLM

    // Template de prompt pour la génération
    const templatePrompt = PromptTemplate.fromTemplate(`
Tu es un expert développeur web avec 15+ ans d'expérience.

CONFIGURATION DU TEMPLATE:
- Nom: {name}
- Description: {description}
- Catégorie: {category}
- Industrie: {industry}
- Audience cible: {targetAudience}
- Fonctionnalités: {features}
- Complexité: {complexity}

PERSONNALISATION:
- Couleurs: {colors}
- Polices: {fonts}
- Layout: {layout}
- Animations: {animations}
- Mode sombre: {darkMode}
- Responsive: {responsive}
- SEO: {seo}
- Analytics: {analytics}

RÈGLES STRICTES:
1. Génère du code HTML/CSS/JS moderne et professionnel
2. Utilise les meilleures pratiques de développement
3. Code responsive et accessible
4. Optimisé pour les performances
5. Structure sémantique HTML5
6. CSS moderne avec variables CSS
7. JavaScript vanilla ou framework moderne
8. Animations fluides si demandées
9. Intégration SEO si activée
10. Analytics Google/Tracking si activé

Génère le code complet pour ce template:
`)

    const prompt = await templatePrompt.format({
      name: config.name,
      description: config.description,
      category: config.category,
      industry: config.industry || 'général',
      targetAudience: config.targetAudience || 'professionnels',
      features: config.features.join(', '),
      complexity: config.complexity,
      colors: JSON.stringify(customization.colors || {}),
      fonts: JSON.stringify(customization.fonts || {}),
      layout: customization.layout || 'modern',
      animations: customization.animations ? 'oui' : 'non',
      darkMode: customization.darkMode ? 'oui' : 'non',
      responsive: customization.responsive ? 'oui' : 'non',
      seo: customization.seo ? 'oui' : 'non',
      analytics: customization.analytics ? 'oui' : 'non',
    })

    const chain = RunnableSequence.from([
      llm,
      new StringOutputParser(),
    ])

    const response = await chain.invoke([prompt])

    // Générer un aperçu du template
    const preview = await this.generateTemplatePreview(config, customization)

    return {
      code: response,
      metadata: {
        templateId: config.id,
        category: config.category,
        complexity: config.complexity,
        features: config.features,
        customization,
        generatedAt: new Date().toISOString(),
      },
      preview,
    }
  }

  // Générer un aperçu de template
  private async generateTemplatePreview(
    config: TemplateConfig,
    customization: TemplateCustomization
  ): Promise<string> {
    const previewPrompt = `
Décris ce template en 2-3 phrases accrocheuses:

TEMPLATE: ${config.name}
CATÉGORIE: ${config.category}
INDUSTRIE: ${config.industry}
AUDIENCE: ${config.targetAudience}
FONCTIONNALITÉS: ${config.features.join(', ')}
PERSONNALISATION: ${JSON.stringify(customization)}

Focus sur:
- L'utilisation principale
- Le style et l'apparence
- Les fonctionnalités clés
- Les avantages pour l'utilisateur

Réponds en français, de manière engageante et professionnelle.
`

    const response = await this.openaiLLM.invoke([previewPrompt])
    return response.content as string
  }

  // Générer des variantes d'un template
  async generateTemplateVariants(
    baseConfig: TemplateConfig,
    variants: TemplateCustomization[]
  ): Promise<Array<{ code: string; metadata: any; preview: string }>> {
    const results = []

    for (const variant of variants) {
      const result = await this.generateCustomTemplate(baseConfig, variant)
      results.push(result)
    }

    return results
  }

  // Optimiser un template existant
  async optimizeTemplate(
    existingCode: string,
    optimizationGoals: string[]
  ): Promise<{ code: string; improvements: string[] }> {
    const optimizationPrompt = `
Analyse et optimise ce code HTML/CSS/JS:

CODE EXISTANT:
${existingCode.substring(0, 2000)}...

OBJECTIFS D'OPTIMISATION:
${optimizationGoals.join(', ')}

Améliore le code en:
1. Performance (chargement, rendu)
2. Accessibilité (WCAG 2.1)
3. SEO (balises, structure)
4. Responsive design
5. Code quality (maintenabilité)
6. Sécurité (XSS, CSRF)

Retourne le code optimisé et une liste des améliorations apportées.
`

    const response = await this.openaiLLM.invoke([optimizationPrompt])
    
    // Extraire les améliorations (simulation)
    const improvements = [
      'Optimisation des performances de chargement',
      'Amélioration de l\'accessibilité',
      'Optimisation SEO',
      'Amélioration du responsive design',
    ]

    return {
      code: response.content as string,
      improvements,
    }
  }

  // Générer des templates basés sur l'industrie
  async generateIndustryTemplates(industry: string): Promise<TemplateConfig[]> {
    const industryTemplates = TEMPLATE_LIBRARY.filter(
      template => template.industry === industry
    )

    if (industryTemplates.length > 0) {
      return industryTemplates
    }

    // Générer de nouveaux templates pour l'industrie
    const industryPrompt = `
Crée 3 templates spécifiques pour l'industrie: ${industry}

Pour chaque template, fournis:
- Un nom accrocheur
- Une description détaillée
- Les fonctionnalités essentielles
- Le niveau de complexité
- Les tags pertinents

Format de réponse: JSON avec un array de templates.
`

    const response = await this.openaiLLM.invoke([industryPrompt])
    
    // Parser la réponse et créer les configurations
    try {
      const generatedTemplates = JSON.parse(response.content as string)
      return generatedTemplates.map((template: any, index: number) => ({
        id: `custom-${industry}-${index}`,
        name: template.name,
        description: template.description,
        category: 'landing' as const,
        industry,
        features: template.features || [],
        frameworks: ['html', 'react'],
        styles: ['tailwind'],
        complexity: template.complexity || 'intermediate',
        tags: template.tags || [],
        isPremium: false,
      }))
    } catch (error) {
      console.error('Erreur parsing templates industrie:', error)
      return []
    }
  }

  // Rechercher des templates
  searchTemplates(query: string, filters?: {
    category?: string
    industry?: string
    complexity?: string
    isPremium?: boolean
  }): TemplateConfig[] {
    let results = TEMPLATE_LIBRARY

    // Filtrage par catégorie
    if (filters?.category) {
      results = results.filter(template => template.category === filters.category)
    }

    // Filtrage par industrie
    if (filters?.industry) {
      results = results.filter(template => template.industry === filters.industry)
    }

    // Filtrage par complexité
    if (filters?.complexity) {
      results = results.filter(template => template.complexity === filters.complexity)
    }

    // Filtrage par premium
    if (filters?.isPremium !== undefined) {
      results = results.filter(template => template.isPremium === filters.isPremium)
    }

    // Recherche textuelle
    if (query) {
      const searchTerms = query.toLowerCase().split(' ')
      results = results.filter(template => {
        const searchText = [
          template.name,
          template.description,
          ...template.tags,
          template.category,
          template.industry || '',
          template.targetAudience || '',
        ].join(' ').toLowerCase()

        return searchTerms.some(term => searchText.includes(term))
      })
    }

    return results
  }

  // Obtenir les statistiques des templates
  getTemplateStats(): {
    total: number
    byCategory: Record<string, number>
    byIndustry: Record<string, number>
    byComplexity: Record<string, number>
    premium: number
    free: number
  } {
    const stats = {
      total: TEMPLATE_LIBRARY.length,
      byCategory: {} as Record<string, number>,
      byIndustry: {} as Record<string, number>,
      byComplexity: {} as Record<string, number>,
      premium: 0,
      free: 0,
    }

    TEMPLATE_LIBRARY.forEach(template => {
      // Par catégorie
      stats.byCategory[template.category] = (stats.byCategory[template.category] || 0) + 1

      // Par industrie
      const industry = template.industry || 'général'
      stats.byIndustry[industry] = (stats.byIndustry[industry] || 0) + 1

      // Par complexité
      stats.byComplexity[template.complexity] = (stats.byComplexity[template.complexity] || 0) + 1

      // Premium vs Free
      if (template.isPremium) {
        stats.premium++
      } else {
        stats.free++
      }
    })

    return stats
  }
}

// Instance globale
export const templateEngine = new TemplateEngine()

// Utilitaires
export function getTemplateById(id: string): TemplateConfig | undefined {
  return TEMPLATE_LIBRARY.find(template => template.id === id)
}

export function getTemplatesByCategory(category: string): TemplateConfig[] {
  return TEMPLATE_LIBRARY.filter(template => template.category === category)
}

export function getTemplatesByIndustry(industry: string): TemplateConfig[] {
  return TEMPLATE_LIBRARY.filter(template => template.industry === industry)
}

export default templateEngine
