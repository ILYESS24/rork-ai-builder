import { Server as SocketIOServer } from 'socket.io'
import { createServer } from 'http'
import { verify } from 'jsonwebtoken'

interface CollaborationUser {
  id: string
  name: string
  email: string
  avatar?: string
  projectId: string
  role: 'owner' | 'editor' | 'viewer'
  cursor?: {
    x: number
    y: number
  }
  selection?: {
    start: number
    end: number
  }
  color: string
}

interface CollaborationRoom {
  projectId: string
  users: Map<string, CollaborationUser>
  document: string
  lastModified: Date
}

export class WebSocketServer {
  private io: SocketIOServer
  private rooms: Map<string, CollaborationRoom> = new Map()
  private userSockets: Map<string, string> = new Map() // userId -> socketId

  constructor(server: any) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connecté: ${socket.id}`)

      // Authentification
      socket.on('authenticate', async (data: { token: string }) => {
        try {
          const decoded = verify(data.token, process.env.CLERK_SECRET_KEY!) as any
          const userId = decoded.sub
          
          // Stocker l'association userId -> socketId
          this.userSockets.set(userId, socket.id)
          
          // Associer des données utilisateur au socket
          socket.data.userId = userId
          
          socket.emit('authenticated', { success: true, userId })
          console.log(`Utilisateur authentifié: ${userId}`)
        } catch (error) {
          socket.emit('authentication_error', { error: 'Token invalide' })
          socket.disconnect()
        }
      })

      // Rejoindre une room de collaboration
      socket.on('join_collaboration', async (data: { projectId: string, role: string }) => {
        if (!socket.data.userId) {
          socket.emit('error', { message: 'Non authentifié' })
          return
        }

        const { projectId, role } = data
        const userId = socket.data.userId

        try {
          // Vérifier les permissions (à implémenter avec la base de données)
          const hasPermission = await this.checkCollaborationPermission(userId, projectId, role)
          
          if (!hasPermission) {
            socket.emit('error', { message: 'Permission refusée' })
            return
          }

          // Rejoindre la room
          socket.join(projectId)

          // Récupérer ou créer la room
          let room = this.rooms.get(projectId)
          if (!room) {
            room = {
              projectId,
              users: new Map(),
              document: '',
              lastModified: new Date()
            }
            this.rooms.set(projectId, room)
          }

          // Ajouter l'utilisateur à la room
          const user: CollaborationUser = {
            id: userId,
            name: 'Utilisateur', // À récupérer de la base de données
            email: 'user@example.com', // À récupérer de la base de données
            projectId,
            role: role as any,
            color: this.generateUserColor(userId)
          }

          room.users.set(userId, user)

          // Notifier les autres utilisateurs
          socket.to(projectId).emit('user_joined', {
            user,
            timestamp: new Date().toISOString()
          })

          // Envoyer l'état actuel de la room
          socket.emit('room_state', {
            users: Array.from(room.users.values()),
            document: room.document,
            lastModified: room.lastModified
          })

          console.log(`Utilisateur ${userId} a rejoint le projet ${projectId}`)

        } catch (error) {
          console.error('Erreur join_collaboration:', error)
          socket.emit('error', { message: 'Erreur lors de la connexion' })
        }
      })

      // Quitter une room de collaboration
      socket.on('leave_collaboration', (data: { projectId: string }) => {
        const { projectId } = data
        const userId = socket.data.userId

        if (!userId) return

        socket.leave(projectId)

        const room = this.rooms.get(projectId)
        if (room) {
          room.users.delete(userId)
          
          // Notifier les autres utilisateurs
          socket.to(projectId).emit('user_left', {
            userId,
            timestamp: new Date().toISOString()
          })

          // Supprimer la room si elle est vide
          if (room.users.size === 0) {
            this.rooms.delete(projectId)
          }
        }

        console.log(`Utilisateur ${userId} a quitté le projet ${projectId}`)
      })

      // Mise à jour du curseur
      socket.on('cursor_update', (data: { projectId: string, cursor: { x: number, y: number } }) => {
        const { projectId, cursor } = data
        const userId = socket.data.userId

        if (!userId) return

        const room = this.rooms.get(projectId)
        if (room) {
          const user = room.users.get(userId)
          if (user) {
            user.cursor = cursor
            socket.to(projectId).emit('cursor_updated', {
              userId,
              cursor,
              timestamp: new Date().toISOString()
            })
          }
        }
      })

      // Mise à jour de la sélection
      socket.on('selection_update', (data: { projectId: string, selection: { start: number, end: number } }) => {
        const { projectId, selection } = data
        const userId = socket.data.userId

        if (!userId) return

        const room = this.rooms.get(projectId)
        if (room) {
          const user = room.users.get(userId)
          if (user) {
            user.selection = selection
            socket.to(projectId).emit('selection_updated', {
              userId,
              selection,
              timestamp: new Date().toISOString()
            })
          }
        }
      })

      // Mise à jour du document
      socket.on('document_update', (data: { projectId: string, changes: any }) => {
        const { projectId, changes } = data
        const userId = socket.data.userId

        if (!userId) return

        const room = this.rooms.get(projectId)
        if (room) {
          // Appliquer les changements au document
          room.document = this.applyChanges(room.document, changes)
          room.lastModified = new Date()

          // Diffuser les changements aux autres utilisateurs
          socket.to(projectId).emit('document_changed', {
            userId,
            changes,
            timestamp: new Date().toISOString()
          })

          // Sauvegarder en base de données (en arrière-plan)
          this.saveDocumentToDatabase(projectId, room.document, userId)
        }
      })

      // Inviter un utilisateur
      socket.on('invite_user', async (data: { projectId: string, email: string, role: string }) => {
        const { projectId, email, role } = data
        const userId = socket.data.userId

        if (!userId) return

        try {
          // Vérifier que l'utilisateur a le droit d'inviter
          const room = this.rooms.get(projectId)
          const user = room?.users.get(userId)
          
          if (!user || (user.role !== 'owner' && user.role !== 'editor')) {
            socket.emit('error', { message: 'Permission refusée' })
            return
          }

          // Créer l'invitation en base de données
          const invitation = await this.createCollaborationInvitation(projectId, email, role, userId)
          
          // Notifier l'utilisateur invité (si connecté)
          const invitedUserId = await this.getUserIdByEmail(email)
          if (invitedUserId) {
            const invitedUserSocketId = this.userSockets.get(invitedUserId)
            if (invitedUserSocketId) {
              this.io.to(invitedUserSocketId).emit('collaboration_invitation', {
                projectId,
                role,
                inviterName: user.name,
                timestamp: new Date().toISOString()
              })
            }
          }

          socket.emit('invitation_sent', {
            email,
            role,
            timestamp: new Date().toISOString()
          })

        } catch (error) {
          console.error('Erreur invitation:', error)
          socket.emit('error', { message: 'Erreur lors de l\'invitation' })
        }
      })

      // Accepter une invitation
      socket.on('accept_invitation', async (data: { invitationId: string }) => {
        const { invitationId } = data
        const userId = socket.data.userId

        if (!userId) return

        try {
          const invitation = await this.getCollaborationInvitation(invitationId)
          
          if (!invitation) {
            socket.emit('error', { message: 'Invitation non trouvée' })
            return
          }

          // Accepter l'invitation
          await this.acceptCollaborationInvitation(invitationId, userId)

          // Rejoindre automatiquement la collaboration
          socket.emit('invitation_accepted', {
            projectId: invitation.projectId,
            role: invitation.role
          })

        } catch (error) {
          console.error('Erreur acceptation invitation:', error)
          socket.emit('error', { message: 'Erreur lors de l\'acceptation' })
        }
      })

      // Chat en temps réel
      socket.on('chat_message', (data: { projectId: string, message: string }) => {
        const { projectId, message } = data
        const userId = socket.data.userId

        if (!userId) return

        const room = this.rooms.get(projectId)
        const user = room?.users.get(userId)
        
        if (!user) return

        const chatMessage = {
          id: Date.now().toString(),
          userId,
          userName: user.name,
          message,
          timestamp: new Date().toISOString()
        }

        // Diffuser le message à tous les utilisateurs de la room
        this.io.to(projectId).emit('chat_message', chatMessage)

        // Sauvegarder le message en base de données
        this.saveChatMessage(projectId, chatMessage)
      })

      // Déconnexion
      socket.on('disconnect', () => {
        const userId = socket.data.userId
        if (userId) {
          this.userSockets.delete(userId)
          
          // Retirer l'utilisateur de toutes les rooms
          for (const [projectId, room] of this.rooms.entries()) {
            if (room.users.has(userId)) {
              room.users.delete(userId)
              socket.to(projectId).emit('user_left', {
                userId,
                timestamp: new Date().toISOString()
              })

              if (room.users.size === 0) {
                this.rooms.delete(projectId)
              }
            }
          }
        }

        console.log(`Client déconnecté: ${socket.id}`)
      })
    })
  }

  // Méthodes utilitaires
  private generateUserColor(userId: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ]
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  private applyChanges(document: string, changes: any): string {
    // Implémentation simplifiée - en production, utiliser Yjs ou similar
    if (changes.type === 'insert') {
      return document.slice(0, changes.position) + changes.text + document.slice(changes.position)
    } else if (changes.type === 'delete') {
      return document.slice(0, changes.position) + document.slice(changes.position + changes.length)
    }
    return document
  }

  // Méthodes de base de données (à implémenter)
  private async checkCollaborationPermission(userId: string, projectId: string, role: string): Promise<boolean> {
    // TODO: Implémenter avec Prisma
    return true
  }

  private async saveDocumentToDatabase(projectId: string, document: string, userId: string): Promise<void> {
    // TODO: Implémenter avec Prisma
    console.log(`Sauvegarde document pour projet ${projectId}`)
  }

  private async createCollaborationInvitation(projectId: string, email: string, role: string, inviterId: string): Promise<any> {
    // TODO: Implémenter avec Prisma
    return { id: 'invitation-id', projectId, email, role, inviterId }
  }

  private async getUserIdByEmail(email: string): Promise<string | null> {
    // TODO: Implémenter avec Prisma
    return null
  }

  private async getCollaborationInvitation(invitationId: string): Promise<any> {
    // TODO: Implémenter avec Prisma
    return null
  }

  private async acceptCollaborationInvitation(invitationId: string, userId: string): Promise<void> {
    // TODO: Implémenter avec Prisma
    console.log(`Invitation ${invitationId} acceptée par ${userId}`)
  }

  private async saveChatMessage(projectId: string, message: any): Promise<void> {
    // TODO: Implémenter avec Prisma
    console.log(`Message chat sauvegardé pour projet ${projectId}`)
  }

  // Méthodes publiques
  public getRoomStats() {
    const stats = {
      totalRooms: this.rooms.size,
      totalUsers: 0,
      rooms: [] as any[]
    }

    for (const [projectId, room] of this.rooms.entries()) {
      stats.totalUsers += room.users.size
      stats.rooms.push({
        projectId,
        userCount: room.users.size,
        lastModified: room.lastModified
      })
    }

    return stats
  }

  public broadcastToProject(projectId: string, event: string, data: any) {
    this.io.to(projectId).emit(event, data)
  }

  public broadcastToUser(userId: string, event: string, data: any) {
    const socketId = this.userSockets.get(userId)
    if (socketId) {
      this.io.to(socketId).emit(event, data)
    }
  }
}

export default WebSocketServer
