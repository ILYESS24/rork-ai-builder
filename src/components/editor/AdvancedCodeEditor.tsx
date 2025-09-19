'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Editor } from '@monaco-editor/react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Placeholder from '@tiptap/extension-placeholder'
import { lowlight } from 'lowlight'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Code, 
  FileText, 
  Play, 
  Download, 
  Share, 
  Settings,
  Copy,
  Undo,
  Redo,
  Save,
  Maximize,
  Minimize,
  Eye,
  EyeOff
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdvancedCodeEditorProps {
  code: string
  onChange: (code: string) => void
  language?: string
  theme?: 'light' | 'dark'
  readOnly?: boolean
  showPreview?: boolean
  onPreviewToggle?: (show: boolean) => void
  onSave?: () => void
  onRun?: () => void
  onShare?: () => void
}

export default function AdvancedCodeEditor({
  code,
  onChange,
  language = 'html',
  theme = 'dark',
  readOnly = false,
  showPreview = false,
  onPreviewToggle,
  onSave,
  onRun,
  onShare,
}: AdvancedCodeEditorProps) {
  const [mounted, setMounted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [editorTheme, setEditorTheme] = useState(theme === 'dark' ? 'vs-dark' : 'light')
  const [currentLanguage, setCurrentLanguage] = useState(language)
  const [wordCount, setWordCount] = useState(0)
  const [lineCount, setLineCount] = useState(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const editorRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Configuration TipTap pour l'éditeur de documentation
  const tipTapEditor = useEditor({
    extensions: [
      StarterKit,
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Placeholder.configure({
        placeholder: 'Documentez votre code...',
      }),
    ],
    content: `
      <h2>Documentation du Code</h2>
      <p>Ce composant génère une interface utilisateur moderne avec les fonctionnalités suivantes :</p>
      <ul>
        <li>Design responsive</li>
        <li>Thème sombre/clair</li>
        <li>Animations fluides</li>
      </ul>
      <h3>Utilisation</h3>
      <pre><code>npm install rork-ai-builder
npm run dev</code></pre>
    `,
  })

  // Statistiques du code
  useEffect(() => {
    if (code) {
      setWordCount(code.split(/\s+/).filter(word => word.length > 0).length)
      setLineCount(code.split('\n').length)
    }
  }, [code])

  // Gestion du thème
  useEffect(() => {
    setEditorTheme(theme === 'dark' ? 'vs-dark' : 'light')
  }, [theme])

  // Gestion du fullscreen
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'F11') {
        event.preventDefault()
        setIsFullscreen(!isFullscreen)
      }
    }

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isFullscreen])

  // Configuration Monaco Editor
  const handleEditorDidMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor

    // Configuration des thèmes personnalisés
    monaco.editor.defineTheme('rork-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: '569CD6' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'tag', foreground: '569CD6' },
        { token: 'attribute.name', foreground: '92C5F8' },
        { token: 'attribute.value', foreground: 'CE9178' },
      ],
      colors: {
        'editor.background': '#1a1a1a',
        'editor.foreground': '#d4d4d4',
        'editorCursor.foreground': '#ffffff',
        'editor.selectionBackground': '#264f78',
        'editor.lineHighlightBackground': '#2a2d2e',
      },
    })

    monaco.editor.defineTheme('rork-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },
        { token: 'keyword', foreground: '0000ff' },
        { token: 'string', foreground: 'a31515' },
        { token: 'number', foreground: '098658' },
        { token: 'tag', foreground: '800000' },
        { token: 'attribute.name', foreground: 'ff0000' },
        { token: 'attribute.value', foreground: '0451a5' },
      ],
      colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#000000',
        'editorCursor.foreground': '#000000',
        'editor.selectionBackground': '#add6ff',
        'editor.lineHighlightBackground': '#f0f0f0',
      },
    })

    // Appliquer le thème personnalisé
    monaco.editor.setTheme(theme === 'dark' ? 'rork-dark' : 'rork-light')

    // Configuration des raccourcis clavier
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave?.()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyR, () => {
      onRun?.()
    })

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
      editor.getAction('actions.find').run()
    })

    // Événements
    editor.onDidChangeModelContent(() => {
      setHasUnsavedChanges(true)
    })

    setMounted(true)
  }, [theme, onSave, onRun])

  // Gestion des changements
  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      onChange(value)
      setHasUnsavedChanges(true)
    }
  }, [onChange])

  // Actions
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code)
  }, [code])

  const handleUndo = useCallback(() => {
    editorRef.current?.trigger('keyboard', 'undo', null)
  }, [])

  const handleRedo = useCallback(() => {
    editorRef.current?.trigger('keyboard', 'redo', null)
  }, [])

  const handleSave = useCallback(() => {
    onSave?.()
    setHasUnsavedChanges(false)
  }, [onSave])

  const handleRun = useCallback(() => {
    onRun?.()
  }, [onRun])

  const handleShare = useCallback(() => {
    onShare?.()
  }, [onShare])

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen)
  }, [isFullscreen])

  const togglePreview = useCallback(() => {
    onPreviewToggle?.(!showPreview)
  }, [showPreview, onPreviewToggle])

  // Langages supportés
  const supportedLanguages = [
    { value: 'html', label: 'HTML', icon: '🌐' },
    { value: 'css', label: 'CSS', icon: '🎨' },
    { value: 'javascript', label: 'JavaScript', icon: '⚡' },
    { value: 'typescript', label: 'TypeScript', icon: '📘' },
    { value: 'jsx', label: 'JSX', icon: '⚛️' },
    { value: 'tsx', label: 'TSX', icon: '⚛️' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'json', label: 'JSON', icon: '📄' },
    { value: 'markdown', label: 'Markdown', icon: '📝' },
  ]

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex flex-col h-full",
        isFullscreen && "fixed inset-0 z-50 bg-background"
      )}
    >
      {/* Header avec toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <span>{supportedLanguages.find(lang => lang.value === currentLanguage)?.icon}</span>
            <span>{supportedLanguages.find(lang => lang.value === currentLanguage)?.label}</span>
          </Badge>
          
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <span>{lineCount} lignes</span>
            <span>•</span>
            <span>{wordCount} mots</span>
            {hasUnsavedChanges && (
              <>
                <span>•</span>
                <span className="text-orange-500">Modifications non sauvegardées</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" onClick={handleUndo} disabled={readOnly}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRedo} disabled={readOnly}>
            <Redo className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-1" />
          
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleSave} disabled={readOnly}>
            <Save className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRun}>
            <Play className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShare}>
            <Share className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-1" />
          
          <Button variant="ghost" size="sm" onClick={togglePreview}>
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex">
        {/* Éditeur principal */}
        <div className={cn(
          "flex-1 flex flex-col",
          showPreview && "w-1/2"
        )}>
          <Tabs defaultValue="code" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="code" className="flex items-center space-x-2">
                <Code className="h-4 w-4" />
                <span>Code</span>
              </TabsTrigger>
              <TabsTrigger value="docs" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Documentation</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="code" className="flex-1 mt-0">
              <Editor
                height="100%"
                language={currentLanguage}
                value={code}
                onChange={handleEditorChange}
                theme={editorTheme}
                options={{
                  readOnly,
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: 'on',
                  formatOnPaste: true,
                  formatOnType: true,
                  tabSize: 2,
                  insertSpaces: true,
                  renderWhitespace: 'selection',
                  bracketPairColorization: { enabled: true },
                  guides: { bracketPairs: true, indentation: true },
                  suggestOnTriggerCharacters: true,
                  acceptSuggestionOnEnter: 'on',
                  quickSuggestions: true,
                  parameterHints: { enabled: true },
                  hover: { enabled: true },
                  contextmenu: true,
                  mouseWheelZoom: true,
                  smoothScrolling: true,
                  cursorBlinking: 'smooth',
                  cursorSmoothCaretAnimation: true,
                }}
                onMount={handleEditorDidMount}
              />
            </TabsContent>
            
            <TabsContent value="docs" className="flex-1 mt-0 p-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <EditorContent editor={tipTapEditor} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview panel */}
        {showPreview && (
          <div className="w-1/2 border-l">
            <div className="h-full">
              <iframe
                srcDoc={code}
                title="Code Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
