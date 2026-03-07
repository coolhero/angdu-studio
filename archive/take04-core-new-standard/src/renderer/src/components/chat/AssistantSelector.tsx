import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { Assistant } from '@shared/types'

interface AssistantSelectorProps {
  assistants: Assistant[]
  activeAssistant: Assistant
  onSelect: (id: string) => void
}

export function AssistantSelector({ assistants, activeAssistant, onSelect }: AssistantSelectorProps) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-none">
        <span>{activeAssistant.emoji ?? '🤖'}</span>
        <span className="flex-1 truncate text-left">{activeAssistant.name}</span>
        <ChevronDown size={14} className="text-muted-foreground" />
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[12rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md"
          sideOffset={4}
          align="start"
        >
          {assistants.map((a) => (
            <DropdownMenu.Item
              key={a.id}
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent focus:bg-accent"
              onSelect={() => onSelect(a.id)}
            >
              <span>{a.emoji ?? '🤖'}</span>
              <span className="flex-1 truncate">{a.name}</span>
              {a.id === activeAssistant.id && (
                <Check size={14} className="text-primary" />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
