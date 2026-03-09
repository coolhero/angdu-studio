import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useRuntimeStore } from '@renderer/stores/useRuntimeStore'
import { useAssistantsStore } from '@renderer/stores/useAssistantsStore'
import { useSettingsStore } from '@renderer/stores/useSettingsStore'
import Chat from './Chat'
import HomeTabs from './Tabs'
import Navbar from './Navbar'

function HomePage(): JSX.Element {
  const activeAssistantId = useRuntimeStore((s) => s.activeAssistantId)
  const activeTopicId = useRuntimeStore((s) => s.activeTopicId)
  const setActiveAssistant = useRuntimeStore((s) => s.setActiveAssistant)
  const setActiveTopic = useRuntimeStore((s) => s.setActiveTopic)

  const assistants = useAssistantsStore((s) => s.assistants)
  const getAssistant = useAssistantsStore((s) => s.getAssistant)
  const hydrate = useAssistantsStore((s) => s.hydrate)

  const showAssistants = useSettingsStore((s) => s.showAssistants)
  const showTopics = useSettingsStore((s) => s.showTopics)
  const topicPosition = useSettingsStore((s) => s.topicPosition)
  const narrowMode = useSettingsStore((s) => s.narrowMode)

  const showSidebar = showAssistants || showTopics

  // Hydrate assistants on mount
  useEffect(() => {
    hydrate()
  }, [hydrate])

  // Auto-select first assistant and topic if none active
  useEffect(() => {
    if (assistants.length === 0) return

    if (!activeAssistantId || !getAssistant(activeAssistantId)) {
      const firstAssistant = assistants[0]
      setActiveAssistant(firstAssistant.id)

      if (firstAssistant.topics.length > 0) {
        setActiveTopic(firstAssistant.topics[0].id)
      }
    } else if (!activeTopicId) {
      const assistant = getAssistant(activeAssistantId)
      if (assistant && assistant.topics.length > 0) {
        setActiveTopic(assistant.topics[0].id)
      }
    }
  }, [assistants, activeAssistantId, activeTopicId, getAssistant, setActiveAssistant, setActiveTopic])

  // Resolve active assistant and topic
  const assistant = activeAssistantId ? getAssistant(activeAssistantId) : undefined
  const topic = assistant?.topics.find((t) => t.id === activeTopicId)

  const sidebarElement = (
    <AnimatePresence>
      {showSidebar && !narrowMode && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 260, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
          className="overflow-hidden"
        >
          <HomeTabs />
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className="flex h-full flex-col">
      <Navbar assistant={assistant} topic={topic} />
      <div className="flex flex-1 overflow-hidden">
        {topicPosition === 'left' && sidebarElement}

        <div className="flex flex-1 flex-col overflow-hidden">
          {assistant && topic ? (
            <Chat assistant={assistant} topic={topic} />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-zinc-400">Loading...</p>
            </div>
          )}
        </div>

        {topicPosition === 'right' && sidebarElement}
      </div>
    </div>
  )
}

export default HomePage
