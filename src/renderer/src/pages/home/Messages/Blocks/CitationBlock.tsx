import React from 'react'
import { Globe, BookOpen, Brain } from 'lucide-react'
import { cn } from '@renderer/lib/utils'
import type { CitationMessageBlock } from '@renderer/types/message-block'

interface CitationBlockProps {
  block: CitationMessageBlock
  isStreaming: boolean
}

const CitationBlock: React.FC<CitationBlockProps> = ({ block }) => {
  const results = block.response?.results
  const knowledge = block.knowledge
  const memories = block.memories

  const hasContent =
    (results && results.length > 0) ||
    (knowledge && knowledge.length > 0) ||
    (memories && memories.length > 0)

  if (!hasContent) return null

  return (
    <div className="my-2 space-y-2">
      {/* Web search results */}
      {results && results.length > 0 && (
        <div className="rounded-md border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-3 py-1.5 dark:border-zinc-700">
            <Globe className="h-3.5 w-3.5 text-blue-500" />
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Sources
            </span>
          </div>
          <ol className="list-none space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800">
            {results.map((result, index) => (
              <li key={`${result.url}-${index}`} className="px-3 py-2">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-blue-600 group-hover:underline dark:text-blue-400">
                        {result.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                        {result.snippet}
                      </p>
                    </div>
                  </div>
                </a>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Knowledge references */}
      {knowledge && knowledge.length > 0 && (
        <div className="rounded-md border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-3 py-1.5 dark:border-zinc-700">
            <BookOpen className="h-3.5 w-3.5 text-purple-500" />
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Knowledge
            </span>
          </div>
          <ul className="list-none space-y-0 divide-y divide-zinc-100 dark:divide-zinc-800">
            {knowledge.map((ref) => (
              <li key={ref.id} className="px-3 py-2">
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {ref.name}
                </p>
                {ref.content && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {ref.content}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Memory items */}
      {memories && memories.length > 0 && (
        <div className="rounded-md border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-3 py-1.5 dark:border-zinc-700">
            <Brain className="h-3.5 w-3.5 text-green-500" />
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Memories
            </span>
          </div>
          <ul className="list-none divide-y divide-zinc-100 dark:divide-zinc-800">
            {memories.map((memory) => (
              <li key={memory.id} className="px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400">
                {memory.content}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default React.memo(CitationBlock)
