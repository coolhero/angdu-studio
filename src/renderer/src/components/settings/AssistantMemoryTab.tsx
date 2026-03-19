import { Settings, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAssistantStore } from '@renderer/stores/useAssistantStore'
import { useMemoryStore } from '@renderer/stores/useMemoryStore'
import { Switch } from '@renderer/components/ui/switch'
import { Button } from '@renderer/components/ui/button'
import { Label } from '@renderer/components/ui/label'

interface AssistantMemoryTabProps {
  assistantId: string
}

/**
 * Assistant settings: Memory tab.
 * Enable/disable toggle, settings link, stored count, alerts.
 * Matches source AssistantMemorySettings.
 */
export default function AssistantMemoryTab({ assistantId }: AssistantMemoryTabProps) {
  const navigate = useNavigate()
  const { assistants, updateAssistant } = useAssistantStore()
  const config = useMemoryStore((s) => s.config)

  const assistant = assistants.find((a) => a.id === assistantId)
  if (!assistant) return null

  const globalEnabled = config?.enabled ?? false
  const hasModel = !!config?.embeddingModel
  const canEnable = globalEnabled && hasModel

  const handleToggle = (enabled: boolean) => {
    updateAssistant(assistantId, { enableMemory: enabled })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Memory</Label>
          <p className="text-xs text-muted-foreground">Enable AI to remember facts from conversations</p>
        </div>
        <Switch
          checked={assistant.enableMemory ?? false}
          onCheckedChange={handleToggle}
          disabled={!canEnable}
        />
      </div>

      {!globalEnabled && (
        <div className="flex items-start gap-2 rounded-md bg-yellow-500/10 p-3 text-xs text-yellow-600 dark:text-yellow-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <p>Global memory is disabled.</p>
            <p>Enable it in Settings → Memory to use memory with this assistant.</p>
          </div>
        </div>
      )}

      {globalEnabled && !hasModel && (
        <div className="flex items-start gap-2 rounded-md bg-yellow-500/10 p-3 text-xs text-yellow-600 dark:text-yellow-400">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <div>
            <p>Memory requires an embedding model to be configured.</p>
            <p>Go to Settings → Memory to set up models.</p>
          </div>
        </div>
      )}

      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={() => navigate('/settings/memory')}
      >
        <Settings className="h-3.5 w-3.5" />
        Memory Settings
      </Button>
    </div>
  )
}
