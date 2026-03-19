import { useState, useCallback, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { BookOpen, Plus, Database } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@renderer/components/ui/context-menu'
import {
  useKnowledgeStore,
  useKnowledgeBases,
  useSelectedBaseId,
  useSelectedBase
} from '@renderer/stores/useKnowledgeStore'
import { KnowledgeContent } from './knowledge/KnowledgeContent'
import { AddKBPopup } from './knowledge/components/AddKBPopup'
import type { KnowledgeBase } from '@shared/types/knowledge'

// --- Sortable sidebar item ---

interface SortableBaseItemProps {
  base: KnowledgeBase
  isActive: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

function SortableBaseItem({
  base,
  isActive,
  onSelect,
  onDelete
}: SortableBaseItemProps) {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: base.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          onClick={() => onSelect(base.id)}
          className={`cursor-pointer rounded-md px-3 py-2 text-sm transition-colors ${
            isActive
              ? 'bg-accent text-accent-foreground'
              : 'hover:bg-accent/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{base.name}</span>
          </div>
          <div className="ml-6 mt-0.5 text-xs text-muted-foreground">
            {base.items.length} {t('knowledge.items', 'items')}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          className="text-destructive"
          onClick={() => onDelete(base.id)}
        >
          {t('knowledge.delete', 'Delete')}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}

// --- Main Page ---

export default function KnowledgePage() {
  const { t } = useTranslation()
  const bases = useKnowledgeBases()
  const selectedBaseId = useSelectedBaseId()
  const selectedBase = useSelectedBase()
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // Hydrate on mount
  useEffect(() => {
    useKnowledgeStore.getState().hydrate()
  }, [])

  const handleSelect = useCallback((id: string) => {
    useKnowledgeStore.getState().setSelectedBaseId(id)
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      if (
        !confirm(
          t(
            'knowledge.deleteConfirm',
            'Are you sure you want to delete this knowledge base?'
          )
        )
      ) {
        return
      }
      await window.api.invoke['kb:delete'](id)
      useKnowledgeStore.getState().deleteBase(id)
    },
    [t]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = bases.findIndex((b) => b.id === active.id)
      const newIndex = bases.findIndex((b) => b.id === over.id)
      if (oldIndex === -1 || newIndex === -1) return

      useKnowledgeStore.getState().reorderBases(oldIndex, newIndex)
    },
    [bases]
  )

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="flex w-64 shrink-0 flex-col border-r">
        {/* Sidebar header */}
        <div className="flex items-center justify-between border-b px-3 py-2">
          <h2 className="text-sm font-semibold">
            {t('knowledge.title', 'Knowledge')}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setAddDialogOpen(true)}
            title={t('knowledge.createKB', 'Create Knowledge Base')}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Base list */}
        <div className="flex-1 overflow-y-auto p-2">
          {bases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <BookOpen className="mb-2 h-8 w-8" />
              <p className="text-xs">
                {t(
                  'knowledge.emptyState',
                  'No knowledge bases yet. Click + to create one.'
                )}
              </p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={bases.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-1">
                  {bases.map((base) => (
                    <SortableBaseItem
                      key={base.id}
                      base={base}
                      isActive={base.id === selectedBaseId}
                      onSelect={handleSelect}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1">
        {selectedBase ? (
          <KnowledgeContent base={selectedBase} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
            <BookOpen className="h-12 w-12" />
            <p className="text-sm">
              {bases.length > 0
                ? t('knowledge.selectKB', 'Select a knowledge base')
                : t(
                    'knowledge.getStarted',
                    'Create a knowledge base to get started'
                  )}
            </p>
            {bases.length === 0 && (
              <Button
                variant="outline"
                onClick={() => setAddDialogOpen(true)}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                {t('knowledge.createKB', 'Create Knowledge Base')}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add KB Dialog */}
      <AddKBPopup open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  )
}
