import { z } from 'zod'

// Schémas de validation pour les différentes entités

export const UserProfileSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50),
  email: z.string().email('Email invalide'),
  subscription: z.enum(['free', 'pro', 'enterprise']).default('free'),
})

export const ProjectSchema = z.object({
  name: z.string().min(1, 'Le nom du projet est requis').max(100),
  description: z.string().max(500).optional(),
  code: z.string().min(1, 'Le code est requis'),
  framework: z.enum(['react', 'vue', 'vanilla', 'nextjs', 'svelte']).default('vanilla'),
  tags: z.array(z.string()).optional(),
  isPublic: z.boolean().default(false),
})

export const CodeGenerationSchema = z.object({
  prompt: z.string().min(10, 'Le prompt doit contenir au moins 10 caractères').max(2000),
  provider: z.enum(['openai', 'anthropic']).default('openai'),
  model: z.string().optional(),
  template: z.enum(['landing', 'dashboard', 'portfolio', 'ecommerce', 'blog']).optional(),
  customizations: z.string().max(1000).optional(),
  saveProject: z.boolean().default(true),
})

export const PaymentSchema = z.object({
  priceId: z.string().min(1, 'Price ID requis'),
  successUrl: z.string().url('URL de succès invalide'),
  cancelUrl: z.string().url('URL d\'annulation invalide'),
})

export const FeedbackSchema = z.object({
  code: z.string().min(1, 'Code requis'),
  feedback: z.string().min(10, 'Feedback requis').max(1000),
  provider: z.enum(['openai', 'anthropic']).default('openai'),
})

// Fonctions de validation utilitaires
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateCodeLength(code: string, maxLength: number = 100000): boolean {
  return code.length <= maxLength
}

export function validateFramework(framework: string): boolean {
  const validFrameworks = ['react', 'vue', 'vanilla', 'nextjs', 'svelte']
  return validFrameworks.includes(framework)
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

export function validateHTML(html: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Vérifications de base
  if (!html.includes('<html') && !html.includes('<div') && !html.includes('<body')) {
    errors.push('Le code HTML semble incomplet')
  }
  
  // Vérifier les balises non fermées
  const openTags = html.match(/<[^/][^>]*>/g) || []
  const closeTags = html.match(/<\/[^>]*>/g) || []
  
  if (openTags.length !== closeTags.length) {
    errors.push('Certaines balises HTML ne sont pas fermées')
  }
  
  // Vérifier les scripts dangereux
  if (html.includes('<script') && !html.includes('</script>')) {
    errors.push('Script JavaScript mal fermé')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateCSS(css: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!css) return { isValid: true, errors }
  
  // Vérifications de base
  const openBraces = (css.match(/\{/g) || []).length
  const closeBraces = (css.match(/\}/g) || []).length
  
  if (openBraces !== closeBraces) {
    errors.push('Les accolades CSS ne sont pas équilibrées')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateJavaScript(js: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!js) return { isValid: true, errors }
  
  try {
    // Vérification syntaxique basique
    new Function(js)
  } catch (e) {
    errors.push(`Erreur JavaScript: ${e}`)
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  }
}

// Types exportés
export type UserProfile = z.infer<typeof UserProfileSchema>
export type Project = z.infer<typeof ProjectSchema>
export type CodeGeneration = z.infer<typeof CodeGenerationSchema>
export type Payment = z.infer<typeof PaymentSchema>
export type Feedback = z.infer<typeof FeedbackSchema>
