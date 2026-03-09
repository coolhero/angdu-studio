import React from 'react'
import { cn } from '@renderer/lib/utils'

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  children?: React.ReactNode
}

const Table: React.FC<TableProps> = ({ children, className, ...props }) => {
  return (
    <div className="my-3 overflow-x-auto rounded-lg border border-border">
      <table
        className={cn(
          'min-w-full border-collapse',
          '[&_th]:border [&_th]:border-border [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:bg-muted/50',
          '[&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2',
          '[&_tr:hover]:bg-muted/30',
          className
        )}
        {...props}
      >
        {children}
      </table>
    </div>
  )
}

export default React.memo(Table)
