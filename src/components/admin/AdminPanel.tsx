'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Shield, 
  Users, 
  Database, 
  BarChart3, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Globe,
  Zap,
  Crown,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  totalProjects: number
  totalGenerations: number
  totalRevenue: number
  activeUsers: number
  systemHealth: {
    database: 'healthy' | 'warning' | 'error'
    redis: 'healthy' | 'warning' | 'error'
    ai: 'healthy' | 'warning' | 'error'
    storage: 'healthy' | 'warning' | 'error'
  }
}

interface User {
  id: string
  email: string
  plan: string
  createdAt: string
  lastLoginAt: string
  projectsCount: number
  generationsUsed: number
  isActive: boolean
}

interface SystemAlert {
  id: string
  type: 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: string
  resolved: boolean
}

interface UsageMetric {
  date: string
  users: number
  projects: number
  generations: number
  revenue: number
}

export default function AdminPanel() {
  const { user } = useUser()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [alerts, setAlerts] = useState<SystemAlert[]>([])
  const [metrics, setMetrics] = useState<UsageMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Vérifier si l'utilisateur est admin
  const isAdmin = user?.publicMetadata?.role === 'admin'

  useEffect(() => {
    if (!isAdmin) return

    const loadAdminData = async () => {
      try {
        setLoading(true)

        // Charger les statistiques
        const statsResponse = await fetch('/api/admin/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }

        // Charger les utilisateurs
        const usersResponse = await fetch('/api/admin/users')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setUsers(usersData)
        }

        // Charger les alertes
        const alertsResponse = await fetch('/api/admin/alerts')
        if (alertsResponse.ok) {
          const alertsData = await alertsResponse.json()
          setAlerts(alertsData)
        }

        // Charger les métriques
        const metricsResponse = await fetch('/api/admin/metrics')
        if (metricsResponse.ok) {
          const metricsData = await metricsResponse.json()
          setMetrics(metricsData)
        }

      } catch (error) {
        console.error('Erreur chargement données admin:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAdminData()
  }, [isAdmin])

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <Shield className="h-12 w-12 mx-auto text-red-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Accès Refusé</h2>
              <p className="text-muted-foreground">
                Vous n'avez pas les permissions nécessaires pour accéder au panel d'administration.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Panel d'Administration
          </h1>
          <p className="text-muted-foreground mt-2">
            Gestion et monitoring de la plateforme Rork AI Builder
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="destructive" className="flex items-center space-x-1">
            <Shield className="h-3 w-3" />
            <span>Admin</span>
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Statistiques rapides */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Utilisateurs</p>
                  <p className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% ce mois
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Projets</p>
                  <p className="text-2xl font-bold">{stats.totalProjects.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8% ce mois
                  </p>
                </div>
                <Database className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Générations</p>
                  <p className="text-2xl font-bold">{stats.totalGenerations.toLocaleString()}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Revenus</p>
                  <p className="text-2xl font-bold">€{stats.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +15% ce mois
                  </p>
                </div>
                <Crown className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Santé du système */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Santé du Système</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(stats.systemHealth).map(([service, status]) => (
                <div key={service} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-2">
                    {status === 'healthy' && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {status === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                    {status === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                    <span className="font-medium capitalize">{service}</span>
                  </div>
                  <Badge variant={
                    status === 'healthy' ? 'default' : 
                    status === 'warning' ? 'secondary' : 'destructive'
                  }>
                    {status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contenu principal avec tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Métriques d'utilisation */}
            <Card>
              <CardHeader>
                <CardTitle>Métriques d'Utilisation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Utilisateurs Actifs</span>
                      <span>{stats?.activeUsers || 0}</span>
                    </div>
                    <Progress value={((stats?.activeUsers || 0) / (stats?.totalUsers || 1)) * 100} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Générations ce mois</span>
                      <span>{stats?.totalGenerations || 0}</span>
                    </div>
                    <Progress value={75} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Projets créés</span>
                      <span>{stats?.totalProjects || 0}</span>
                    </div>
                    <Progress value={60} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alertes récentes */}
            <Card>
              <CardHeader>
                <CardTitle>Alertes Récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alerts.slice(0, 5).map((alert) => (
                    <div key={alert.id} className={`flex items-start space-x-3 p-3 rounded-lg ${
                      alert.type === 'error' ? 'bg-red-50 dark:bg-red-950' :
                      alert.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-950' :
                      'bg-blue-50 dark:bg-blue-950'
                    }`}>
                      {alert.type === 'error' && <XCircle className="h-4 w-4 text-red-600 mt-0.5" />}
                      {alert.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />}
                      {alert.type === 'info' && <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5" />}
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{alert.title}</h4>
                        <p className="text-xs text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!alert.resolved && (
                        <Button size="sm" variant="outline">
                          Résoudre
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Gestion des Utilisateurs</span>
                <Button size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                        {user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-medium">{user.email}</h4>
                        <p className="text-sm text-muted-foreground">
                          Inscrit le {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                          <span>{user.projectsCount} projets</span>
                          <span>{user.generationsUsed} générations</span>
                          <span className={`flex items-center space-x-1 ${
                            user.isActive ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              user.isActive ? 'bg-green-600' : 'bg-gray-400'
                            }`}></div>
                            <span>{user.isActive ? 'Actif' : 'Inactif'}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={
                        user.plan === 'FREE' ? 'secondary' :
                        user.plan === 'PRO' ? 'default' : 'destructive'
                      }>
                        {user.plan}
                      </Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Alertes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className={`flex items-start justify-between p-4 border rounded-lg ${
                    alert.resolved ? 'opacity-60' : ''
                  }`}>
                    <div className="flex items-start space-x-3">
                      {alert.type === 'error' && <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
                      {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />}
                      {alert.type === 'info' && <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />}
                      <div>
                        <h4 className="font-medium">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {alert.resolved ? (
                        <Badge variant="secondary">Résolue</Badge>
                      ) : (
                        <>
                          <Button size="sm" variant="outline">
                            Résoudre
                          </Button>
                          <Button size="sm" variant="destructive">
                            Supprimer
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Évolution des Utilisateurs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Graphique des utilisateurs (à implémenter)
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Graphique des revenus (à implémenter)
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
