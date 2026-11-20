import { BellDot, LogOut, Search } from 'lucide-react'

import universityLogo from '@/assets/images/ui_logo.png'
import { Button } from '@/components/ui/button'

type Props = {
  name: string
  canBook: boolean
  isBooking: boolean
  onBook: () => void
  onSignOut: () => void
}

/** Student portal header with account and primary booking actions. */
export function StudentHeader({ name, canBook, isBooking, onBook, onSignOut }: Props) {
  return (
    <header className="dashboard-header">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-card p-1">
            <img src={universityLogo} alt="University of Ibadan crest" className="h-full w-full object-contain" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.32em] text-muted-foreground">Student portal</p>
            <h1 className="text-xl font-bold text-foreground">Campus Route Planner</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            <span>{name}</span>
          </div>
          <Button asChild variant="outline" size="icon" className="rounded-full">
            <a href="#service-notices" aria-label="View service notices"><BellDot className="h-4 w-4" /></a>
          </Button>
          <Button variant="outline" className="gap-2 rounded-full" onClick={onSignOut}>
            <LogOut className="h-4 w-4" />Sign out
          </Button>
          <Button className="rounded-full" disabled={isBooking || !canBook} onClick={onBook}>Book a shuttle</Button>
        </div>
      </div>
    </header>
  )
}
