import * as React from 'react'

import { cn } from '@/lib/utils'

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  title: string
}

export function Sidebar({ className, title, children, ...props }: SidebarProps) {
  return (
    <aside className={cn('rounded-xl border bg-card p-3 text-card-foreground shadow-sm', className)} {...props}>
      <div className="mb-3 px-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{title}</div>
      <nav className="space-y-1">{children}</nav>
    </aside>
  )
}
