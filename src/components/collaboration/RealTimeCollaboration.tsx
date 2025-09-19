'use client'

import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Wifi, WifiOff, Share } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Collaborator {
  id: string
  name: string
  avatar?: string
  color: string
  cursor?: {
    x: number
    y: number
    element?: string
  }
  isActive: boolean
  lastSeen: Date
}

interface RealTimeCollaborationProps {
  roomId: string
  userId: string
  userName: string
  onCodeChange?: (code: string) => void
  onCursorChange?: (cursor: { x: number; y: number }) => void
}

export default function RealTimeCollaboration({
  roomId,
  userId,
  userName,
  onCodeChange,
  onCursorChange
}: RealTimeCollaborationProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    // Initialiser Socket.io
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3001', {
      query: {
        roomId,
        userId,
        userName,
      },
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      setShareUrl(`${window.location.origin}/collaborate/${roomId}`)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    newSocket.on('collaborators', (users: Collaborator[]) => {
      setCollaborators(users)
    })

    newSocket.on('code-change', (data: { code: string; userId: string }) => {
      if (data.userId !== userId && onCodeChange) {
        onCodeChange(data.code)
      }
    })

    newSocket.on('cursor-change', (data: { cursor: { x: number; y: number }; userId: string }) => {
      if (data.userId !== userId && onCursorChange) {
        onCursorChange(data.cursor)
      }
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [roomId, userId, userName, onCodeChange, onCursorChange])

  const sendCodeChange = useCallback((code: string) => {
    if (socket && isConnected) {
      socket.emit('code-change', { code, userId })
    }
  }, [socket, isConnected, userId])

  const sendCursorChange = useCallback((cursor: { x: number; y: number }) => {
    if (socket && isConnected) {
      socket.emit('cursor-change', { cursor, userId })
    }
  }, [socket, isConnected, userId])

  const copyShareUrl = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      // Toast de succès (à implémenter)
    } catch (err) {
      console.error('Erreur lors de la copie:', err)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getRandomColor = (id: string) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ]
    const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[index % colors.length]
  }

  return (
    <div className="space-y-4">
      {/* Status et partage */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Collaboration
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3 mr-1" />
                    Connecté
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3 mr-1" />
                    Déconnecté
                  </>
                )}
              </Badge>
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={copyShareUrl}
              disabled={!isConnected}
            >
              <Share className="h-4 w-4 mr-2" />
              Partager
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Liste des collaborateurs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Collaborateurs ({collaborators.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <AnimatePresence>
              {collaborators.map((collaborator) => (
                <motion.div
                  key={collaborator.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={collaborator.avatar} />
                    <AvatarFallback className={`text-white text-xs ${getRandomColor(collaborator.id)}`}>
                      {getInitials(collaborator.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {collaborator.name}
                      </span>
                      {collaborator.isActive && (
                        <motion.div
                          className="h-2 w-2 bg-green-500 rounded-full"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {collaborator.isActive 
                        ? 'En ligne' 
                        : `Vu il y a ${Math.round((Date.now() - collaborator.lastSeen.getTime()) / 60000)} min`
                      }
                    </p>
                  </div>
                  {collaborator.cursor && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>Ligne {Math.floor(collaborator.cursor.y / 20) + 1}</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Indicateurs de curseur en temps réel */}
      {collaborators.map((collaborator) => (
        collaborator.cursor && collaborator.isActive && collaborator.id !== userId && (
          <motion.div
            key={`cursor-${collaborator.id}`}
            className="absolute pointer-events-none z-50"
            style={{
              left: collaborator.cursor.x,
              top: collaborator.cursor.y,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center gap-1">
              <div className={`w-0.5 h-5 ${getRandomColor(collaborator.id).replace('bg-', 'bg-')}`} />
              <div className={`px-2 py-1 rounded text-xs text-white ${getRandomColor(collaborator.id)}`}>
                {collaborator.name}
              </div>
            </div>
          </motion.div>
        )
      ))}
    </div>
  )
}
