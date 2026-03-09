import React, { useEffect, useRef } from 'react'
import type { MainTextMessageBlock } from '@renderer/types/message-block'
import { MessageBlockStatus } from '@renderer/types/message-block'
import { useSmoothStream } from '@renderer/hooks/useSmoothStream'
import Markdown from '../../Markdown/Markdown'

interface MainTextBlockProps {
  block: MainTextMessageBlock
  isStreaming: boolean
}

const MainTextBlock: React.FC<MainTextBlockProps> = ({ block, isStreaming }) => {
  const { displayedText, addChunk, flush, reset } = useSmoothStream()
  const prevContentLenRef = useRef(0)
  const isBlockStreaming =
    isStreaming && block.status === MessageBlockStatus.STREAMING

  useEffect(() => {
    if (!isBlockStreaming) {
      flush()
      prevContentLenRef.current = 0
      return
    }

    const content = block.content ?? ''
    const prevLen = prevContentLenRef.current

    if (content.length > prevLen) {
      const newChunk = content.slice(prevLen)
      addChunk(newChunk)
      prevContentLenRef.current = content.length
    }
  }, [block.content, isBlockStreaming, addChunk, flush])

  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  const content = isBlockStreaming ? displayedText : (block.content ?? '')

  if (!content) return null

  return <Markdown content={content} isStreaming={isBlockStreaming} />
}

export default React.memo(MainTextBlock)
