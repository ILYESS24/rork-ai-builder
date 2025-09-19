'use client'

import React, { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { 
  Code, 
  Users, 
  Zap, 
  Database, 
  TrendingUp, 
  Clock, 
  Star,
  Download,
  Share,
  Settings,
  Plus,
  Eye,
  Edit,
  Trash2,
  Crown,
  Sparkles,
  BarChart3,
  Activity,
  Globe,
  Lock,
  Unlock
} from 'lucide-react'
import { useRealtimeCollaboration } from '@/lib/collaboration/realtime-collaboration'
import { MonitoringService } from '@/lib/monitoring/sentry-config'

interface DashboardStats {
  totalProjects: number
  totalGenerations: number
  totalViews: number
  totalLikes: number
  totalCollaborators: number
  storageUsed: number
  storageLimit: number
  generationsUsed: number
  generationsLimit: number
  projectsCount: number
  projectsLimit: number
}

interface Project {
  id: string
  name: string
  description: string
  framework: string
  isPublic: boolean
  viewsCount: number
  likesCount: number
  forksCount: number
  createdAt: string
  updatedAt: string
  collaborators: number
}

interface Template {
  id: string
  name: string
  description: string
  category: string
  downloadsCount: number
  rating: number
  isOfficial: boolean
  isPremium: boolean
}

interface Notification {
  id: string
  type: string
  title: string
  content: string
  isRead: boolean
  createdAt: string
}

interface CollaborationUser {
  id: string
  name: string
  email: string
  avatar?: string
  cursor: { x: number; y: number }
  color: string
}

export default function AdvancedDashboard() {
  const { user } = useUser()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [collaborationUsers, setCollaborationUsers] = useState<CollaborationUser[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Collaboration temps réel
  const { users: realtimeUsers, connected: collaborationConnected } = useRealtimeCollaboration(
    'dashboard',
    user?.id || '',
    user?.fullName || '',
    user?.primaryEmailAddress?.emailAddress || '',
    user?.imageUrl
  )

  useEffect(() => {
    setCollaborationUsers(realtimeUsers)
  }, [realtimeUsers])

  // Charger les données du dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        
        // Charger les statistiques
        const statsResponse = await fetch('/api/dashboard/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }

        // Charger les projets
        const projectsResponse = await fetch('/api/dashboard/projects')
        if (projectsResponse.ok) {
          const projectsData = await projectsResponse.json()
          setProjects(projectsData)
        }

        // Charger les templates
        const templatesResponse = await fetch('/api/dashboard/templates')
        if (templatesResponse.ok) {
          const templatesData = await templatesResponse.json()
          setTemplates(templatesData)
        }

        // Charger les notifications
        const notificationsResponse = await fetch('/api/dashboard/notifications')
        if (notificationsResponse.ok) {
          const notificationsData = await notificationsResponse.json()
          setNotifications(notificationsData)
        }

        // Capturer l'utilisation du dashboard
        MonitoringService.captureUsageMetric(user?.id || 'anonymous', 'dashboard_viewed', {
          timestamp: new Date().toISOString(),
        })

      } catch (error) {
        MonitoringService.captureError(error as Error, { component: 'AdvancedDashboard' })
        console.error('Erreur chargement dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [user])

  const handleCreateProject = async () => {
    try {
      MonitoringService.captureUsageMetric(user?.id || 'anonymous', 'project_creation_started')
      
      // Rediriger vers l'éditeur avec un nouveau projet
      window.location.href = '/editor/new'
    } catch (error) {
      MonitoringService.captureError(error as Error, { action: 'create_project' })
    }
  }

  const handleProjectAction = async (projectId: string, action: string) => {
    try {
      MonitoringService.captureUsageMetric(user?.id || 'anonymous', `project_${action}`, { projectId })
      
      switch (action) {
        case 'view':
          window.open(`/editor/${projectId}`, '_blank')
          break
        case 'share':
          // Ouvrir modal de partage
          break
        case 'delete':
          if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
            await fetch(`/api/projects/${projectId}`, { method: 'DELETE' })
            setProjects(projects.filter(p => p.id !== projectId))
          }
          break
      }
    } catch (error) {
      MonitoringService.captureError(error as Error, { action, projectId })
    }
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
      {/* Header avec stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projets</p>
                <p className="text-2xl font-bold">{stats?.totalProjects || 0}</p>
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
                <p className="text-2xl font-bold">{stats?.totalGenerations || 0}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vues</p>
                <p className="text-2xl font-bold">{stats?.totalViews || 0}</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Collaborateurs</p>
                <p className="text-2xl font-bold">{collaborationUsers.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barres de progression pour les limites */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>Stockage</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{Math.round((stats.storageUsed / (1024 * 1024)))} MB</span>
                  <span>{stats.storageLimit === -1 ? '∞' : `${stats.storageLimit} MB`}</span>
                </div>
                <Progress 
                  value={stats.storageLimit === -1 ? 0 : (stats.storageUsed / (stats.storageLimit * 1024 * 1024)) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <Zap className="h-4 w-4" />
                <span>Générations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{stats.generationsUsed}</span>
                  <span>{stats.generationsLimit === -1 ? '∞' : stats.generationsLimit}</span>
                </div>
                <Progress 
                  value={stats.generationsLimit === -1 ? 0 : (stats.generationsUsed / stats.generationsLimit) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <Code className="h-4 w-4" />
                <span>Projets</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{stats.projectsCount}</span>
                  <span>{stats.projectsLimit === -1 ? '∞' : stats.projectsLimit}</span>
                </div>
                <Progress 
                  value={stats.projectsLimit === -1 ? 0 : (stats.projectsCount / stats.projectsLimit) * 100} 
                  className="h-2"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contenu principal avec tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="projects">Mes Projets</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Projets récents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Projets Récents</span>
                  <Button size="sm" onClick={handleCreateProject}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projects.slice(0, 5).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{project.name}</h4>
                          <Badge variant="outline">{project.framework}</Badge>
                          {project.isPublic ? (
                            <Globe className="h-4 w-4 text-green-600" />
                          ) : (
                            <Lock className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                          <span className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{project.viewsCount}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Star className="h-3 w-3" />
                            <span>{project.likesCount}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{project.collaborators}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => handleProjectAction(project.id, 'view')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleProjectAction(project.id, 'share')}>
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Collaborateurs actifs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Collaborateurs Actifs</span>
                  <Badge variant={collaborationConnected ? 'default' : 'secondary'}>
                    {collaborationConnected ? 'Connecté' : 'Déconnecté'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {collaborationUsers.length > 0 ? (
                    collaborationUsers.map((user) => (
                      <div key={user.id} className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                          style={{ backgroundColor: user.color }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      Aucun collaborateur actif
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Mes Projets</h2>
            <Button onClick={handleCreateProject}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Projet
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{project.name}</span>
                    <Badge variant="outline">{project.framework}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{project.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span className="flex items-center space-x-1">
                      <Eye className="h-3 w-3" />
                      <span>{project.viewsCount}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>{project.likesCount}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{project.collaborators}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button size="sm" className="flex-1" onClick={() => handleProjectAction(project.id, 'view')}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ouvrir
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleProjectAction(project.id, 'share')}>
                      <Share className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleProjectAction(project.id, 'delete')}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Templates</h2>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Créer Template
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{template.name}</span>
                    <div className="flex items-center space-x-2">
                      {template.isOfficial && <Crown className="h-4 w-4 text-yellow-500" />}
                      {template.isPremium && <Sparkles className="h-4 w-4 text-purple-500" />}
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <span className="flex items-center space-x-1">
                      <Download className="h-3 w-3" />
                      <span>{template.downloadsCount}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Star className="h-3 w-3" />
                      <span>{template.rating.toFixed(1)}</span>
                    </span>
                  </div>

                  <Button size="sm" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Utiliser
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <h2 className="text-2xl font-bold">Activité Récente</h2>
          
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className={`flex items-start space-x-3 p-3 rounded-lg ${notification.isRead ? 'bg-muted/50' : 'bg-blue-50 dark:bg-blue-950'}`}>
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground">{notification.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
