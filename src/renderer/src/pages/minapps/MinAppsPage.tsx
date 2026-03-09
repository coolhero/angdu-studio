import { useState, useCallback } from 'react'
import { ErrorBoundary } from '@renderer/components/ErrorBoundary'
import { useMiniAppsStore } from '@renderer/stores/useMiniAppsStore'
import { useRuntimeStore } from '@renderer/stores/useRuntimeStore'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@renderer/components/ui/dialog'
import { Plus, Pencil, Trash2, Globe, ArrowLeft } from 'lucide-react'

interface MiniAppFormData {
  name: string
  url: string
  icon?: string
}

interface EditingApp {
  id: string
  name: string
  url: string
  icon?: string
}

function MinAppsPageContent({ onNavigate }: { onNavigate?: (appId: string) => void }): JSX.Element {
  const miniApps = useMiniAppsStore((s) => s.miniApps)
  const addMiniApp = useMiniAppsStore((s) => s.addMiniApp)
  const updateMiniApp = useMiniAppsStore((s) => s.updateMiniApp)
  const removeMiniApp = useMiniAppsStore((s) => s.removeMiniApp)
  const reorderMiniApps = useMiniAppsStore((s) => s.reorderMiniApps)

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editingApp, setEditingApp] = useState<EditingApp | null>(null)
  const [formData, setFormData] = useState<MiniAppFormData>({ name: '', url: '', icon: '' })
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const sortedApps = [...miniApps].sort((a, b) => a.order - b.order)

  const resetForm = useCallback(() => {
    setFormData({ name: '', url: '', icon: '' })
  }, [])

  const handleAdd = useCallback(() => {
    if (!formData.name.trim() || !formData.url.trim()) return
    addMiniApp({
      name: formData.name.trim(),
      url: formData.url.trim(),
      icon: formData.icon?.trim() || undefined
    })
    resetForm()
    setAddDialogOpen(false)
  }, [formData, addMiniApp, resetForm])

  const handleEditSave = useCallback(() => {
    if (!editingApp || !formData.name.trim() || !formData.url.trim()) return
    updateMiniApp(editingApp.id, {
      name: formData.name.trim(),
      url: formData.url.trim(),
      icon: formData.icon?.trim() || undefined
    })
    setEditingApp(null)
    resetForm()
  }, [editingApp, formData, updateMiniApp, resetForm])

  const handleEditClick = useCallback(
    (app: EditingApp, e: React.MouseEvent) => {
      e.stopPropagation()
      setEditingApp(app)
      setFormData({ name: app.name, url: app.url, icon: app.icon ?? '' })
    },
    []
  )

  const handleDeleteClick = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation()
      removeMiniApp(id)
    },
    [removeMiniApp]
  )

  const handleCardClick = useCallback(
    (appId: string) => {
      onNavigate?.(appId)
    },
    [onNavigate]
  )

  // Native drag-and-drop reorder
  const handleDragStart = useCallback((id: string) => {
    setDraggedId(id)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(
    (targetId: string) => {
      if (!draggedId || draggedId === targetId) return
      const currentOrder = sortedApps.map((a) => a.id)
      const dragIndex = currentOrder.indexOf(draggedId)
      const dropIndex = currentOrder.indexOf(targetId)
      if (dragIndex === -1 || dropIndex === -1) return

      const newOrder = [...currentOrder]
      newOrder.splice(dragIndex, 1)
      newOrder.splice(dropIndex, 0, draggedId)
      reorderMiniApps(newOrder)
      setDraggedId(null)
    },
    [draggedId, sortedApps, reorderMiniApps]
  )

  const handleDragEnd = useCallback(() => {
    setDraggedId(null)
  }, [])

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => useRuntimeStore.getState().setActivePage('chat')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Mini Apps</h1>
        </div>
        <Button size="sm" onClick={() => { resetForm(); setAddDialogOpen(true) }}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-auto p-6">
        {sortedApps.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-zinc-400">No mini apps yet. Click Add to create one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {sortedApps.map((app) => (
              <div
                key={app.id}
                draggable
                onDragStart={() => handleDragStart(app.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(app.id)}
                onDragEnd={handleDragEnd}
                onClick={() => handleCardClick(app.id)}
                className={`group relative flex cursor-pointer flex-col items-center gap-3 rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 ${
                  draggedId === app.id ? 'opacity-50' : ''
                }`}
              >
                {/* Icon */}
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 text-2xl dark:bg-zinc-800">
                  {app.icon ? (
                    <span>{app.icon}</span>
                  ) : (
                    <Globe className="h-6 w-6 text-zinc-400" />
                  )}
                </div>

                {/* Name */}
                <span className="max-w-full truncate text-sm font-medium">{app.name}</span>

                {/* URL */}
                <span className="max-w-full truncate text-xs text-zinc-400">{app.url}</span>

                {/* Action buttons */}
                <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => handleEditClick({ id: app.id, name: app.name, url: app.url, icon: app.icon }, e)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-red-500 hover:text-red-600"
                    onClick={(e) => handleDeleteClick(app.id, e)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Mini App</DialogTitle>
            <DialogDescription>Create a new mini app with a name, URL, and optional icon.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="add-name">Name</label>
              <Input
                id="add-name"
                placeholder="App name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="add-url">URL</label>
              <Input
                id="add-url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="add-icon">Icon (emoji or URL)</label>
              <Input
                id="add-icon"
                placeholder="Optional icon"
                value={formData.icon ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!formData.name.trim() || !formData.url.trim()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editingApp !== null} onOpenChange={(open) => { if (!open) setEditingApp(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Mini App</DialogTitle>
            <DialogDescription>Update the mini app details.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="edit-name">Name</label>
              <Input
                id="edit-name"
                placeholder="App name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="edit-url">URL</label>
              <Input
                id="edit-url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="edit-icon">Icon (emoji or URL)</label>
              <Input
                id="edit-icon"
                placeholder="Optional icon"
                value={formData.icon ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingApp(null)}>Cancel</Button>
            <Button onClick={handleEditSave} disabled={!formData.name.trim() || !formData.url.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function MinAppsPage({ onNavigate }: { onNavigate?: (appId: string) => void }): JSX.Element {
  return (
    <ErrorBoundary>
      <MinAppsPageContent onNavigate={onNavigate} />
    </ErrorBoundary>
  )
}
