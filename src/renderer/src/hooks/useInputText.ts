import { useState, useCallback, useEffect } from 'react'

const DRAFT_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours

interface DraftEntry {
  text: string
  timestamp: number
}

function getDraftKey(topicId: string | null): string {
  return `draft:${topicId ?? 'new'}`
}

function loadDraft(topicId: string | null): string {
  try {
    const key = getDraftKey(topicId)
    const raw = localStorage.getItem(key)
    if (!raw) return ''

    const entry: DraftEntry = JSON.parse(raw)
    if (Date.now() - entry.timestamp > DRAFT_TTL_MS) {
      localStorage.removeItem(key)
      return ''
    }

    return entry.text
  } catch {
    return ''
  }
}

function saveDraft(topicId: string | null, text: string): void {
  try {
    const key = getDraftKey(topicId)
    if (!text) {
      localStorage.removeItem(key)
      return
    }
    const entry: DraftEntry = { text, timestamp: Date.now() }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    // localStorage may be full or unavailable
  }
}

export function useInputText(topicId: string | null) {
  const [text, setTextState] = useState(() => loadDraft(topicId))

  // Reload draft when topicId changes
  useEffect(() => {
    setTextState(loadDraft(topicId))
  }, [topicId])

  const setText = useCallback(
    (value: string) => {
      setTextState(value)
      saveDraft(topicId, value)
    },
    [topicId]
  )

  const clearText = useCallback(() => {
    setTextState('')
    try {
      localStorage.removeItem(getDraftKey(topicId))
    } catch {
      // ignore
    }
  }, [topicId])

  return { text, setText, clearText }
}
