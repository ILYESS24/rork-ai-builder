'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Code, Play, Download, Copy } from 'lucide-react'

export default function AdvancedCodeGenerator() {
  const [prompt, setPrompt] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          provider: 'openai',
          saveProject: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la génération')
      }

      const data = await response.json()
      setGeneratedCode(data.code)
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-600" />
            <span>Générateur de Code IA Avancé</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Décrivez votre application
            </label>
            <Textarea
              placeholder="Ex: Créez une page d'accueil moderne pour une startup tech avec hero section, fonctionnalités et témoignages..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">OpenAI GPT-4o</Badge>
              <Badge variant="outline">Streaming</Badge>
            </div>
            <Button 
              onClick={handleGenerate} 
              disabled={!prompt.trim() || isGenerating}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Génération...</span>
                </>
              ) : (
                <>
                  <Code className="h-4 w-4" />
                  <span>Générer le Code</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedCode && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Play className="h-5 w-5 text-green-600" />
                <span>Code Généré</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4 mr-2" />
                  Copier
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-[400px]">
              <pre className="text-sm">{generatedCode}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}