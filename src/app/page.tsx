'use client'

import { useState } from 'react'
import { UserButton, useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Settings, 
  User, 
  Zap, 
  Code, 
  BarChart3, 
  Users, 
  Database,
  Crown,
  TrendingUp,
  Globe,
  Shield,
  Zap as Lightning
} from 'lucide-react'
import AdvancedCodeGenerator from '@/components/generation/AdvancedCodeGenerator'
import AdvancedDashboard from '@/components/dashboard/AdvancedDashboard'

export default function Home() {
  const { user, isLoaded } = useUser()
  const [activeTab, setActiveTab] = useState('generator')

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-900/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Rork AI Builder
              </h1>
              <Badge variant="secondary" className="ml-2">
                <Crown className="h-3 w-3 mr-1" />
                Enterprise Edition
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                  <Button size="sm">
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Pro
                  </Button>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: 'h-8 w-8',
                      },
                    }}
                  />
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="/sign-in">
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </a>
                  </Button>
                  <Button size="sm" asChild>
                    <a href="/sign-up">
                      Get Started
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Banner for non-authenticated users */}
      {!user && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200 dark:from-blue-900/20 dark:to-purple-900/20 dark:border-blue-800">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                  🚀 Découvrez la puissance de l'IA pour le développement web
                </h2>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Créez des applications web professionnelles en quelques clics avec notre plateforme IA avancée.
                  Multi-provider, collaboration temps réel, et monitoring intégré.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" asChild>
                  <a href="/sign-up">Créer un compte gratuit</a>
                </Button>
                <Button size="sm" asChild>
                  <a href="/demo">Voir la démo</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Banner */}
      <div className="bg-white/50 border-b dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              <span className="text-muted-foreground">Multi-Provider IA</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-muted-foreground">Collaboration Temps Réel</span>
            </div>
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-green-600" />
              <span className="text-muted-foreground">Persistance Avancée</span>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <span className="text-muted-foreground">Analytics & Monitoring</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-indigo-600" />
              <span className="text-muted-foreground">Déploiement Cloud</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {user ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="generator" className="flex items-center space-x-2">
                <Code className="h-4 w-4" />
                <span>Générateur</span>
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
        ) : (
          /* Landing page pour utilisateurs non connectés */
          <div className="space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Rork AI Builder
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                La plateforme de développement web alimentée par l'IA la plus avancée.
                Créez, collaborez et déployez des applications web professionnelles en quelques minutes.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Button size="lg" asChild>
                  <a href="/sign-up">
                    <Lightning className="h-5 w-5 mr-2" />
                    Commencer Gratuitement
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="/demo">
                    Voir la Démo
                  </a>
                </Button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    <span>IA Multi-Provider</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    OpenAI, Anthropic, LangChain - Utilisez les meilleurs modèles IA pour générer du code de qualité professionnelle.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>Collaboration Temps Réel</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Yjs + Socket.io pour une collaboration fluide avec curseurs partagés, édition simultanée et synchronisation instantanée.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="h-5 w-5 text-green-600" />
                    <span>Persistance Avancée</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Supabase + Prisma + PostgreSQL pour une gestion robuste des données avec versioning et historique complet.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    <span>Analytics & Monitoring</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Sentry pour le monitoring, métriques de performance et analytics détaillées de vos générations.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-indigo-600" />
                    <span>Enterprise Ready</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Stripe pour les paiements, authentification robuste, et architecture scalable pour les entreprises.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-teal-600" />
                    <span>Déploiement Cloud</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Déploiement optimisé sur Render avec Docker, CI/CD automatisé et monitoring de production.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* CTA Section */}
            <div className="text-center space-y-6 py-12">
              <h2 className="text-3xl font-bold">
                Prêt à révolutionner votre développement web ?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Rejoignez des milliers de développeurs qui utilisent déjà Rork AI Builder pour créer des applications web exceptionnelles.
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Button size="lg" asChild>
                  <a href="/sign-up">
                    <Crown className="h-5 w-5 mr-2" />
                    Créer un Compte Gratuit
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="/contact">
                    Nous Contacter
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
