import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import type { StudentRouteOption } from '../types'
import { CampusMapPreview } from './CampusMapPreview'

type Props = {
  routes: StudentRouteOption[]
  selectedRouteId: string
  selectedRoute?: StudentRouteOption
  isBooking: boolean
  bookingError: string
  bookingMessage: string
  onSelectRoute: (routeId: string) => void
  onBook: () => void
}

/** Route selection, Leaflet preview, and the final booking action. */
export function RoutePlanner({
  routes,
  selectedRouteId,
  selectedRoute,
  isBooking,
  bookingError,
  bookingMessage,
  onSelectRoute,
  onBook,
}: Props) {
  return (
    <Card id="route-planner" className="dashboard-card min-w-0">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div><CardDescription>Route planner</CardDescription><CardTitle>Plan your trip</CardTitle></div>
          <Badge variant="outline">Smart route</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="origin">Departure</Label><Input id="origin" value={selectedRoute?.origin ?? ''} readOnly /></div>
          <div className="space-y-2"><Label htmlFor="destination">Destination</Label><Input id="destination" value={selectedRoute?.destination ?? ''} readOnly /></div>
        </div>

        <CampusMapPreview />

        <div className="space-y-3">
          {routes.map((route) => (
            <div
              key={route.id}
              className={`rounded-2xl border p-3 ${selectedRouteId === route.id ? 'border-primary bg-accent' : 'border-border bg-muted'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div><p className="font-medium text-foreground">{route.title}</p><p className="text-xs text-muted-foreground">{route.mode}</p></div>
                <Badge variant="secondary">{route.tag}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
                <span>{route.time}</span><span>{route.distance}</span><span className="font-semibold text-foreground">{route.cost}</span>
              </div>
              <Button
                className="mt-3 h-8"
                size="sm"
                variant={selectedRouteId === route.id ? 'secondary' : 'outline'}
                onClick={() => onSelectRoute(route.id)}
              >
                {!route.bookable ? 'No shuttle' : selectedRouteId === route.id ? 'Selected' : 'Select route'}
              </Button>
            </div>
          ))}
          {!routes.length ? (
            <p className="rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground">
              No active routes are available. Please check back later or contact the transport office.
            </p>
          ) : null}
        </div>

        {bookingError ? <p role="alert" className="dashboard-error rounded-xl px-3 py-2 text-sm">{bookingError}</p> : null}
        {bookingMessage ? <p role="status" className="dashboard-success rounded-xl px-3 py-2 text-sm">{bookingMessage}</p> : null}
        <div className="flex justify-end">
          <Button disabled={isBooking || !selectedRoute?.bookable} onClick={onBook}>
            {isBooking ? 'Booking...' : 'Confirm booking'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
