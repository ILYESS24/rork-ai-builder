'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Users, 
  Code, 
  Zap, 
  TrendingUp,
  Activity,
  Globe,
  Database
} from 'lucide-react'

export default function AdvancedDashboard() {
  // Données simulées pour la démo
  const stats = {
    totalProjects: 24,
    totalGenerations: 156,
    totalUsers: 12,
    totalRevenue: 2890
  }

  const recentProjects = [
    { id: 1, name: 'E-commerce Dashboard', status: 'completed', createdAt: '2024-01-15' },
    { id: 2, name: 'Portfolio Website', status: 'in-progress', createdAt: '2024-01-14' },
    { id: 3, name: 'SaaS Landing Page', status: 'completed', createdAt: '2024-01-13' },
  ]

  const recentGenerations = [
    { id: 1, prompt: 'Dashboard e-commerce avec analytics', provider: 'OpenAI', createdAt: '2024-01-15' },
    { id: 2, prompt: 'Page d\'accueil moderne', provider: 'Anthropic', createdAt: '2024-01-14' },
    { id: 3, prompt: 'Interface utilisateur mobile', provider: 'OpenAI', createdAt: '2024-01-13' },
  ]

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projets</p>
                <p className="text-2xl font-bold">{stats.totalProjects}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% ce mois
                </p>
              </div>
              <Code className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Générations</p>
                <p className="text-2xl font-bold">{stats.totalGenerations}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +25% ce mois
                </p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilisateurs</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8% ce mois
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Revenus</p>
                <p className="text-2xl font-bold">€{stats.totalRevenue}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +15% ce mois
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projets récents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Projets Récents</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{project.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Créé le {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
                  {project.status === 'completed' ? 'Terminé' : 'En cours'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Générations récentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Générations Récentes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentGenerations.map((generation) => (
              <div key={generation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{generation.prompt}</h4>
                  <p className="text-sm text-muted-foreground">
                    {generation.provider} • {new Date(generation.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline">{generation.provider}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métriques système */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-5 w-5" />
              <span>Santé du Système</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Base de données</span>
                <Badge variant="default" className="bg-green-600">Opérationnelle</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API IA</span>
                <Badge variant="default" className="bg-green-600">Opérationnelle</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cache Redis</span>
                <Badge variant="default" className="bg-green-600">Opérationnel</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Vector Search</span>
                <Badge variant="default" className="bg-green-600">Opérationnel</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Temps de réponse moyen</span>
                <span className="font-medium">245ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Uptime</span>
                <span className="font-medium">99.9%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Générations/heure</span>
                <span className="font-medium">156</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Utilisateurs actifs</span>
                <span className="font-medium">8</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}