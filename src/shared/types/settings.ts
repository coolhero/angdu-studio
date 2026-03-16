import { z } from 'zod'

// ─── Send Key ───────────────────────────────────────────────────────────────
export const SendKeySchema = z.enum(['enter', 'ctrl+enter'])
export type SendKey = z.infer<typeof SendKeySchema>

// ─── Message Style ──────────────────────────────────────────────────────────
export const MessageStyleSchema = z.enum(['bubble', 'plain'])
export type MessageStyle = z.infer<typeof MessageStyleSchema>

// ─── Avatar Style ───────────────────────────────────────────────────────────
export const AvatarStyleSchema = z.enum(['default', 'identicon', 'initials'])
export type AvatarStyle = z.infer<typeof AvatarStyleSchema>

// ─── Quick Phrase ───────────────────────────────────────────────────────────
export const QuickPhraseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  order: z.number().optional()
})
export type QuickPhrase = z.infer<typeof QuickPhraseSchema>

// ─── Shortcut ───────────────────────────────────────────────────────────────
export const ShortcutSchema = z.object({
  key: z.string(),
  shortcut: z.array(z.string()),
  editable: z.boolean(),
  enabled: z.boolean(),
  system: z.boolean()
})
export type Shortcut = z.infer<typeof ShortcutSchema>

// ─── Export Manifest ────────────────────────────────────────────────────────
export const ExportManifestSchema = z.object({
  version: z.string(),
  schemaVersion: z.number(),
  exportedAt: z.string(),
  platform: z.string(),
  features: z.array(z.string())
})
export type ExportManifest = z.infer<typeof ExportManifestSchema>

// ─── F003 Config Key Schemas ────────────────────────────────────────────────
export const FontSizeSchema = z.number().int().min(12).max(24).default(14)
export const CodeBlockThemeSchema = z.string().default('github-dark')
export const CustomCSSSchema = z.string().default('')
export const LaunchAtLoginSchema = z.boolean().default(false)
export const StartMinimizedSchema = z.boolean().default(false)
export const QuickPhrasesJsonSchema = z.string().default('[]')
export const ShortcutsJsonSchema = z.string().default('[]')
export const BackupMaxRetainedSchema = z.number().int().min(1).default(5)

// ─── Default Shortcuts ─────────────────────────────────────────────────────
export const DEFAULT_SHORTCUTS: Shortcut[] = [
  {
    key: 'toggle-window',
    shortcut: ['CommandOrControl', 'Shift', 'A'],
    editable: true,
    enabled: true,
    system: true
  },
  {
    key: 'new-chat',
    shortcut: ['CommandOrControl', 'N'],
    editable: true,
    enabled: true,
    system: false
  },
  {
    key: 'search',
    shortcut: ['CommandOrControl', 'K'],
    editable: true,
    enabled: true,
    system: false
  },
  {
    key: 'settings',
    shortcut: ['CommandOrControl', ','],
    editable: false,
    enabled: true,
    system: false
  },
  {
    key: 'close-tab',
    shortcut: ['CommandOrControl', 'W'],
    editable: true,
    enabled: true,
    system: false
  }
]

// ─── F003 Config Defaults ──────────────────────────────────────────────────
export const F003_CONFIG_DEFAULTS = {
  fontSize: 14,
  sendKey: 'enter' as SendKey,
  messageStyle: 'bubble' as MessageStyle,
  avatarStyle: 'default' as AvatarStyle,
  codeBlockTheme: 'github-dark',
  customCSS: '',
  launchAtLogin: false,
  startMinimized: false,
  quickPhrases: '[]',
  shortcuts: '[]',
  backupMaxRetained: 5
} as const
