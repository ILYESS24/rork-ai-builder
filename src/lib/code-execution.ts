// Code execution utilities for preview and testing
import { z } from 'zod'

// Schema pour valider le code d'entrée
const CodeExecutionSchema = z.object({
  html: z.string(),
  css: z.string().optional(),
  javascript: z.string().optional(),
  framework: z.enum(['react', 'vue', 'vanilla', 'nextjs', 'svelte']),
  dependencies: z.array(z.string()).optional(),
})

export type CodeExecution = z.infer<typeof CodeExecutionSchema>

// Fonction pour créer un HTML complet avec le code
export function createFullHTML(code: CodeExecution): string {
  const { html, css, javascript, framework } = code

  let fullHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Générée</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        ${css || ''}
    </style>
</head>
<body>
    ${html}
    ${javascript ? `<script>${javascript}</script>` : ''}
</body>
</html>`

  return fullHTML
}

// Fonction pour créer un package.json pour les frameworks
export function createPackageJson(
  framework: string,
  dependencies: string[] = []
): string {
  const baseDeps = {
    react: {
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
    },
    vue: {
      'vue': '^3.3.0',
    },
    nextjs: {
      'next': '^14.0.0',
      'react': '^18.2.0',
      'react-dom': '^18.2.0',
    },
    svelte: {
      'svelte': '^4.0.0',
    },
    vanilla: {},
  }

  const frameworkDeps = baseDeps[framework as keyof typeof baseDeps] || {}
  const customDeps = dependencies.reduce((acc, dep) => {
    acc[dep] = 'latest'
    return acc
  }, {} as Record<string, string>)

  const packageJson = {
    name: 'generated-app',
    version: '1.0.0',
    description: 'Application générée avec Rork AI Builder',
    main: 'index.js',
    scripts: {
      dev: framework === 'nextjs' ? 'next dev' : 'vite',
      build: framework === 'nextjs' ? 'next build' : 'vite build',
      start: framework === 'nextjs' ? 'next start' : 'vite preview',
    },
    dependencies: {
      ...frameworkDeps,
      ...customDeps,
    },
    devDependencies: {
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0',
      'typescript': '^5.0.0',
      'vite': '^4.4.0',
    },
  }

  return JSON.stringify(packageJson, null, 2)
}

// Fonction pour créer un fichier de configuration Vite
export function createViteConfig(framework: string): string {
  if (framework === 'nextjs') {
    return `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
}

module.exports = nextConfig`
  }

  return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [
    ${framework === 'react' ? 'react()' : ''}
    ${framework === 'vue' ? 'vue()' : ''}
    ${framework === 'svelte' ? 'svelte()' : ''}
  ],
  server: {
    port: 3000,
  },
})`
}

// Fonction pour valider le code avant exécution
export function validateCode(code: string, type: 'html' | 'css' | 'javascript'): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  try {
    switch (type) {
      case 'html':
        // Validation HTML basique
        if (!code.includes('<html') && !code.includes('<div') && !code.includes('<body')) {
          errors.push('Le code HTML semble incomplet')
        }
        break

      case 'css':
        // Validation CSS basique
        if (code && !code.includes('{') && !code.includes('}')) {
          errors.push('Le code CSS semble mal formaté')
        }
        break

      case 'javascript':
        // Validation JavaScript basique
        if (code) {
          try {
            new Function(code)
          } catch (e) {
            errors.push(`Erreur JavaScript: ${e}`)
          }
        }
        break
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  } catch (error) {
    return {
      isValid: false,
      errors: [`Erreur de validation: ${error}`],
    }
  }
}

// Fonction pour extraire les métadonnées du code
export function extractCodeMetadata(code: CodeExecution): {
  title: string
  description: string
  tags: string[]
  complexity: 'simple' | 'medium' | 'complex'
} {
  const html = code.html.toLowerCase()
  
  // Détecter la complexité
  let complexity: 'simple' | 'medium' | 'complex' = 'simple'
  if (html.includes('api') || html.includes('fetch') || html.includes('async')) {
    complexity = 'complex'
  } else if (html.includes('function') || html.includes('event') || html.includes('state')) {
    complexity = 'medium'
  }

  // Extraire le titre
  const titleMatch = code.html.match(/<title>(.*?)<\/title>/i)
  const title = titleMatch ? titleMatch[1] : 'Application Générée'

  // Extraire la description
  const descriptionMatch = code.html.match(/<meta name="description" content="(.*?)"/i)
  const description = descriptionMatch ? descriptionMatch[1] : 'Application générée avec Rork AI Builder'

  // Générer des tags basés sur le contenu
  const tags: string[] = []
  if (html.includes('dashboard') || html.includes('admin')) tags.push('dashboard')
  if (html.includes('landing') || html.includes('hero')) tags.push('landing-page')
  if (html.includes('portfolio') || html.includes('projet')) tags.push('portfolio')
  if (html.includes('ecommerce') || html.includes('shop')) tags.push('ecommerce')
  if (html.includes('blog') || html.includes('article')) tags.push('blog')
  if (html.includes('responsive') || html.includes('mobile')) tags.push('responsive')

  return {
    title,
    description,
    tags,
    complexity,
  }
}
