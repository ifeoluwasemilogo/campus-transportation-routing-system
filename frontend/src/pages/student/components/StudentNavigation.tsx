import { GraduationCap, MapPinned, ShieldCheck, TicketCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'

/** In-page student navigation; targets correspond to dashboard section IDs. */
export function StudentNavigation() {
  return (
    <aside className="dashboard-sidebar min-w-0">
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">Quick access</p>
      <nav className="space-y-2" aria-label="Student sections">
        <Button asChild className="w-full justify-start gap-3 rounded-xl">
          <a href="#overview"><GraduationCap className="h-4 w-4" />Student dashboard</a>
        </Button>
        <Button asChild variant="ghost" className="w-full justify-start gap-3 rounded-xl">
          <a href="#route-planner"><MapPinned className="h-4 w-4" />Route finder</a>
        </Button>
        <Button asChild variant="ghost" className="w-full justify-start gap-3 rounded-xl">
          <a href="#bookings"><TicketCheck className="h-4 w-4" />Tickets</a>
        </Button>
        <Button asChild variant="ghost" className="w-full justify-start gap-3 rounded-xl">
          <a href="#service-notices"><ShieldCheck className="h-4 w-4" />Safety</a>
        </Button>
      </nav>
    </aside>
  )
}
