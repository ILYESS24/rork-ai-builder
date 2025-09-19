'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { RefreshCw, ExternalLink, Smartphone, Tablet, Monitor } from 'lucide-react'

interface CodePreviewProps {
  code: string
}

export default function CodePreview({ code }: CodePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState('')
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

  useEffect(() => {
    if (code) {
      // Créer un blob URL pour le code HTML
      const blob = new Blob([code], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)

      // Nettoyer l'ancien URL
      return () => {
        URL.revokeObjectURL(url)
      }
    } else {
      setPreviewUrl('')
    }
  }, [code])

  const deviceClasses = {
    desktop: 'w-full h-full',
    tablet: 'w-full h-full max-w-md mx-auto',
    mobile: 'w-full h-full max-w-sm mx-auto'
  }

  const refreshPreview = () => {
    if (previewUrl) {
      const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement
      if (iframe) {
        iframe.src = iframe.src
      }
    }
  }

  const openInNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank')
    }
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Preview</CardTitle>
          <div className="flex items-center gap-2">
            {/* Device Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <Button
                variant={deviceView === 'desktop' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDeviceView('desktop')}
                className="h-8 w-8 p-0"
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={deviceView === 'tablet' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDeviceView('tablet')}
                className="h-8 w-8 p-0"
              >
                <Tablet className="h-4 w-4" />
              </Button>
              <Button
                variant={deviceView === 'mobile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setDeviceView('mobile')}
                className="h-8 w-8 p-0"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Action Buttons */}
            <Button variant="outline" size="sm" onClick={refreshPreview}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={openInNewTab}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-4">
        <div className={`h-full border rounded-lg overflow-hidden bg-white ${deviceClasses[deviceView]}`}>
          {previewUrl ? (
            <iframe
              id="preview-iframe"
              src={previewUrl}
              title="App Preview"
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Aperçu de votre application</p>
                <p className="text-sm">
                  Décrivez votre application dans le chat pour voir le code généré ici
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
