import { Component, useEffect, useState, useCallback, type ReactNode } from 'react'
import { useAssistantStore } from '@renderer/stores/useAssistantStore'
import { useTopicStore, useSidebarVisible } from '@renderer/stores/useTopicStore'
import { useMessageStore } from '@renderer/stores/useMessageStore'
import { useBlockStore } from '@renderer/stores/useBlockStore'
import { initChatStreamListeners } from '@renderer/services/ChatStreamService'
import { AssistantPanel } from './AssistantPanel'
import { ChatArea } from './ChatArea'
import { TopicSidebar } from './TopicSidebar'

// Route-level error boundary (Pattern Constraint)
class ChatErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 p-8">
          <h2 className="text-lg font-bold text-destructive">Chat Error</h2>
          <p className="text-sm text-muted-foreground">{this.state.error?.message}</p>
          <button
            className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

function HomePageContent() {
  const [assistantPanelVisible, setAssistantPanelVisible] = useState(true)
  const topicSidebarVisible = useSidebarVisible()

  // Initialize chat stream listeners and hydrate stores
  useEffect(() => {
    const cleanupStream = initChatStreamListeners()

    // Hydrate assistant store
    useAssistantStore.getState().hydrate().then(async () => {
      const assistantId = useAssistantStore.getState().activeAssistantId
      // Load topics for active assistant
      await useTopicStore.getState().loadTopics(assistantId)
      // Load messages for active topic
      const activeTopicId = useTopicStore.getState().activeTopicId
      if (activeTopicId) {
        await useMessageStore.getState().loadMessages(activeTopicId)
      }
    })

    return () => {
      cleanupStream()
      useBlockStore.getState().clearAll()
    }
  }, [])

  const toggleAssistantPanel = useCallback(() => {
    setAssistantPanelVisible((v) => !v)
  }, [])

  const toggleTopicSidebar = useCallback(() => {
    useTopicStore.getState().toggleSidebar()
  }, [])

  return (
    <div className="flex h-full">
      {/* Assistant Panel — left sidebar with slide transition */}
      <div
        className="overflow-hidden transition-all duration-200 ease-in-out"
        style={{ width: assistantPanelVisible ? 256 : 0 }}
      >
        {assistantPanelVisible && <AssistantPanel />}
      </div>

      {/* Chat Area — center */}
      <ChatArea
        onToggleAssistantPanel={toggleAssistantPanel}
        onToggleTopicSidebar={toggleTopicSidebar}
        assistantPanelVisible={assistantPanelVisible}
        topicSidebarVisible={topicSidebarVisible}
      />

      {/* Topic Sidebar — right with slide transition */}
      <div
        className="overflow-hidden transition-all duration-200 ease-in-out"
        style={{ width: topicSidebarVisible ? 240 : 0 }}
      >
        {topicSidebarVisible && <TopicSidebar />}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <ChatErrorBoundary>
      <HomePageContent />
    </ChatErrorBoundary>
  )
}
