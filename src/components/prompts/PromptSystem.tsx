'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Send, 
  Copy, 
  Star,
  History,
  TrendingUp,
  Lightbulb,
  Target,
  Zap,
  Bot,
  User,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Share2
} from 'lucide-react'

interface Prompt {
  id: string
  content: string
  category: string
  language: string
  timestamp: Date
  rating: number
  usage: number
}

interface Conversation {
  id: string
  messages: Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>
  timestamp: Date
}

export default function PromptSystem() {
  const [prompt, setPrompt] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('general')
  const [selectedLanguage, setSelectedLanguage] = useState('javascript')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [savedPrompts, setSavedPrompts] = useState<Prompt[]>([])
  const [conversationHistory, setConversationHistory] = useState<Conversation[]>([])

  const categories = [
    { value: 'general', label: 'Général', icon: '💡', description: 'Prompts généraux pour tous types de code' },
    { value: 'web', label: 'Web Development', icon: '🌐', description: 'Sites web, applications web, APIs' },
    { value: 'mobile', label: 'Mobile', icon: '📱', description: 'Applications mobiles iOS/Android' },
    { value: 'ai', label: 'IA & ML', icon: '🤖', description: 'Intelligence artificielle et machine learning' },
    { value: 'data', label: 'Data Science', icon: '📊', description: 'Analyse de données, visualisation' },
    { value: 'devops', label: 'DevOps', icon: '⚙️', description: 'Déploiement, CI/CD, infrastructure' },
    { value: 'security', label: 'Sécurité', icon: '🔒', description: 'Sécurité, authentification, cryptage' },
  ]

  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'typescript', label: 'TypeScript', icon: '🔷' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'react', label: 'React', icon: '⚛️' },
    { value: 'vue', label: 'Vue.js', icon: '💚' },
    { value: 'angular', label: 'Angular', icon: '🅰️' },
    { value: 'nodejs', label: 'Node.js', icon: '🟢' },
    { value: 'php', label: 'PHP', icon: '🐘' },
  ]

  const popularPrompts = [
    {
      id: '1',
      content: 'Crée un composant React pour un dashboard avec des graphiques interactifs',
      category: 'web',
      language: 'react',
      rating: 4.8,
      usage: 1250
    },
    {
      id: '2',
      content: 'Génère une API REST avec Node.js et Express pour gérer des utilisateurs',
      category: 'web',
      language: 'nodejs',
      rating: 4.7,
      usage: 980
    },
    {
      id: '3',
      content: 'Crée un algorithme de tri rapide en Python avec visualisation',
      category: 'ai',
      language: 'python',
      rating: 4.9,
      usage: 750
    },
    {
      id: '4',
      content: 'Développe une application mobile avec React Native et navigation',
      category: 'mobile',
      language: 'react',
      rating: 4.6,
      usage: 650
    },
  ]

  useEffect(() => {
    // Charger l'historique des conversations
    const savedHistory = localStorage.getItem('conversationHistory')
    if (savedHistory) {
      setConversationHistory(JSON.parse(savedHistory))
    }

    // Charger les prompts sauvegardés
    const saved = localStorage.getItem('savedPrompts')
    if (saved) {
      setSavedPrompts(JSON.parse(saved))
    }
  }, [])

  const sendPrompt = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)

    // Créer une nouvelle conversation si nécessaire
    if (!currentConversation) {
      const newConversation: Conversation = {
        id: Date.now().toString(),
        messages: [],
        timestamp: new Date()
      }
      setCurrentConversation(newConversation)
    }

    // Ajouter le message utilisateur
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: prompt,
      timestamp: new Date()
    }

    const updatedMessages = [...(currentConversation?.messages || []), userMessage]
    setCurrentConversation(prev => prev ? { ...prev, messages: updatedMessages } : null)

    try {
      // Simulation de génération de réponse (comme sur Rork.com)
      await new Promise(resolve => setTimeout(resolve, 2000))

      const assistantResponse = generateMockResponse(prompt, selectedCategory, selectedLanguage)

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: assistantResponse,
        timestamp: new Date()
      }

      const finalMessages = [...updatedMessages, assistantMessage]
      const finalConversation = {
        ...currentConversation!,
        messages: finalMessages
      }

      setCurrentConversation(finalConversation)
      setConversationHistory(prev => [finalConversation, ...prev])
      
      // Sauvegarder dans localStorage
      localStorage.setItem('conversationHistory', JSON.stringify([finalConversation, ...conversationHistory]))

      setPrompt('')
    } catch (error) {
      console.error('Erreur lors de la génération:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateMockResponse = (prompt: string, category: string, language: string): string => {
    const responses = {
      general: `Voici une solution pour votre demande "${prompt}" :

\`\`\`${language}
// Code généré par Rork AI Builder
function generatedSolution() {
  console.log("Solution implémentée avec succès!");
  
  // Votre logique métier ici
  const result = {
    success: true,
    message: "Code généré pour: " + prompt,
    timestamp: new Date().toISOString()
  };
  
  return result;
}

// Exemple d'utilisation
const solution = generatedSolution();
console.log(solution);
\`\`\`

**Explication :**
- ✅ Code optimisé et commenté
- 🔧 Fonction réutilisable
- 📝 Documentation incluse
- 🚀 Prêt pour la production

**Prochaines étapes :**
1. Testez le code dans votre environnement
2. Adaptez selon vos besoins spécifiques
3. Ajoutez la gestion d'erreurs si nécessaire`,

      web: `Voici une solution web complète pour "${prompt}" :

\`\`\`${language}
// Composant web généré par Rork AI Builder
import React, { useState, useEffect } from 'react';

const GeneratedComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/data');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="generated-component">
      {loading ? (
        <div>Chargement...</div>
      ) : (
        <div>
          <h2>Composant généré avec succès!</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default GeneratedComponent;
\`\`\`

**Fonctionnalités incluses :**
- ⚛️ Composant React moderne
- 🔄 Gestion d'état avec hooks
- 🌐 Appels API intégrés
- 🎨 Styling avec Tailwind CSS
- 📱 Design responsive`,

      ai: `Solution d'IA/ML pour "${prompt}" :

\`\`\`python
# Solution IA générée par Rork AI Builder
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

class GeneratedAIModel:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=100)
        self.is_trained = False
    
    def train(self, X, y):
        """Entraîne le modèle avec les données fournies"""
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        self.model.fit(X_train, y_train)
        predictions = self.model.predict(X_test)
        accuracy = accuracy_score(y_test, predictions)
        
        self.is_trained = True
        print(f"Modèle entraîné avec une précision de {accuracy:.2%}")
        
        return accuracy
    
    def predict(self, X):
        """Fait des prédictions avec le modèle entraîné"""
        if not self.is_trained:
            raise ValueError("Le modèle doit être entraîné avant de faire des prédictions")
        
        return self.model.predict(X)

# Exemple d'utilisation
model = GeneratedAIModel()
# model.train(X_train, y_train)
# predictions = model.predict(X_test)
\`\`\`

**Fonctionnalités IA :**
- 🤖 Modèle de machine learning
- 📊 Métriques d'évaluation
- 🔧 Interface simple et intuitive
- 📈 Optimisé pour la performance`
    }

    return responses[category as keyof typeof responses] || responses.general
  }

  const savePrompt = () => {
    if (!prompt.trim()) return

    const newPrompt: Prompt = {
      id: Date.now().toString(),
      content: prompt,
      category: selectedCategory,
      language: selectedLanguage,
      timestamp: new Date(),
      rating: 0,
      usage: 0
    }

    setSavedPrompts(prev => [newPrompt, ...prev])
    localStorage.setItem('savedPrompts', JSON.stringify([newPrompt, ...savedPrompts]))
  }

  const usePrompt = (promptContent: string) => {
    setPrompt(promptContent)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      {/* Zone de prompt principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <span>Système de Prompts IA</span>
          </CardTitle>
          <CardDescription>
            Générez du code intelligent avec des prompts avancés (comme sur Rork.com)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sélection de catégorie et langage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Catégorie</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Langage</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {languages.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.icon} {lang.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Zone de texte */}
            <div>
              <Textarea
                placeholder="Décrivez le code que vous souhaitez générer... (ex: Crée un composant React pour un dashboard avec des graphiques)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={savePrompt}>
                  <Star className="h-4 w-4 mr-1" />
                  Sauvegarder
                </Button>
              </div>
              <Button 
                onClick={sendPrompt} 
                disabled={!prompt.trim() || isGenerating}
                className="flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <Zap className="h-4 w-4 animate-spin" />
                    <span>Génération...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Générer</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompts populaires */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span>Prompts Populaires</span>
          </CardTitle>
          <CardDescription>
            Prompts les plus utilisés par la communauté
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {popularPrompts.map((prompt) => (
              <div key={prompt.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">
                      {categories.find(c => c.value === prompt.category)?.icon}
                      {categories.find(c => c.value === prompt.category)?.label}
                    </Badge>
                    <Badge variant="outline">
                      {languages.find(l => l.value === prompt.language)?.label}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-gray-600">{prompt.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{prompt.content}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {prompt.usage} utilisations
                  </span>
                  <Button size="sm" variant="outline" onClick={() => usePrompt(prompt.content)}>
                    Utiliser
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversation actuelle */}
      {currentConversation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5 text-purple-500" />
              <span>Conversation Actuelle</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {currentConversation.messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                    </div>
                    {message.role === 'assistant' && (
                      <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Button size="sm" variant="outline" onClick={() => copyToClipboard(message.content)}>
                          <Copy className="h-3 w-3 mr-1" />
                          Copier
                        </Button>
                        <Button size="sm" variant="outline">
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Share2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prompts sauvegardés */}
      {savedPrompts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span>Mes Prompts Sauvegardés</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savedPrompts.slice(0, 5).map((savedPrompt) => (
                <div key={savedPrompt.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {categories.find(c => c.value === savedPrompt.category)?.label}
                      </Badge>
                      <Badge variant="outline">
                        {languages.find(l => l.value === savedPrompt.language)?.label}
                      </Badge>
                    </div>
                    <span className="text-xs text-gray-500">
                      {savedPrompt.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{savedPrompt.content}</p>
                  <Button size="sm" variant="outline" onClick={() => usePrompt(savedPrompt.content)}>
                    Réutiliser
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
