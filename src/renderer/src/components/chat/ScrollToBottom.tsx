import { memo } from 'react'
import { ArrowDown } from 'lucide-react'
import { Button } from '@renderer/components/ui/button'

interface ScrollToBottomProps {
  visible: boolean
  onClick: () => void
}

export const ScrollToBottom = memo(function ScrollToBottom({ visible, onClick }: ScrollToBottomProps) {
  if (!visible) return null

  return (
    <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 rounded-full shadow-md"
        onClick={onClick}
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
    </div>
  )
})
