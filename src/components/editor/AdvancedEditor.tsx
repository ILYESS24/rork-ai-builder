'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Code, 
  Play, 
  Save, 
  Copy, 
  Download,
  Maximize2,
  Minimize2,
  Settings,
  Eye,
  EyeOff,
  Terminal,
  FileText,
  Palette,
  Zap
} from 'lucide-react'

interface EditorState {
  code: string
  language: string
  theme: string
  fontSize: number
  isPreview: boolean
  isFullscreen: boolean
}

export default function AdvancedEditor() {
  const [editorState, setEditorState] = useState<EditorState>({
    code: `// Bienvenue dans l'éditeur Rork AI Builder
// Tapez votre code ici...

function helloWorld() {
  console.log("Hello, Rork AI Builder!");
  return "Code généré avec succès!";
}

// Décommentez pour tester
// helloWorld();`,
    language: 'javascript',
    theme: 'vs-dark',
    fontSize: 14,
    isPreview: false,
    isFullscreen: false
  })

  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)

  const languages = [
    { value: 'javascript', label: 'JavaScript', extension: '.js' },
    { value: 'typescript', label: 'TypeScript', extension: '.ts' },
    { value: 'python', label: 'Python', extension: '.py' },
    { value: 'react', label: 'React', extension: '.tsx' },
    { value: 'html', label: 'HTML', extension: '.html' },
    { value: 'css', label: 'CSS', extension: '.css' },
    { value: 'json', label: 'JSON', extension: '.json' },
    { value: 'markdown', label: 'Markdown', extension: '.md' },
  ]

  const themes = [
    { value: 'vs-dark', label: 'Dark' },
    { value: 'vs-light', label: 'Light' },
    { value: 'monokai', label: 'Monokai' },
    { value: 'github', label: 'GitHub' },
  ]

  const runCode = async () => {
    setIsRunning(true)
    setOutput('')
    
    try {
      // Simulation d'exécution de code
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockOutput = `🚀 Exécution du code ${editorState.language.toUpperCase()}...

✅ Compilation réussie
📊 Analyse du code terminée
🎯 Résultats:

Hello, Rork AI Builder!
Code généré avec succès!

⏱️ Temps d'exécution: 1.2s
💾 Mémoire utilisée: 12.4 MB
🔍 Lignes de code: ${editorState.code.split('\n').length}

✨ Code exécuté avec succès!`
      
      setOutput(mockOutput)
    } catch (error) {
      setOutput(`❌ Erreur d'exécution: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  const saveCode = () => {
    const blob = new Blob([editorState.code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const extension = languages.find(l => l.value === editorState.language)?.extension || '.txt'
    a.href = url
    a.download = `code${extension}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyCode = () => {
    navigator.clipboard.writeText(editorState.code)
  }

  const togglePreview = () => {
    setEditorState(prev => ({ ...prev, isPreview: !prev.isPreview }))
  }

  const toggleFullscreen = () => {
    setEditorState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }))
  }

  return (
    <div className={`space-y-4 ${editorState.isFullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900 p-4' : ''}`}>
      {/* Barre d'outils */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-blue-500" />
                <span>Éditeur de Code</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  {languages.find(l => l.value === editorState.language)?.label}
                </Badge>
                <Badge variant="outline">
                  {themes.find(t => t.value === editorState.theme)?.label}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={togglePreview}>
                {editorState.isPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                {editorState.isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Sélection du langage */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Langage:</label>
                <select
                  value={editorState.language}
                  onChange={(e) => setEditorState(prev => ({ ...prev, language: e.target.value }))}
                  className="px-2 py-1 border rounded text-sm"
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sélection du thème */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Thème:</label>
                <select
                  value={editorState.theme}
                  onChange={(e) => setEditorState(prev => ({ ...prev, theme: e.target.value }))}
                  className="px-2 py-1 border rounded text-sm"
                >
                  {themes.map((theme) => (
                    <option key={theme.value} value={theme.value}>
                      {theme.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Taille de police */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Taille:</label>
                <input
                  type="range"
                  min="10"
                  max="24"
                  value={editorState.fontSize}
                  onChange={(e) => setEditorState(prev => ({ ...prev, fontSize: parseInt(e.target.value) }))}
                  className="w-20"
                />
                <span className="text-sm text-gray-500">{editorState.fontSize}px</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={copyCode}>
                <Copy className="h-4 w-4 mr-1" />
                Copier
              </Button>
              <Button variant="outline" size="sm" onClick={saveCode}>
                <Save className="h-4 w-4 mr-1" />
                Sauvegarder
              </Button>
              <Button 
                onClick={runCode} 
                disabled={isRunning}
                className="flex items-center space-x-1"
              >
                {isRunning ? (
                  <>
                    <Zap className="h-4 w-4 animate-spin" />
                    <span>Exécution...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Exécuter</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Zone d'édition */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Code</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={editorState.code}
              onChange={(e) => setEditorState(prev => ({ ...prev, code: e.target.value }))}
              className={`font-mono resize-none ${
                editorState.theme === 'vs-dark' ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'
              }`}
              style={{ 
                fontSize: `${editorState.fontSize}px`,
                minHeight: '400px',
                fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
              }}
              placeholder="Tapez votre code ici..."
            />
          </CardContent>
        </Card>

        {/* Zone de sortie */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Terminal className="h-4 w-4" />
              <span>Sortie</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-lg min-h-[400px] font-mono text-sm overflow-auto">
              {output ? (
                <pre className="whitespace-pre-wrap">{output}</pre>
              ) : (
                <div className="text-slate-400">
                  <p>🚀 Cliquez sur "Exécuter" pour voir les résultats</p>
                  <p className="mt-2">💡 Vous pouvez exécuter du code JavaScript, Python, et plus encore!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistiques du code */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {editorState.code.split('\n').length}
              </div>
              <div className="text-sm text-gray-500">Lignes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {editorState.code.split(' ').filter(word => word.trim()).length}
              </div>
              <div className="text-sm text-gray-500">Mots</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {editorState.code.length}
              </div>
              <div className="text-sm text-gray-500">Caractères</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(editorState.code.length / 1024 * 100) / 100}KB
              </div>
              <div className="text-sm text-gray-500">Taille</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
