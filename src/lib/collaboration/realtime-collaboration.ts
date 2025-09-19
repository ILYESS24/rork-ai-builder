import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import { io, Socket } from 'socket.io-client'
import { Awareness } from 'y-protocols/awareness'

export interface CollaborationUser {
  id: string
  name: string
  email: string
  avatar?: string
  cursor: {
    x: number
    y: number
  }
  selection?: {
    start: number
    end: number
  }
  color: string
}

export interface CollaborationState {
  users: Map<string, CollaborationUser>
  connected: boolean
  synced: boolean
}

export class RealtimeCollaboration {
  private ydoc: Y.Doc
  private provider: WebsocketProvider | null = null
  private indexeddbProvider: IndexeddbPersistence | null = null
  private socket: Socket | null = null
  private awareness: Awareness | null = null
  private state: CollaborationState
  private callbacks: Map<string, Function[]> = new Map()

  constructor(
    private projectId: string,
    private userId: string,
    private userName: string,
    private userEmail: string,
    private userAvatar?: string
  ) {
    this.ydoc = new Y.Doc()
    this.state = {
      users: new Map(),
      connected: false,
      synced: false,
    }
  }

  // Initialiser la collaboration
  async initialize(): Promise<void> {
    try {
      // Configuration du WebSocket
      const wsUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3001'
      this.socket = io(wsUrl, {
        auth: {
          projectId: this.projectId,
          userId: this.userId,
          userName: this.userName,
          userEmail: this.userEmail,
          userAvatar: this.userAvatar,
        },
      })

      // Configuration Yjs WebSocket Provider
      this.provider = new WebsocketProvider(wsUrl, this.projectId, this.ydoc, {
        awareness: new Awareness(this.ydoc),
      })

      // Configuration de la persistance locale
      this.indexeddbProvider = new IndexeddbPersistence(
        `rork-collaboration-${this.projectId}`,
        this.ydoc
      )

      // Configuration de l'awareness
      this.awareness = this.provider.awareness
      this.setupAwareness()

      // Événements WebSocket
      this.setupSocketEvents()

      // Événements Yjs
      this.setupYjsEvents()

      // Synchronisation initiale
      await this.waitForSync()

    } catch (error) {
      console.error('Erreur initialisation collaboration:', error)
      throw error
    }
  }

  // Configuration de l'awareness pour les curseurs et sélections
  private setupAwareness(): void {
    if (!this.awareness) return

    // Définir les informations utilisateur
    this.awareness.setLocalStateField('user', {
      id: this.userId,
      name: this.userName,
      email: this.userEmail,
      avatar: this.userAvatar,
      color: this.generateUserColor(this.userId),
    })

    // Écouter les changements d'awareness
    this.awareness.on('change', () => {
      this.updateUsersFromAwareness()
    })

    // Mettre à jour la position du curseur
    this.updateCursorPosition = this.updateCursorPosition.bind(this)
    this.updateSelection = this.updateSelection.bind(this)
  }

  // Configuration des événements WebSocket
  private setupSocketEvents(): void {
    if (!this.socket) return

    this.socket.on('connect', () => {
      console.log('Socket connecté:', this.socket?.id)
      this.state.connected = true
      this.emit('connected')
    })

    this.socket.on('disconnect', () => {
      console.log('Socket déconnecté')
      this.state.connected = false
      this.emit('disconnected')
    })

    this.socket.on('user-joined', (user: CollaborationUser) => {
      console.log('Utilisateur rejoint:', user)
      this.state.users.set(user.id, user)
      this.emit('user-joined', user)
    })

    this.socket.on('user-left', (userId: string) => {
      console.log('Utilisateur parti:', userId)
      this.state.users.delete(userId)
      this.emit('user-left', userId)
    })

    this.socket.on('code-changed', (data: { userId: string; changes: any }) => {
      console.log('Code changé par:', data.userId)
      this.emit('remote-change', data)
    })

    this.socket.on('cursor-moved', (data: { userId: string; cursor: any }) => {
      this.updateUserCursor(data.userId, data.cursor)
      this.emit('cursor-moved', data)
    })

    this.socket.on('selection-changed', (data: { userId: string; selection: any }) => {
      this.updateUserSelection(data.userId, data.selection)
      this.emit('selection-changed', data)
    })
  }

  // Configuration des événements Yjs
  private setupYjsEvents(): void {
    // Événement de synchronisation
    this.provider?.on('status', (event: { status: string }) => {
      if (event.status === 'connected') {
        this.state.synced = true
        this.emit('synced')
      } else if (event.status === 'disconnected') {
        this.state.synced = false
        this.emit('unsynced')
      }
    })

    // Événement de changement de document
    this.ydoc.on('update', (update: Uint8Array, origin: any) => {
      if (origin !== 'local') {
        this.emit('document-updated', update)
      }
    })
  }

  // Attendre la synchronisation
  private async waitForSync(): Promise<void> {
    return new Promise((resolve) => {
      if (this.state.synced) {
        resolve()
        return
      }

      const checkSync = () => {
        if (this.state.synced) {
          resolve()
        } else {
          setTimeout(checkSync, 100)
        }
      }

      checkSync()
    })
  }

