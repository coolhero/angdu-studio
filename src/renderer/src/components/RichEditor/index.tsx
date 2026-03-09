import React, { useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Mention from '@tiptap/extension-mention'
import { useTranslation } from 'react-i18next'
import { cn } from '@renderer/lib/utils'

interface RichEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  onSubmit?: () => void
  disabled?: boolean
  className?: string
}

const RichEditor: React.FC<RichEditorProps> = ({
  content,
  onChange,
  placeholder,
  onSubmit,
  disabled = false,
  className,
}) => {
  const { t } = useTranslation()

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        listItem: false,
        bulletList: false,
        orderedList: false,
      }),
      Placeholder.configure({
        placeholder: placeholder ?? t('chat.input.placeholder', 'Type a message...'),
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion: {
          char: '@',
          items: ({ query }) => {
            // Model mentions — will be populated by future features
            return [
              { id: 'gpt-4', label: 'GPT-4' },
              { id: 'claude-3', label: 'Claude 3' },
            ].filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
          },
        },
      }),
    ],
    content,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm dark:prose-invert max-w-none',
          'min-h-[40px] max-h-[200px] overflow-y-auto',
          'px-3 py-2 outline-none',
          'text-sm text-zinc-900 dark:text-zinc-100'
        ),
      },
      handleKeyDown: (_view, event) => {
        if (event.key === 'Enter' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
          event.preventDefault()
          onSubmit?.()
          return true
        }
        return false
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML())
    },
  })

  // Sync external content changes
  useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content, false)
    }
  }, [content, editor])

  // Sync disabled state
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled)
    }
  }, [disabled, editor])

  return (
    <div
      className={cn(
        'rounded-lg border border-zinc-300 bg-zinc-50',
        'focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500',
        'dark:border-zinc-600 dark:bg-zinc-800',
        'dark:focus-within:border-blue-400 dark:focus-within:ring-blue-400',
        '[&_.tiptap_p.is-editor-empty:first-child::before]:text-zinc-400',
        '[&_.tiptap_p.is-editor-empty:first-child::before]:dark:text-zinc-500',
        '[&_.tiptap_p.is-editor-empty:first-child::before]:float-left',
        '[&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]',
        '[&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none',
        '[&_.tiptap_p.is-editor-empty:first-child::before]:h-0',
        '[&_.mention]:rounded [&_.mention]:bg-blue-100 [&_.mention]:px-1',
        '[&_.mention]:dark:bg-blue-900/40',
        className
      )}
    >
      <EditorContent editor={editor} />
    </div>
  )
}

export default React.memo(RichEditor)
