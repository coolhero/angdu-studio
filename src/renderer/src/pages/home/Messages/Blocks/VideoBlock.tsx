import React from 'react'
import { VideoIcon } from 'lucide-react'
import type { VideoMessageBlock } from '@renderer/types/message-block'

interface VideoBlockProps {
  block: VideoMessageBlock
  isStreaming: boolean
}

const VideoBlock: React.FC<VideoBlockProps> = ({ block }) => {
  const src = block.url || block.filePath

  if (!src) {
    return (
      <div className="my-1 flex h-32 w-48 items-center justify-center rounded-md border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800">
        <VideoIcon className="h-8 w-8 text-zinc-400" />
      </div>
    )
  }

  return (
    <div className="my-1 max-w-lg">
      <video
        src={src}
        controls
        className="max-h-80 w-full rounded-md border border-zinc-200 dark:border-zinc-700"
      >
        <track kind="captions" />
        Your browser does not support the video element.
      </video>
    </div>
  )
}

export default React.memo(VideoBlock)
