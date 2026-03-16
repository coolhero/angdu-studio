import { useState, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Cpu, ChevronDown, Search } from 'lucide-react'
import type { Assistant, AssistantSettings, ModelReference } from '@shared/types/assistant'
import type { Model, Provider } from '@shared/types/provider'
import { useProviderStore } from '@renderer/stores/useProviderStore'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@renderer/components/ui/popover'
import { ScrollArea } from '@renderer/components/ui/scroll-area'
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
  const [model, setModel] = useState<ModelReference | undefined>(assistant?.model)
  const [modelPopoverOpen, setModelPopoverOpen] = useState(false)
  const [modelSearch, setModelSearch] = useState('')
  const providers = useProviderStore((s) => s.providers)
  const [settings, setSettings] = useState<AssistantSettings>(
    assistant?.settings ?? {
      temperature: 0.7,
      topP: 1,
      maxTokens: 0,
      contextCount: 20,
      streamOutput: true
    }
  )

  const groupedModels = useMemo(() => {
    const groups: { provider: Provider; models: Model[] }[] = []
    for (const p of providers) {
      if (!p.enabled) continue
      const chatModels = p.models.filter(
        (m) => m.enabled && m.endpoint_type !== 'image-generation' && m.endpoint_type !== 'jina-rerank'
      )
      const filtered = modelSearch
        ? chatModels.filter((m) => m.name.toLowerCase().includes(modelSearch.toLowerCase()))
        : chatModels
      if (filtered.length > 0) groups.push({ provider: p, models: filtered })
    }
    return groups
  }, [providers, modelSearch])

  const handleSave = useCallback(() => {
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      emoji: emoji.trim() || undefined,
      description: description.trim() || undefined,
      prompt,
      topics: assistant?.topics ?? [],
      model,
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

          {/* Model Selector */}
          <div>
            <Label>{t('chat.model', '모델')}</Label>
            <Popover open={modelPopoverOpen} onOpenChange={setModelPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="mt-1 w-full justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                    {model ? (
                      <span className="truncate">{model.displayName ?? model.modelId}</span>
                    ) : (
                      <span className="text-muted-foreground">{t('chat.selectModel', '모델 선택')}</span>
                    )}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="border-b p-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('chat.searchModel', '모델 검색...')}
                      value={modelSearch}
                      onChange={(e) => setModelSearch(e.target.value)}
                      className="h-8 pl-8 text-sm"
                    />
                  </div>
                </div>
                <ScrollArea className="max-h-[300px]">
                  {groupedModels.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      {t('chat.noModels', '모델을 찾을 수 없습니다.')}
                    </div>
                  ) : (
                    groupedModels.map(({ provider: prov, models: mdls }) => (
                      <div key={prov.id}>
                        <div className="sticky top-0 bg-muted/80 px-3 py-1 text-xs font-semibold text-muted-foreground">
                          {prov.name}
                        </div>
                        {mdls.map((m) => (
                          <button
                            key={m.id}
                            className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-accent ${
                              model?.modelId === m.id && model?.providerId === prov.id ? 'bg-accent' : ''
                            }`}
                            onClick={() => {
                              setModel({ providerId: prov.id, modelId: m.id, displayName: m.name })
                              setModelPopoverOpen(false)
                              setModelSearch('')
                            }}
                          >
                            <Cpu className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate">{m.name}</span>
                          </button>
                        ))}
                      </div>
                    ))
                  )}
                </ScrollArea>
              </PopoverContent>
            </Popover>
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
