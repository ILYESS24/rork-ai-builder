'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import CodeGenerator from '@/components/ai/CodeGenerator'
import AdvancedEditor from '@/components/editor/AdvancedEditor'
import PromptSystem from '@/components/prompts/PromptSystem'
import { 
  Sparkles, 
  Code, 
  BarChart3, 
  Zap, 
  Users, 
  Globe,
  Database,
  Shield,
  Rocket,
  MessageSquare,
  FileText,
  Terminal
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Rork AI Builder
              </h1>
              <Badge variant="secondary" className="ml-2">Enterprise Edition</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">Se connecter</Button>
              <Button>Commencer</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
            Construisez des Applications IA{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              en Minutes
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Plateforme complète de création d&apos;applications IA avec génération de code, 
            collaboration temps réel, et outils avancés pour développeurs et entreprises.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8 py-3">
              <Rocket className="mr-2 h-5 w-5" />
              Commencer Gratuitement
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Voir la Démo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Fonctionnalités Enterprise
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Tout ce dont vous avez besoin pour créer des applications IA professionnelles
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Code className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Génération de Code IA</CardTitle>
                <CardDescription>
                  Générez du code complet avec l&apos;IA multi-provider (OpenAI, Claude, Gemini)
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-10 w-10 text-green-600 mb-4" />
                <CardTitle>Collaboration Temps Réel</CardTitle>
                <CardDescription>
                  Travaillez en équipe avec synchronisation temps réel et chat intégré
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-purple-600 mb-4" />
                <CardTitle>Dashboard Avancé</CardTitle>
                <CardDescription>
                  Suivez vos projets avec analytics et métriques détaillées
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Database className="h-10 w-10 text-orange-600 mb-4" />
                <CardTitle>Base de Données Multi-Cloud</CardTitle>
                <CardDescription>
                  PostgreSQL, MongoDB, Redis avec gestion automatique
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-10 w-10 text-red-600 mb-4" />
                <CardTitle>Sécurité Enterprise</CardTitle>
                <CardDescription>
                  Authentification, autorisation et monitoring de sécurité
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <Globe className="h-10 w-10 text-teal-600 mb-4" />
                <CardTitle>Déploiement Global</CardTitle>
                <CardDescription>
                  Déployez sur Vercel, Render, AWS avec CI/CD automatique
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Application Interface */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="generator" className="flex items-center space-x-2">
                <Code className="h-4 w-4" />
                <span>Générateur IA</span>
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Éditeur</span>
              </TabsTrigger>
              <TabsTrigger value="prompts" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Prompts</span>
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="space-y-6">
              <CodeGenerator />
            </TabsContent>

            <TabsContent value="editor" className="space-y-6">
              <AdvancedEditor />
            </TabsContent>

            <TabsContent value="prompts" className="space-y-6">
              <PromptSystem />
            </TabsContent>

            <TabsContent value="dashboard" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-blue-500" />
                    <span>Mon Dashboard</span>
                  </CardTitle>
                  <CardDescription>
                    Gérez vos projets et suivez vos performances
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      Dashboard Personnel
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      Connectez-vous pour accéder à votre dashboard personnalisé
                    </p>
                    <Button>Se connecter pour continuer</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Sparkles className="h-6 w-6" />
            <span className="text-xl font-bold">Rork AI Builder</span>
            <Badge variant="secondary">Enterprise Edition</Badge>
          </div>
          <p className="text-gray-400">
            © 2024 Rork AI Builder. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  )
}