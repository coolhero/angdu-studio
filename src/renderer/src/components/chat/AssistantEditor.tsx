import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import type { Assistant, AssistantSettings } from '@shared/types/assistant'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@renderer/components/ui/dialog'
import { Button } from '@renderer/components/ui/button'
import { Input } from '@renderer/components/ui/input'
import { Label } from '@renderer/components/ui/label'
import { Textarea } from '@renderer/components/ui/textarea'
import { Slider } from '@renderer/components/ui/slider'

interface AssistantEditorProps {
  assistant?: Assistant | null
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Assistant, 'id' | 'createdAt' | 'updatedAt'>) => void
}

export function AssistantEditor({ assistant, open, onClose, onSave }: AssistantEditorProps) {
  const { t } = useTranslation()
  const isEditing = !!assistant

  const [name, setName] = useState(assistant?.name ?? '')
  const [emoji, setEmoji] = useState(assistant?.emoji ?? '')
  const [description, setDescription] = useState(assistant?.description ?? '')
  const [prompt, setPrompt] = useState(assistant?.prompt ?? 'You are a helpful assistant.')
  const [category, setCategory] = useState(assistant?.category ?? '')
  const [tags, setTags] = useState(assistant?.tags?.join(', ') ?? '')
  const [settings, setSettings] = useState<AssistantSettings>(
    assistant?.settings ?? {
      temperature: 0.7,
      topP: 1,
      maxTokens: 0,
      contextCount: 20,
      streamOutput: true
    }
  )

  const handleSave = useCallback(() => {
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      emoji: emoji.trim() || undefined,
      description: description.trim() || undefined,
      prompt,
      topics: assistant?.topics ?? [],
      model: assistant?.model,
      settings,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      category: category.trim() || undefined,
      isDefault: false
    })
    onClose()
  }, [name, emoji, description, prompt, category, tags, settings, assistant, onSave, onClose])

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t('chat.editAssistant', '어시스턴트 수정')
              : t('chat.newAssistant', '새 어시스턴트')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-[auto_1fr] gap-3">
            <div>
              <Label>{t('chat.assistantEmoji', '이모지')}</Label>
              <Input
                className="mt-1 w-16 text-center text-lg"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                maxLength={2}
              />
            </div>
            <div>
              <Label>{t('chat.assistantName', '이름')}</Label>
              <Input
                className="mt-1"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('chat.assistantNamePlaceholder', '어시스턴트 이름')}
              />
            </div>
          </div>

          <div>
            <Label>{t('chat.assistantDescription', '설명')}</Label>
            <Input
              className="mt-1"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('chat.assistantDescriptionPlaceholder', '간단한 설명')}
            />
          </div>

          <div>
            <Label>{t('chat.systemPrompt', '시스템 프롬프트')}</Label>
            <Textarea
              className="mt-1 min-h-[100px]"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('chat.systemPromptPlaceholder', '어시스턴트의 동작을 정의하는 프롬프트')}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {t('chat.systemPromptVars', '변수: {{date}}, {{time}}, {{model}}')}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>{t('chat.category', '카테고리')}</Label>
              <Input
                className="mt-1"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={t('chat.categoryPlaceholder', '카테고리')}
              />
            </div>
            <div>
              <Label>{t('chat.tags', '태그')}</Label>
              <Input
                className="mt-1"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={t('chat.tagsPlaceholder', '쉼표로 구분')}
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-3 rounded-lg border border-border p-3">
            <h4 className="text-sm font-medium">{t('chat.modelSettings', '모델 설정')}</h4>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">{t('chat.temperature', 'Temperature')}</Label>
                <span className="text-xs text-muted-foreground">{settings.temperature}</span>
              </div>
              <Slider
                className="mt-1"
                value={[settings.temperature]}
                onValueChange={([v]) => setSettings({ ...settings, temperature: v })}
                min={0}
                max={2}
                step={0.1}
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Top P</Label>
                <span className="text-xs text-muted-foreground">{settings.topP}</span>
              </div>
              <Slider
                className="mt-1"
                value={[settings.topP]}
                onValueChange={([v]) => setSettings({ ...settings, topP: v })}
                min={0}
                max={1}
                step={0.05}
              />
            </div>

            <div>
              <Label className="text-xs">{t('chat.maxTokens', 'Max Tokens')}</Label>
              <Input
                className="mt-1"
                type="number"
                value={settings.maxTokens}
                onChange={(e) =>
                  setSettings({ ...settings, maxTokens: parseInt(e.target.value) || 0 })
                }
                min={0}
              />
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t('chat.maxTokensHint', '0 = 모델 기본값')}
              </p>
            </div>

            <div>
              <Label className="text-xs">{t('chat.contextCount', '컨텍스트 메시지 수')}</Label>
              <Input
                className="mt-1"
                type="number"
                value={settings.contextCount}
                onChange={(e) =>
                  setSettings({ ...settings, contextCount: parseInt(e.target.value) || 20 })
                }
                min={1}
                max={100}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel', '취소')}
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            {t('common.save', '저장')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
