import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type Departure = { route: string; departure: string; seatsLeft: number; mode: string; vehicle: string }

/** Compact dispatch board listing the next upcoming trips. */
export function DeparturesPanel({ trips }: { trips: Departure[] }) {
  return (
    <Card id="departures" className="dashboard-card min-w-0">
      <CardHeader><CardDescription>Dispatch board</CardDescription><CardTitle>Next departures</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {trips.length ? trips.map((item) => (
          <div key={`${item.route}-${item.departure}`} className="flex items-center justify-between rounded-2xl border border-border p-3">
            <div><p className="font-medium text-foreground">{item.route}</p><p className="text-xs text-muted-foreground">{item.departure}</p></div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{item.seatsLeft} seats left</p>
              <p className="text-xs text-muted-foreground">{item.mode} · {item.vehicle}</p>
            </div>
          </div>
        )) : <p className="text-sm text-muted-foreground">No departures are currently scheduled.</p>}
      </CardContent>
    </Card>
  )
}
