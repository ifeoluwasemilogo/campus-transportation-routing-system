import { LogOut, Plus } from 'lucide-react'

import universityLogo from '@/assets/images/ui_logo.png'
import { Button } from '@/components/ui/button'

type Props = {
  name: string
  hasBookings: boolean
  onExportBookings: () => void
  onSignOut: () => void
  onNewDispatch: () => void
}

/** Top-level admin identity and frequently used actions. */
export function AdminHeader({ name, hasBookings, onExportBookings, onSignOut, onNewDispatch }: Props) {
  return (
    <header className="dashboard-header">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card p-1">
            <img src={universityLogo} alt="University of Ibadan crest" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Admin control</p>
            <h1 className="text-xl font-bold text-foreground">Operations Dashboard</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">{name}</div>
          <Button variant="outline" className="rounded-full" disabled={!hasBookings} onClick={onExportBookings}>Export bookings</Button>
          <Button variant="outline" className="gap-2 rounded-full" onClick={onSignOut}><LogOut className="h-4 w-4" />Sign out</Button>
          <Button className="rounded-full" onClick={onNewDispatch}><Plus className="mr-2 h-4 w-4" />New dispatch</Button>
        </div>
      </div>
    </header>
  )
}
