import { z } from 'zod'

export const ThemeModeSchema = z.enum(['light', 'dark', 'system'])
export type ThemeMode = z.infer<typeof ThemeModeSchema>

export const ResolvedThemeSchema = z.enum(['light', 'dark'])
export type ResolvedTheme = z.infer<typeof ResolvedThemeSchema>

export interface ThemeState {
  mode: ThemeMode
  resolved: ResolvedTheme
}
