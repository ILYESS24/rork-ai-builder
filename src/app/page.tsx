'use client'

import { useUser } from '@clerk/nextjs'
import { SignInButton, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AdvancedCodeGenerator from '@/components/generation/AdvancedCodeGenerator'
import AdvancedDashboard from '@/components/dashboard/AdvancedDashboard'
import { 
  Sparkles, 
  Code, 
  BarChart3, 
  Zap, 
  Users, 
  Globe,
  Database,
  Shield,
  Rocket
} from 'lucide-react'

export default function HomePage() {
  const { isSignedIn, user } = useUser()

  if (!isSignedIn) {
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
                <SignInButton mode="modal">
                  <Button variant="outline">Se connecter</Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button>Commencer</Button>
                </SignInButton>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Créez des applications IA en quelques clics
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Plateforme complète de création d'applications IA avec génération de code, 
              collaboration temps réel, et outils avancés pour développeurs et entreprises.
            </p>
            <div className="flex justify-center space-x-4">
              <SignInButton mode="modal">
                <Button size="lg" className="flex items-center space-x-2">
                  <Rocket className="h-5 w-5" />
                  <span>Commencer gratuitement</span>
                </Button>
              </SignInButton>
              <Button variant="outline" size="lg">
                Voir la démo
              </Button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card>
              <CardHeader>
                <Code className="h-10 w-10 text-blue-600 mb-4" />
                <CardTitle>Génération de Code IA</CardTitle>
                <CardDescription>
                  Créez des applications complètes avec des prompts en langage naturel
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-10 w-10 text-green-600 mb-4" />
                <CardTitle>Collaboration Temps Réel</CardTitle>
                <CardDescription>
                  Travaillez en équipe avec synchronisation en temps réel
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="h-10 w-10 text-purple-600 mb-4" />
                <CardTitle>Analytics Avancées</CardTitle>
                <CardDescription>
                  Suivez les performances et optimisez vos applications
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Database className="h-10 w-10 text-orange-600 mb-4" />
                <CardTitle>Multi-Provider IA</CardTitle>
                <CardDescription>
                  OpenAI, Anthropic, Mistral, Google Gemini et plus
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="h-10 w-10 text-red-600 mb-4" />
                <CardTitle>Sécurité Enterprise</CardTitle>
                <CardDescription>
                  Authentification, paiements, monitoring intégrés
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Globe className="h-10 w-10 text-teal-600 mb-4" />
                <CardTitle>Déploiement Global</CardTitle>
                <CardDescription>
                  Déployez sur Vercel, Render, AWS en un clic
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">
              Prêt à révolutionner votre développement ?
            </h2>
            <p className="text-xl mb-6 opacity-90">
              Rejoignez des milliers de développeurs qui créent déjà avec l'IA
            </p>
            <SignInButton mode="modal">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Commencer maintenant
              </Button>
            </SignInButton>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Rork AI Builder
              </h1>
              <Badge variant="secondary">Enterprise Edition</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bienvenue, {user?.firstName || user?.emailAddresses[0]?.emailAddress} !
              </span>
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Dashboard Rork AI Builder
          </h1>
          <p className="text-gray-600">
            Créez, collaborez et déployez des applications IA en quelques minutes
          </p>
        </div>

        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Générateur IA</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <AdvancedCodeGenerator />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <AdvancedDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}