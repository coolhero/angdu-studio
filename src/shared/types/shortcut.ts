import { z } from 'zod'

export const ShortcutSchema = z.object({
  key: z.string().min(1),
  shortcut: z.array(z.string()).min(1),
  enabled: z.boolean().default(true)
})

export type Shortcut = z.infer<typeof ShortcutSchema>
