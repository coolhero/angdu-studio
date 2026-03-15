import { useState, useCallback, type MouseEvent as ReactMouseEvent } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Tab } from '@shared/types/navigation'
import { useTabsStore, useTabsList, useActiveTabId } from '../../stores/useTabsStore'
import { NavigationService } from '../../services/NavigationService'
import { TabItem } from './TabItem'
import { TabContextMenu } from './TabContextMenu'

interface SortableTabProps {
  tab: Tab
  isActive: boolean
  onContextMenu: (e: ReactMouseEvent, tabId: string) => void
}

function SortableTab({ tab, isActive, onContextMenu }: SortableTabProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: tab.id,
    disabled: !tab.closable // Home tab is non-draggable
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  const handleClick = useCallback(() => {
    useTabsStore.getState().setActiveTab(tab.id)
    NavigationService.navigate(tab.route)
  }, [tab.id, tab.route])

  const handleClose = useCallback(() => {
    useTabsStore.getState().removeTab(tab.id)
  }, [tab.id])

  const handleContextMenu = useCallback(
    (e: ReactMouseEvent) => {
      e.preventDefault()
      onContextMenu(e, tab.id)
    },
    [tab.id, onContextMenu]
  )

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TabItem
        id={tab.id}
        title={tab.title}
        isActive={isActive}
        closable={tab.closable}
        onClick={handleClick}
        onClose={handleClose}
        onContextMenu={handleContextMenu}
      />
    </div>
  )
}

export function TabBar() {
  const tabs = useTabsList()
  const activeTabId = useActiveTabId()
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    tabId: string
    closable: boolean
  } | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = tabs.findIndex((t) => t.id === active.id)
      const newIndex = tabs.findIndex((t) => t.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = arrayMove(tabs, oldIndex, newIndex)
        useTabsStore.getState().reorderTabs(reordered)
      }
    },
    [tabs]
  )

  const handleContextMenu = useCallback(
    (e: ReactMouseEvent, tabId: string) => {
      const tab = tabs.find((t) => t.id === tabId)
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        tabId,
        closable: tab?.closable ?? false
      })
    },
    [tabs]
  )

  return (
    <>
      <div className="flex items-center gap-0.5 overflow-x-auto px-1">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={tabs.map((t) => t.id)} strategy={horizontalListSortingStrategy}>
            {tabs.map((tab) => (
              <SortableTab
                key={tab.id}
                tab={tab}
                isActive={tab.id === activeTabId}
                onContextMenu={handleContextMenu}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {contextMenu && (
        <TabContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          tabId={contextMenu.tabId}
          closable={contextMenu.closable}
          onClose={() => setContextMenu(null)}
          onCloseTab={(id) => useTabsStore.getState().removeTab(id)}
          onCloseOthers={(id) => useTabsStore.getState().closeOthers(id)}
          onCloseAll={() => useTabsStore.getState().closeAll()}
        />
      )}
    </>
  )
}