  // Mettre à jour les utilisateurs depuis l'awareness
  private updateUsersFromAwareness(): void {
    if (!this.awareness) return

    const states = this.awareness.getStates()
    const newUsers = new Map<string, CollaborationUser>()

    states.forEach((state: any, clientId: number) => {
      if (state.user) {
        const user: CollaborationUser = {
          id: state.user.id,
          name: state.user.name,
          email: state.user.email,
          avatar: state.user.avatar,
          cursor: state.cursor || { x: 0, y: 0 },
          selection: state.selection,
          color: state.user.color,
        }
        newUsers.set(user.id, user)
      }
    })

    this.state.users = newUsers
    this.emit('users-updated', Array.from(newUsers.values()))
  }

  // Obtenir le document Yjs
  getYDoc(): Y.Doc {
    return this.ydoc
  }

  // Obtenir un fragment de texte partagé
  getTextFragment(fragmentName: string): Y.Text {
    return this.ydoc.getText(fragmentName)
  }

  // Obtenir un map partagé
  getMapFragment(fragmentName: string): Y.Map<any> {
    return this.ydoc.getMap(fragmentName)
  }

  // Obtenir un array partagé
  getArrayFragment(fragmentName: string): Y.Array<any> {
    return this.ydoc.getArray(fragmentName)
  }

  // Mettre à jour la position du curseur
  updateCursorPosition(x: number, y: number): void {
    if (!this.awareness) return

    const currentState = this.awareness.getLocalState()
    this.awareness.setLocalStateField('cursor', { x, y })
    
    // Envoyer via Socket.io
    if (this.socket) {
      this.socket.emit('cursor-moved', { x, y })
    }
  }

  // Mettre à jour la sélection
  updateSelection(start: number, end: number): void {
    if (!this.awareness) return

    const currentState = this.awareness.getLocalState()
    this.awareness.setLocalStateField('selection', { start, end })
    
    // Envoyer via Socket.io
    if (this.socket) {
      this.socket.emit('selection-changed', { start, end })
    }
  }

  // Mettre à jour le curseur d'un utilisateur
  private updateUserCursor(userId: string, cursor: { x: number; y: number }): void {
    const user = this.state.users.get(userId)
    if (user) {
      user.cursor = cursor
      this.state.users.set(userId, user)
    }
  }

  // Mettre à jour la sélection d'un utilisateur
  private updateUserSelection(userId: string, selection: { start: number; end: number }): void {
    const user = this.state.users.get(userId)
    if (user) {
      user.selection = selection
      this.state.users.set(userId, user)
    }
  }

  // Envoyer un changement de code
  sendCodeChange(changes: any): void {
    if (this.socket) {
      this.socket.emit('code-changed', {
        userId: this.userId,
        changes,
      })
    }
  }

  // Inviter un utilisateur
  inviteUser(email: string, role: 'viewer' | 'editor' = 'viewer'): void {
    if (this.socket) {
      this.socket.emit('invite-user', {
        email,
        role,
        projectId: this.projectId,
      })
    }
  }

  // Accepter une invitation
  acceptInvitation(invitationId: string): void {
    if (this.socket) {
      this.socket.emit('accept-invitation', {
        invitationId,
        userId: this.userId,
      })
    }
  }

  // Gérer les événements
  on(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, [])
    }
    this.callbacks.get(event)?.push(callback)
  }

  off(event: string, callback: Function): void {
    const callbacks = this.callbacks.get(event)
    if (callbacks) {
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any): void {
    const callbacks = this.callbacks.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }

  // Générer une couleur pour l'utilisateur
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

  // Obtenir l'état actuel
  getState(): CollaborationState {
    return { ...this.state }
  }

  // Obtenir les utilisateurs connectés
  getUsers(): CollaborationUser[] {
    return Array.from(this.state.users.values())
  }

  // Vérifier si connecté
  isConnected(): boolean {
    return this.state.connected
  }

  // Vérifier si synchronisé
  isSynced(): boolean {
    return this.state.synced
  }

  // Nettoyer les ressources
  destroy(): void {
    if (this.provider) {
      this.provider.destroy()
    }
    if (this.indexeddbProvider) {
      this.indexeddbProvider.destroy()
    }
    if (this.socket) {
      this.socket.disconnect()
    }
    if (this.ydoc) {
      this.ydoc.destroy()
    }
  }
}

import React from 'react'

// Hook React pour la collaboration
export function useRealtimeCollaboration(
  projectId: string,
  userId: string,
  userName: string,
  userEmail: string,
  userAvatar?: string
) {
  const [collaboration, setCollaboration] = React.useState<RealtimeCollaboration | null>(null)
  const [users, setUsers] = React.useState<CollaborationUser[]>([])
  const [connected, setConnected] = React.useState(false)
  const [synced, setSynced] = React.useState(false)

  React.useEffect(() => {
    const collab = new RealtimeCollaboration(
      projectId,
      userId,
      userName,
      userEmail,
      userAvatar
    )

    collab.on('users-updated', setUsers)
    collab.on('connected', () => setConnected(true))
    collab.on('disconnected', () => setConnected(false))
    collab.on('synced', () => setSynced(true))
    collab.on('unsynced', () => setSynced(false))

    collab.initialize().then(() => {
      setCollaboration(collab)
    })

    return () => {
      collab.destroy()
    }
  }, [projectId, userId, userName, userEmail, userAvatar])

  return {
    collaboration,
    users,
    connected,
    synced,
  }
}
