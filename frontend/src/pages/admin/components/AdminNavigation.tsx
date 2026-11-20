import { BusFront, CalendarClock, LayoutGrid, MapPinned, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { AdminSection } from '../types'

const menu: Array<{ section: AdminSection; label: string; icon: typeof LayoutGrid }> = [
  { section: 'overview', label: 'Overview', icon: LayoutGrid },
  { section: 'routes', label: 'Routes', icon: MapPinned },
  { section: 'vehicles', label: 'Fleet', icon: BusFront },
  { section: 'trips', label: 'Trips', icon: CalendarClock },
  { section: 'notices', label: 'Service notices', icon: ShieldCheck },
]

type Props = {
  section: AdminSection
  onSelect: (section: AdminSection) => void
}

/** Navigation for the React-based admin sections. */
export function AdminNavigation({ section, onSelect }: Props) {
  return (
    <aside className="dashboard-sidebar">
      <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">Management</p>
      <nav className="space-y-2" aria-label="Admin sections">
        {menu.map(({ section: target, label, icon: Icon }) => (
          <Button
            key={target}
            variant={section === target ? 'default' : 'ghost'}
            className="w-full justify-start gap-3 rounded-xl"
            onClick={() => onSelect(target)}
            aria-current={section === target ? 'page' : undefined}
          >
            <Icon className="h-4 w-4" />{label}
          </Button>
        ))}
      </nav>
    </aside>
  )
}
