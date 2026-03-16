import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Send, Square, Paperclip } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@renderer/components/ui/button'
import { useChatStore, useIsStreaming } from '@renderer/stores/useChatStore'
import { useSettingsStore } from '@renderer/stores/useSettingsStore'
import { useDraftStore } from '@renderer/stores/useDraftStore'
import { useTopicStore } from '@renderer/stores/useTopicStore'

interface MessageInputProps {
  /** Pre-fill the editor with text (for edit mode) */
  editText?: string
  editMessageId?: string
  onCancelEdit?: () => void
}

export function MessageInput({ editText, editMessageId, onCancelEdit }: MessageInputProps) {
  const { t } = useTranslation()
  const isStreaming = useIsStreaming()
  const sendKey = useSettingsStore((s) => s.sendKey)
  const activeTopicId = useTopicStore((s) => s.activeTopicId)
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [isComposing, setIsComposing] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: false
      }),
      Placeholder.configure({
        placeholder: t('chat.inputPlaceholder', '메시지를 입력하세요...')
      })
    ],
    content: editText ?? '',
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[40px] max-h-[200px] overflow-y-auto px-3 py-2 text-sm'
      },
      handleKeyDown: (_view, event) => {
        if (isComposing) return false

        const isEnter = event.key === 'Enter'
        const hasModifier = event.ctrlKey || event.metaKey

        if (sendKey === 'enter' && isEnter && !event.shiftKey && !hasModifier) {
          event.preventDefault()
          handleSend()
          return true
        }

        if (sendKey === 'ctrl+enter' && isEnter && hasModifier) {
          event.preventDefault()
          handleSend()
          return true
        }

        return false
      }
    },
    onUpdate: ({ editor: ed }) => {
      // Debounced draft save
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current)
      draftTimerRef.current = setTimeout(() => {
        const topicId = useTopicStore.getState().activeTopicId
        if (topicId) {
          useDraftStore.getState().saveDraft(topicId, {
            text: ed.getHTML(),
            plainText: ed.getText(),
            attachments: [],
            updatedAt: new Date().toISOString()
          })
        }
      }, 500)
    }
  })

  // Restore draft on topic switch
  useEffect(() => {
    if (!editor || editText !== undefined) return

    if (activeTopicId) {
      const draft = useDraftStore.getState().loadDraft(activeTopicId)
      if (draft?.text) {
        editor.commands.setContent(draft.text)
      } else {
        editor.commands.clearContent()
      }
    } else {
      editor.commands.clearContent()
    }
  }, [activeTopicId, editor]) // eslint-disable-line react-hooks/exhaustive-deps

  // Set edit text
  useEffect(() => {
    if (editor && editText !== undefined) {
      editor.commands.setContent(editText)
      editor.commands.focus('end')
    }
  }, [editText, editor])

  // Handle IME composition
  useEffect(() => {
    if (!editor) return
    const el = editor.view.dom
    const handleCompositionStart = () => setIsComposing(true)
    const handleCompositionEnd = () => setIsComposing(false)
    el.addEventListener('compositionstart', handleCompositionStart)
    el.addEventListener('compositionend', handleCompositionEnd)
    return () => {
      el.removeEventListener('compositionstart', handleCompositionStart)
      el.removeEventListener('compositionend', handleCompositionEnd)
    }
  }, [editor])

  const handleSend = useCallback(() => {
    if (!editor || isStreaming) return
    const text = editor.getText().trim()
    if (!text) return

    if (editMessageId && onCancelEdit) {
      // Edit mode — edit and resend
      useChatStore.getState().editAndResend(editMessageId, text)
      onCancelEdit()
    } else {
      // Normal send
      useChatStore.getState().sendMessage(text)
    }

    editor.commands.clearContent()

    // Clear draft
    const topicId = useTopicStore.getState().activeTopicId
    if (topicId) {
      useDraftStore.getState().clearDraft(topicId)
    }
  }, [editor, isStreaming, editMessageId, onCancelEdit])

  const handleStop = useCallback(() => {
    useChatStore.getState().stopGeneration()
  }, [])

  const handleFileAttach = useCallback(async () => {
    const result = await window.api.invoke['dialog:openFile']({
      properties: ['openFile', 'multiSelections']
    })
    if (result) {
      // TODO: Handle file attachments in future phase
      console.log('Files selected:', result)
    }
  }, [])

  // Cleanup draft timer
  useEffect(() => {
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current)
    }
  }, [])

  return (
    <div className="shrink-0 border-t border-border bg-background p-3">
      {editMessageId && onCancelEdit && (
        <div className="mb-2 flex items-center justify-between rounded bg-muted px-3 py-1.5 text-xs text-muted-foreground">
          <span>{t('chat.editingMessage', '메시지 수정 중...')}</span>
          <Button variant="ghost" size="sm" className="h-5 px-2 text-xs" onClick={onCancelEdit}>
            {t('common.cancel', '취소')}
          </Button>
        </div>
      )}
      <div className="flex items-end gap-2 rounded-lg border border-border bg-background">
        <Button
          variant="ghost"
          size="icon"
          className="mb-1 ml-1 h-8 w-8 shrink-0"
          onClick={handleFileAttach}
          title={t('chat.attachFile', '파일 첨부')}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <EditorContent editor={editor} />
        </div>
        <div className="mb-1 mr-1 shrink-0">
          {isStreaming ? (
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8"
              onClick={handleStop}
              title={t('chat.stop', '중지')}
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="default"
              size="icon"
              className="h-8 w-8"
              onClick={handleSend}
              disabled={!editor?.getText().trim()}
              title={t('chat.send', '전송')}
            >
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="mt-1 text-right text-xs text-muted-foreground">
        {sendKey === 'enter'
          ? t('chat.sendKeyHint', 'Enter로 전송, Shift+Enter로 줄바꿈')
          : t('chat.sendKeyHintCtrl', 'Ctrl+Enter로 전송, Enter로 줄바꿈')}
      </div>
    </div>
  )
}
