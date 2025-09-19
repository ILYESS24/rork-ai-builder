'use client'

import { Editor } from '@monaco-editor/react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

interface MonacoCodeEditorProps {
  code: string
  onChange: (code: string) => void
  language?: string
  height?: string | number
  readOnly?: boolean
}

export default function MonacoCodeEditor({
  code,
  onChange,
  language = 'html',
  height = '100%',
  readOnly = false,
}: MonacoCodeEditorProps) {
  const [mounted, setMounted] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800 rounded-md">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onChange(value)
    }
  }

  return (
    <div className="w-full h-full border rounded-md overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={code}
        onChange={handleEditorChange}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
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
          bracketPairColorization: {
            enabled: true,
          },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
        }}
        onMount={(editor, monaco) => {
          // Configuration des thèmes personnalisés
          monaco.editor.defineTheme('custom-light', {
            base: 'vs',
            inherit: true,
            rules: [],
            colors: {
              'editor.background': '#ffffff',
              'editor.foreground': '#000000',
            },
          })

          monaco.editor.defineTheme('custom-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
              'editor.background': '#1e1e1e',
              'editor.foreground': '#d4d4d4',
            },
          })

          // Appliquer le thème personnalisé
          if (theme === 'dark') {
            monaco.editor.setTheme('custom-dark')
          } else {
            monaco.editor.setTheme('custom-light')
          }
        }}
      />
    </div>
  )
}