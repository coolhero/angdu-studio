'use client'

import { useState } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from '../ui/popover'
import { Input } from '../ui/input'
import { cn } from '../../lib/utils'

const PRESET_COLORS = [
  '#1890ff',
  '#f5222d',
  '#fa541c',
  '#faad14',
  '#52c41a',
  '#13c2c2',
  '#2f54eb',
  '#722ed1',
  '#eb2f96',
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
}

function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [hexInput, setHexInput] = useState(value)

  function handleHexChange(input: string) {
    setHexInput(input)
    if (/^#[0-9a-fA-F]{6}$/.test(input)) {
      onChange(input)
    }
  }

  function handlePresetClick(color: string) {
    setHexInput(color)
    onChange(color)
  }

  return (
    <Popover>
      <PopoverTrigger className="rounded-md border border-zinc-200 p-1 dark:border-zinc-700">
        <div
          className="h-6 w-6 rounded"
          style={{ backgroundColor: value }}
        />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 space-y-3 p-3">
        <div className="grid grid-cols-5 gap-2">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={cn(
                'h-7 w-7 rounded-md border-2 transition-transform hover:scale-110',
                value === color
                  ? 'border-zinc-900 dark:border-zinc-100'
                  : 'border-transparent',
              )}
              style={{ backgroundColor: color }}
              onClick={() => handlePresetClick(color)}
              aria-label={`Select color ${color}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-8 w-8 shrink-0 rounded-md border border-zinc-200 dark:border-zinc-700"
            style={{ backgroundColor: value }}
          />
          <Input
            className="h-8 text-xs"
            value={hexInput}
            onChange={(e) => handleHexChange(e.target.value)}
            placeholder="#000000"
            maxLength={7}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

export { ColorPicker, PRESET_COLORS }
export type { ColorPickerProps }
