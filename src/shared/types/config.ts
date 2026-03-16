import { z } from 'zod'
import {
  SendKeySchema,
  MessageStyleSchema,
  AvatarStyleSchema,
  FontSizeSchema,
  CodeBlockThemeSchema,
  CustomCSSSchema,
  LaunchAtLoginSchema,
  StartMinimizedSchema,
  QuickPhrasesJsonSchema,
  ShortcutsJsonSchema,
  BackupMaxRetainedSchema
} from './settings'

export const ThemeSchema = z.enum(['light', 'dark', 'system'])
export type Theme = z.infer<typeof ThemeSchema>

export const NavbarPositionSchema = z.enum(['top', 'left'])
export type NavbarPosition = z.infer<typeof NavbarPositionSchema>

export const AppConfigSchema = z.object({
  // F001 — App Shell
  theme: ThemeSchema.default('light'),
  language: z.string().default('ko'),
  proxyUrl: z.string().url().nullable().default(null),
  autoUpdate: z.boolean().default(true),
  updateInterval: z.number().min(60000).default(3600000),
  globalShortcut: z.string().nullable().default(null),
  schemaVersion: z.number().int().positive().default(1),
  // F002 — Navigation
  navbarPosition: NavbarPositionSchema.default('top'),
  openTabs: z.string().default('[]'),
  activeTabId: z.string().default('home'),
  // F003 — Settings
  fontSize: FontSizeSchema,
  sendKey: SendKeySchema.default('enter'),
  messageStyle: MessageStyleSchema.default('bubble'),
  avatarStyle: AvatarStyleSchema.default('default'),
  codeBlockTheme: CodeBlockThemeSchema,
  customCSS: CustomCSSSchema,
  launchAtLogin: LaunchAtLoginSchema,
  startMinimized: StartMinimizedSchema,
  quickPhrases: QuickPhrasesJsonSchema,
  shortcuts: ShortcutsJsonSchema,
  backupMaxRetained: BackupMaxRetainedSchema
})

export type AppConfig = z.infer<typeof AppConfigSchema>

export const CONFIG_DEFAULTS: AppConfig = AppConfigSchema.parse({})

export type ConfigKey = keyof AppConfig

export const CONFIG_KEYS: ConfigKey[] = [
  'theme',
  'language',
  'proxyUrl',
  'autoUpdate',
  'updateInterval',
  'globalShortcut',
  'schemaVersion',
  'navbarPosition',
  'openTabs',
  'activeTabId',
  'fontSize',
  'sendKey',
  'messageStyle',
  'avatarStyle',
  'codeBlockTheme',
  'customCSS',
  'launchAtLogin',
  'startMinimized',
  'quickPhrases',
  'shortcuts',
  'backupMaxRetained'
]

export const CURRENT_SCHEMA_VERSION = 1
