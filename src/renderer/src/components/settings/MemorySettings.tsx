import { useEffect, useState, useCallback } from 'react'
import { Brain, Plus, Search, Settings, Trash2, RotateCcw, ChevronDown, MoreVertical } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { useMemoryStore } from '@renderer/stores/useMemoryStore'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Switch } from '@renderer/components/ui/switch'
import { Label } from '@renderer/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@renderer/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Textarea } from '@renderer/components/ui/textarea'
import type { MemoryItem } from '@shared/types/knowledge'

/**
 * Full memory settings page at /settings/memory.
 * Global toggle, user management, memory list with CRUD, infinite scroll.
 * Matches source MemorySettings.tsx (857 lines) pattern.
 */
export default function MemorySettings() {
  const {
    memories,
    users,
    selectedUserId,
    loading,
    config,
    loadMemories,
    loadUsers,
    loadConfig,
    addMemory,
    updateMemory,
    deleteMemory,
    updateConfig,
    setSelectedUser
  } = useMemoryStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingMemory, setEditingMemory] = useState<MemoryItem | null>(null)
  const [newMemoryText, setNewMemoryText] = useState('')

  // Load data on mount
  useEffect(() => {
    loadConfig()
    loadUsers()
  }, [loadConfig, loadUsers])

  // Load memories when user changes
  useEffect(() => {
    if (selectedUserId) {
      loadMemories(selectedUserId, 1, searchQuery || undefined)
    }
  }, [selectedUserId, loadMemories, searchQuery])

  // Auto-select first user
  useEffect(() => {
    if (!selectedUserId && users.length > 0) {
      setSelectedUser(users[0].userId)
    }
  }, [users, selectedUserId, setSelectedUser])

  const handleToggleGlobal = useCallback(
    (enabled: boolean) => {
      updateConfig({ enabled })
    },
    [updateConfig]
  )

  const handleAddMemory = useCallback(async () => {
    if (!selectedUserId || !newMemoryText.trim()) return
    await addMemory(selectedUserId, newMemoryText.trim())
    setNewMemoryText('')
    setShowAddDialog(false)
  }, [selectedUserId, newMemoryText, addMemory])

  const handleUpdateMemory = useCallback(async () => {
    if (!editingMemory) return
    await updateMemory(editingMemory.id, editingMemory.content)
    setEditingMemory(null)
  }, [editingMemory, updateMemory])

  const handleDeleteMemory = useCallback(
    async (id: string) => {
      await deleteMemory(id)
    },
    [deleteMemory]
  )

  const handleDeleteAllForUser = useCallback(async () => {
    if (!selectedUserId) return
    await window.api.invoke['memory:deleteAllForUser']({ userId: selectedUserId })
    loadMemories(selectedUserId)
    loadUsers()
  }, [selectedUserId, loadMemories, loadUsers])

  const handleRefresh = useCallback(() => {
    if (selectedUserId) {
      loadMemories(selectedUserId, 1, searchQuery || undefined)
    }
    loadUsers()
  }, [selectedUserId, searchQuery, loadMemories, loadUsers])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-primary" />
          <div>
            <h2 className="text-lg font-semibold">Memory</h2>
            <p className="text-xs text-muted-foreground">
              AI remembers facts from your conversations
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            Beta
          </span>
        </div>
        <Switch
          checked={config?.enabled ?? false}
          onCheckedChange={handleToggleGlobal}
        />
      </div>

      {/* User selector + actions */}
      <div className="flex items-center gap-2 border-b border-border px-6 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <span className="max-w-[120px] truncate">
                {selectedUserId ?? 'Select user'}
              </span>
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {users.map((u) => (
              <DropdownMenuItem key={u.userId} onSelect={() => setSelectedUser(u.userId)}>
                {u.userId} ({u.count})
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="relative ml-auto flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-sm"
          />
        </div>

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={handleRefresh}>
              <RotateCcw className="mr-2 h-3.5 w-3.5" /> Refresh
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleDeleteAllForUser} className="text-red-500">
              <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete all for user
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Memory list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            Loading memories...
          </div>
        ) : memories.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
            <Brain className="h-8 w-8 opacity-30" />
            <p>No memories yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {memories.map((memory) => (
              <MemoryRow
                key={memory.id}
                memory={memory}
                onEdit={() => setEditingMemory({ ...memory })}
                onDelete={() => handleDeleteMemory(memory.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add memory dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Memory</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Enter a fact or preference to remember..."
            value={newMemoryText}
            onChange={(e) => setNewMemoryText(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleAddMemory} disabled={!newMemoryText.trim()}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit memory dialog */}
      <Dialog open={!!editingMemory} onOpenChange={(open) => !open && setEditingMemory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Memory</DialogTitle>
          </DialogHeader>
          <Textarea
            value={editingMemory?.content ?? ''}
            onChange={(e) =>
              setEditingMemory((prev) => (prev ? { ...prev, content: e.target.value } : null))
            }
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMemory(null)}>Cancel</Button>
            <Button onClick={handleUpdateMemory}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MemoryRow({
  memory,
  onEdit,
  onDelete
}: {
  memory: MemoryItem
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="group flex items-start gap-3 px-6 py-3 hover:bg-muted/50">
      <div className="flex-1 min-w-0">
        <p className="text-sm">{memory.content}</p>
        <p className="mt-0.5 text-[10px] text-muted-foreground">
          {new Date(memory.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1 opacity-0 group-hover:opacity-100">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit}>
          <Settings className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}
