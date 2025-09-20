'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Code, 
  Zap, 
  Copy, 
  Download, 
  Play,
  Sparkles,
  Bot,
  Settings,
  Languages
} from 'lucide-react'

interface GeneratedCode {
  id: string
  prompt: string
  code: string
  language: string
  timestamp: Date
  provider: string
}

export default function CodeGenerator() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [selectedProvider, setSelectedProvider] = useState('openai')

  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'typescript', label: 'TypeScript', icon: '🔷' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'react', label: 'React', icon: '⚛️' },
    { value: 'nextjs', label: 'Next.js', icon: '▲' },
    { value: 'vue', label: 'Vue.js', icon: '💚' },
    { value: 'angular', label: 'Angular', icon: '🅰️' },
    { value: 'nodejs', label: 'Node.js', icon: '🟢' },
  ]

  const providers = [
    { value: 'openai', label: 'OpenAI GPT-4', icon: '🤖' },
    { value: 'claude', label: 'Anthropic Claude', icon: '🧠' },
    { value: 'gemini', label: 'Google Gemini', icon: '💎' },
    { value: 'mistral', label: 'Mistral AI', icon: '🌪️' },
  ]

  const generateCode = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    
    try {
      // Simulation de génération de code (comme sur Rork.com)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockGeneratedCode: GeneratedCode = {
        id: Date.now().toString(),
        prompt: prompt,
        code: generateMockCode(prompt, selectedLanguage),
        language: selectedLanguage,
        timestamp: new Date(),
        provider: selectedProvider
      }
      
      setGeneratedCode(mockGeneratedCode)
    } catch (error) {
      console.error('Erreur lors de la génération:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateMockCode = (prompt: string, language: string): string => {
    const baseCode = {
      javascript: `// ${prompt}
function generatedFunction() {
  console.log('Code généré avec succès!');
  return {
    success: true,
    message: 'Fonction générée par IA'
  };
}

export default generatedFunction;`,
      typescript: `// ${prompt}
interface GeneratedResponse {
  success: boolean;
  message: string;
}

function generatedFunction(): GeneratedResponse {
  console.log('Code TypeScript généré avec succès!');
  return {
    success: true,
    message: 'Fonction TypeScript générée par IA'
  };
}

export default generatedFunction;`,
      react: `// ${prompt}
import React from 'react';

interface Props {
  title?: string;
}

const GeneratedComponent: React.FC<Props> = ({ title = 'Composant Généré' }) => {
  return (
    <div className="generated-component">
      <h2>{title}</h2>
      <p>Ce composant React a été généré par IA!</p>
    </div>
  );
};

export default GeneratedComponent;`,
      python: `# ${prompt}
def generated_function():
    """
    Fonction générée par IA
    """
    print("Code Python généré avec succès!")
    return {
        "success": True,
        "message": "Fonction Python générée par IA"
    }

if __name__ == "__main__":
    result = generated_function()
    print(result)`
    }

    return baseCode[language as keyof typeof baseCode] || baseCode.javascript
  }

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode.code)
    }
  }

  const downloadCode = () => {
    if (generatedCode) {
      const blob = new Blob([generatedCode.code], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `generated_code.${generatedCode.language === 'javascript' ? 'js' : generatedCode.language === 'typescript' ? 'ts' : generatedCode.language === 'react' ? 'tsx' : 'py'}`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-500" />
            <span>Configuration de Génération</span>
          </CardTitle>
          <CardDescription>
            Configurez le langage et le provider IA pour la génération de code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Sélection du langage */}
            <div>
              <label className="text-sm font-medium mb-2 block">Langage de programmation</label>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <Button
                    key={lang.value}
                    variant={selectedLanguage === lang.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLanguage(lang.value)}
                    className="justify-start"
                  >
                    <span className="mr-2">{lang.icon}</span>
                    {lang.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sélection du provider */}
            <div>
              <label className="text-sm font-medium mb-2 block">Provider IA</label>
              <div className="grid grid-cols-2 gap-2">
                {providers.map((provider) => (
                  <Button
                    key={provider.value}
                    variant={selectedProvider === provider.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedProvider(provider.value)}
                    className="justify-start"
                  >
                    <span className="mr-2">{provider.icon}</span>
                    {provider.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zone de prompt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-purple-500" />
            <span>Prompt de Génération</span>
          </CardTitle>
          <CardDescription>
            Décrivez le code que vous souhaitez générer (comme sur Rork.com)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Ex: Crée un composant React pour un bouton avec des animations CSS..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">
                  <Languages className="h-3 w-3 mr-1" />
                  {languages.find(l => l.value === selectedLanguage)?.label}
                </Badge>
                <Badge variant="secondary">
                  {providers.find(p => p.value === selectedProvider)?.label}
                </Badge>
              </div>
              <Button 
                onClick={generateCode} 
                disabled={!prompt.trim() || isGenerating}
                className="flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-spin" />
                    <span>Génération...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Générer le Code</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code généré */}
      {generatedCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-green-500" />
                <span>Code Généré</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copier
                </Button>
                <Button variant="outline" size="sm" onClick={downloadCode}>
                  <Download className="h-4 w-4 mr-1" />
                  Télécharger
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              Généré le {generatedCode.timestamp.toLocaleString()} avec {providers.find(p => p.value === generatedCode.provider)?.label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{generatedCode.code}</code>
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
