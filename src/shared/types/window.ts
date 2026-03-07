import { z } from 'zod'

export const WindowStateSchema = z.object({
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().min(400).default(1200),
  height: z.number().min(300).default(800),
  isMaximized: z.boolean().default(false)
})

export type WindowState = z.infer<typeof WindowStateSchema>
