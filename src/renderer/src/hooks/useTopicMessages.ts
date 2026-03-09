import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMessageStore } from '@renderer/stores/useMessageStore'
import { useMessageBlockStore } from '@renderer/stores/useMessageBlockStore'

const LOAD_MORE_COUNT = 20
const EMPTY_IDS: string[] = []

export function useTopicMessages(topicId: string | null) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  // Select raw state — stable references (no function calls in selectors)
  const messageIds = useMessageStore((s) =>
    topicId ? (s.messagesByTopic[topicId] ?? EMPTY_IDS) : EMPTY_IDS
  )
  const messagesMap = useMessageStore((s) => s.messages)
  const displayCount = useMessageStore((s) =>
    topicId ? (s.displayCount[topicId] ?? 0) : 0
  )
  const loadMessagesForTopic = useMessageStore((s) => s.loadMessagesForTopic)
  const loadMoreMessages = useMessageStore((s) => s.loadMoreMessages)
  const loadBlocksForMessages = useMessageBlockStore(
    (s) => s.loadBlocksForMessages
  )

  // Derive messages from raw state — only recomputes when inputs change
  const messages = useMemo(() => {
    if (messageIds.length === 0) return []
    return messageIds
      .map((id) => messagesMap[id])
      .filter(Boolean)
  }, [messageIds, messagesMap])

  useEffect(() => {
    if (!topicId) return

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      try {
        await loadMessagesForTopic(topicId)
        const ids = useMessageStore
          .getState()
          .messagesByTopic[topicId] ?? []
        if (ids.length > 0) {
          await loadBlocksForMessages(ids)
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [topicId, loadMessagesForTopic, loadBlocksForMessages])

  const loadMore = useCallback(async () => {
    if (!topicId || isLoading) return

    const countBefore = (useMessageStore
      .getState()
      .messagesByTopic[topicId] ?? []).length

    setIsLoading(true)
    try {
      await loadMoreMessages(topicId, LOAD_MORE_COUNT)

      const currentIds = useMessageStore
        .getState()
        .messagesByTopic[topicId] ?? []
      const countAfter = currentIds.length
      const newIds = currentIds.slice(0, countAfter - countBefore)

      if (newIds.length > 0) {
        await loadBlocksForMessages(newIds)
      }

      if (countAfter - countBefore < LOAD_MORE_COUNT) {
        setHasMore(false)
      }
    } finally {
      setIsLoading(false)
    }
  }, [topicId, isLoading, loadMoreMessages, loadBlocksForMessages])

  return { messages, isLoading, loadMore, hasMore, displayCount }
}
