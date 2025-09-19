import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { prompt, provider = 'openai' } = await request.json()

    if (!prompt) {
      return NextResponse.json({
        error: 'Prompt requis'
      }, { status: 400 })
    }

    // Code HTML de démonstration
    const demoCode = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Générée</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
    <div class="min-h-screen">
        <header class="bg-white shadow-sm">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center py-6">
                    <h1 class="text-3xl font-bold text-gray-900">${prompt}</h1>
                </div>
            </div>
        </header>
        
        <main class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <h2 class="text-4xl font-bold text-gray-900 mb-4">
                    Bienvenue sur votre application générée !
                </h2>
                <p class="text-xl text-gray-600 mb-8">
                    Cette page a été créée avec Rork AI Builder
                </p>
                <div class="bg-white rounded-lg shadow-md p-8">
                    <h3 class="text-2xl font-semibold mb-4">Fonctionnalités incluses :</h3>
                    <ul class="text-left space-y-2">
                        <li class="flex items-center">
                            <span class="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                            Design responsive avec Tailwind CSS
                        </li>
                        <li class="flex items-center">
                            <span class="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                            Interface moderne et accessible
                        </li>
                        <li class="flex items-center">
                            <span class="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                            Optimisé pour tous les appareils
                        </li>
                    </ul>
                </div>
            </div>
        </main>
    </div>
</body>
</html>`

    return NextResponse.json({
      success: true,
      code: demoCode,
      metadata: {
        title: 'Application Générée',
        description: `Application créée avec: ${prompt}`,
        framework: 'html',
        provider,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Erreur génération:', error)
    return NextResponse.json({
      error: 'Erreur lors de la génération'
    }, { status: 500 })
  }
}