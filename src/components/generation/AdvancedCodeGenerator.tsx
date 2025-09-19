'use client'

import React, { useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Sparkles, 
  Zap, 
  Settings, 
  Play, 
  Download, 
  Copy, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Code,
  Palette,
  Smartphone,
  Globe,
  Shield,
  Gauge,
  Search,
  Lightbulb,
  TrendingUp
} from 'lucide-react'
import { MonitoringService } from '@/lib/monitoring/sentry-config'

interface GenerationOptions {
  provider: 'openai' | 'anthropic' | 'langchain-openai' | 'langchain-anthropic'
  framework: 'html' | 'react' | 'vue' | 'nextjs' | 'svelte'
  style: 'tailwind' | 'css' | 'styled-components' | 'emotion'
  complexity: 'simple' | 'intermediate' | 'advanced'
  features: string[]
  responsive: boolean
  accessibility: boolean
  seo: boolean
  performance: boolean
  useRAG: boolean
}

interface GenerationResult {
  code: string
  metadata: any
  suggestions: string[]
  preview?: string
  generationTime: number
}

export default function AdvancedCodeGenerator() {
  const { user } = useUser()
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [result, setResult] = useState<GenerationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false)
  const [streamingResponse, setStreamingResponse] = useState('')

  const [options, setOptions] = useState<GenerationOptions>({
    provider: 'openai',
    framework: 'html',
    style: 'tailwind',
    complexity: 'intermediate',
    features: [],
    responsive: true,
    accessibility: true,
    seo: false,
    performance: true,
    useRAG: false,
  })

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)
    setError(null)
    setResult(null)
    setStreamingResponse('')
    setGenerationProgress(0)

    try {
      // Capturer le début de la génération
      MonitoringService.captureUsageMetric(user?.id || 'anonymous', 'advanced_generation_started', {
        provider: options.provider,
        framework: options.framework,
        complexity: options.complexity,
        promptLength: prompt.length,
        features: options.features,
      })

      const startTime = Date.now()

      // Simuler le progrès
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 10
        })
      }, 200)

      const response = await fetch('/api/generate-advanced', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          ...options,
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la génération')
      }

      const data = await response.json()
      
      clearInterval(progressInterval)
      setGenerationProgress(100)

      if (data.success) {
        setResult({
          code: data.data.code,
          metadata: data.data.metadata,
          suggestions: data.data.suggestions,
          preview: data.data.preview,
          generationTime: data.data.generationTime,
        })

        // Capturer le succès de la génération
        MonitoringService.captureUsageMetric(user?.id || 'anonymous', 'advanced_generation_completed', {
          provider: options.provider,
          framework: options.framework,
          generationTime: data.data.generationTime,
          codeLength: data.data.code.length,
        })
      } else {
        throw new Error(data.error || 'Erreur lors de la génération')
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      
      // Capturer l'erreur
      MonitoringService.captureError(err as Error, {
        component: 'AdvancedCodeGenerator',
        action: 'generate',
        options,
      })
    } finally {
      setIsGenerating(false)
      setTimeout(() => setGenerationProgress(0), 1000)
    }
  }, [prompt, options, user])

  const handleStreamingGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)
    setError(null)
    setStreamingResponse('')

    try {
      const response = await fetch(`/api/generate-advanced?prompt=${encodeURIComponent(prompt)}&provider=${options.provider}`)
      
      if (!response.ok) {
        throw new Error('Erreur lors du streaming')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.chunk) {
                  setStreamingResponse(prev => prev + data.chunk)
                } else if (data.done) {
                  setResult({
                    code: data.code,
                    metadata: { streaming: true },
                    suggestions: [],
                    generationTime: 0,
                  })
                } else if (data.error) {
                  throw new Error(data.error)
                }
              } catch (parseError) {
                console.error('Erreur parsing stream:', parseError)
              }
            }
          }
        }
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(errorMessage)
      
      MonitoringService.captureError(err as Error, {
        component: 'AdvancedCodeGenerator',
        action: 'streaming_generate',
      })
    } finally {
      setIsGenerating(false)
    }
  }, [prompt, options])

  const handleCopyCode = useCallback(() => {
    const codeToCopy = streamingResponse || result?.code || ''
    navigator.clipboard.writeText(codeToCopy)
  }, [streamingResponse, result])

  const handleDownloadCode = useCallback(() => {
    const codeToDownload = streamingResponse || result?.code || ''
    const blob = new Blob([codeToDownload], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'generated-code.html'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [streamingResponse, result])

  const availableFeatures = [
    { id: 'responsive', label: 'Responsive', icon: Smartphone },
    { id: 'accessibility', label: 'Accessibilité', icon: Shield },
    { id: 'seo', label: 'SEO', icon: Search },
    { id: 'performance', label: 'Performance', icon: Gauge },
  ]

  const toggleFeature = (featureId: string) => {
    setOptions(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Générateur de Code Avancé
          </h1>
          <p className="text-muted-foreground mt-2">
            Créez des applications web modernes avec l'intelligence artificielle
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <Sparkles className="h-3 w-3" />
            <span>Enterprise Edition</span>
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Options Avancées
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de génération */}
        <div className="lg:col-span-2 space-y-4">
          {/* Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5" />
                <span>Prompt de Génération</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Décrivez votre application en détail... (ex: 'Créer un dashboard e-commerce moderne avec tableau de bord, gestion des produits, et analytics')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px]"
                disabled={isGenerating}
              />
              
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  {prompt.length} caractères
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isGenerating}
                    className="flex items-center space-x-2"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    <span>Générer</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleStreamingGenerate}
                    disabled={!prompt.trim() || isGenerating}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Stream
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options avancées */}
          {showAdvancedOptions && (
            <Card>
              <CardHeader>
                <CardTitle>Options Avancées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Fournisseur IA</label>
                    <Select
                      value={options.provider}
                      onValueChange={(value: any) => setOptions(prev => ({ ...prev, provider: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI GPT-4o</SelectItem>
                        <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                        <SelectItem value="langchain-openai">LangChain OpenAI</SelectItem>
                        <SelectItem value="langchain-anthropic">LangChain Anthropic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Framework</label>
                    <Select
                      value={options.framework}
                      onValueChange={(value: any) => setOptions(prev => ({ ...prev, framework: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="html">HTML/CSS/JS</SelectItem>
                        <SelectItem value="react">React</SelectItem>
                        <SelectItem value="vue">Vue.js</SelectItem>
                        <SelectItem value="nextjs">Next.js</SelectItem>
                        <SelectItem value="svelte">Svelte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Style</label>
                    <Select
                      value={options.style}
                      onValueChange={(value: any) => setOptions(prev => ({ ...prev, style: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                        <SelectItem value="css">CSS Vanilla</SelectItem>
                        <SelectItem value="styled-components">Styled Components</SelectItem>
                        <SelectItem value="emotion">Emotion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Complexité</label>
                    <Select
                      value={options.complexity}
                      onValueChange={(value: any) => setOptions(prev => ({ ...prev, complexity: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="simple">Simple</SelectItem>
                        <SelectItem value="intermediate">Intermédiaire</SelectItem>
                        <SelectItem value="advanced">Avancé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Fonctionnalités */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Fonctionnalités</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableFeatures.map((feature) => {
                      const Icon = feature.icon
                      const isEnabled = options.features.includes(feature.id)
                      
                      return (
                        <Button
                          key={feature.id}
                          variant={isEnabled ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleFeature(feature.id)}
                          className="flex items-center space-x-2"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{feature.label}</span>
                        </Button>
                      )
                    })}
                  </div>
                </div>

                {/* Options supplémentaires */}
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={options.useRAG}
                      onChange={(e) => setOptions(prev => ({ ...prev, useRAG: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Utiliser RAG (Pinecone)</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progrès de génération */}
          {isGenerating && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Génération en cours...</span>
                    <span>{Math.round(generationProgress)}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Résultat */}
          {(result || streamingResponse) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Code Généré</span>
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={handleCopyCode}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copier
                    </Button>
                    <Button size="sm" onClick={handleDownloadCode}>
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview">Aperçu</TabsTrigger>
                    <TabsTrigger value="code">Code</TabsTrigger>
                  </TabsList>
                  <TabsContent value="preview" className="mt-4">
                    <div className="border rounded-lg overflow-hidden">
                      <iframe
                        srcDoc={streamingResponse || result?.code}
                        title="Code Preview"
                        className="w-full h-96 border-0"
                        sandbox="allow-scripts allow-same-origin allow-forms"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="code" className="mt-4">
                    <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-96 text-sm">
                      <code>{streamingResponse || result?.code}</code>
                    </pre>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Suggestions d'amélioration */}
          {result?.suggestions && result.suggestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  <span>Suggestions d'Amélioration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Erreur */}
          {error && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">Erreur de génération</span>
                </div>
                <p className="text-red-600 mt-2">{error}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar avec métadonnées */}
        <div className="space-y-4">
          {/* Configuration actuelle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fournisseur</span>
                <Badge variant="outline">{options.provider}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Framework</span>
                <Badge variant="outline">{options.framework}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Style</span>
                <Badge variant="outline">{options.style}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Complexité</span>
                <Badge variant="outline">{options.complexity}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Métadonnées de génération */}
          {result && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Métadonnées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Modèle</span>
                  <span className="text-sm font-medium">{result.metadata?.model || 'Inconnu'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Temps</span>
                  <span className="text-sm font-medium">{result.generationTime}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Tokens</span>
                  <span className="text-sm font-medium">{result.metadata?.tokens || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Taille</span>
                  <span className="text-sm font-medium">{(result.code.length / 1024).toFixed(1)}KB</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
