import { useCallback, useEffect, useState } from 'react'
import { useMessageStore } from '@renderer/stores/useMessageStore'
import { useMessageBlockStore } from '@renderer/stores/useMessageBlockStore'

const LOAD_MORE_COUNT = 20

export function useTopicMessages(topicId: string | null) {
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const messages = useMessageStore((s) =>
    topicId ? s.getMessagesForTopic(topicId) : []
  )
  const displayCount = useMessageStore((s) =>
    topicId ? s.getDisplayCount(topicId) : 0
  )
  const loadMessagesForTopic = useMessageStore((s) => s.loadMessagesForTopic)
  const loadMoreMessages = useMessageStore((s) => s.loadMoreMessages)
  const loadBlocksForMessages = useMessageBlockStore(
    (s) => s.loadBlocksForMessages
  )

  useEffect(() => {
    if (!topicId) return

    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      try {
        await loadMessagesForTopic(topicId)
        const messageIds = useMessageStore
          .getState()
          .getMessageIdsForTopic(topicId)
        if (messageIds.length > 0) {
          await loadBlocksForMessages(messageIds)
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

    const countBefore = useMessageStore
      .getState()
      .getMessageIdsForTopic(topicId).length

    setIsLoading(true)
    try {
      await loadMoreMessages(topicId, LOAD_MORE_COUNT)

      const countAfter = useMessageStore
        .getState()
        .getMessageIdsForTopic(topicId).length
      const newIds = useMessageStore
        .getState()
        .getMessageIdsForTopic(topicId)
        .slice(0, countAfter - countBefore)

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
