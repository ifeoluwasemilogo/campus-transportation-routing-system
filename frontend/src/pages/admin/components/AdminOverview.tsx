import { AlertTriangle, BusFront, CalendarClock, CheckCircle2, Megaphone, Users } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import type { AdminBooking, AdminDashboardData, AdminResourceKind } from '../types'

type Props = {
  dashboard: AdminDashboardData
  bookings: AdminBooking[]
  onManageTrips: () => void
  onCreateNotice: (kind: AdminResourceKind) => void
}

/** Operations summary, recent student bookings, and service alerts. */
export function AdminOverview({ dashboard, bookings, onManageTrips, onCreateNotice }: Props) {
  const stats = dashboard.admin.stats
  const icons = [BusFront, CalendarClock, AlertTriangle, Users]
  const tones = ['text-primary', 'text-muted-foreground', 'text-warning', 'text-accent-foreground']

  return (
    <div className="space-y-6">
      <Alert className={dashboard.admin.fleetStatus.total ? 'dashboard-success' : 'dashboard-warning'}>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>{dashboard.admin.fleetStatus.total ? 'Transport network status' : 'Fleet data is not configured'}</AlertTitle>
        <AlertDescription>
          {dashboard.admin.fleetStatus.total
            ? `${dashboard.admin.fleetStatus.current} of ${dashboard.admin.fleetStatus.total} fleet units are operational.`
            : 'Add vehicles and trips using the management sections in this dashboard.'}
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = icons[index] ?? BusFront
          return (
            <Card key={stat.label} className="dashboard-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>{stat.label}</CardDescription>
                  <Icon className={`h-4 w-4 ${tones[index] ?? 'text-muted-foreground'}`} />
                </div>
                <CardTitle className="text-2xl tracking-tight">{stat.value}</CardTitle>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="dashboard-card">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div><CardDescription>Operations</CardDescription><CardTitle>Live route performance</CardTitle></div>
              <Button variant="outline" size="sm" onClick={onManageTrips}>Manage trips</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Route</TableHead><TableHead>Vehicle</TableHead><TableHead>Status</TableHead><TableHead>Load</TableHead></TableRow></TableHeader>
              <TableBody>
                {dashboard.admin.routes.map((route) => (
                  <TableRow key={`${route.route}-${route.driver}`}>
                    <TableCell>{route.route}</TableCell><TableCell>{route.driver}</TableCell>
                    <TableCell><Badge variant={route.status.includes('Delayed') ? 'secondary' : 'success'}>{route.status}</Badge></TableCell>
                    <TableCell>{route.load}</TableCell>
                  </TableRow>
                ))}
                {!dashboard.admin.routes.length ? <TableRow><TableCell colSpan={4} className="py-8 text-center text-muted-foreground">No upcoming trips are scheduled.</TableCell></TableRow> : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="dashboard-card">
          <CardHeader><CardDescription>Service actions</CardDescription><CardTitle>Dispatch queue</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="dashboard-surface rounded-2xl p-4">
              <p className="text-sm text-muted-foreground">High priority</p>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {dashboard.admin.maintenanceVehicles
                  ? `${dashboard.admin.maintenanceVehicles} vehicle(s) require maintenance review`
                  : 'No vehicles are currently flagged for maintenance'}
              </p>
            </div>
            <Button className="w-full" onClick={() => onCreateNotice('notices')}><Megaphone className="mr-2 h-4 w-4" />Create route notice</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="dashboard-card">
        <CardHeader><CardDescription>Student activity</CardDescription><CardTitle>Recent shuttle bookings</CardTitle></CardHeader>
        <CardContent>
          {bookings.length ? (
            <Table>
              <TableHeader><TableRow><TableHead>Student</TableHead><TableHead>Route</TableHead><TableHead>Fare</TableHead><TableHead>Booked</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>{bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.studentEmail}</TableCell><TableCell>{booking.route}</TableCell>
                  <TableCell>{booking.fare ? `₦${booking.fare.toLocaleString()}` : 'Free'}</TableCell>
                  <TableCell>{new Date(booking.bookedAt).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={booking.status === 'Confirmed' ? 'success' : 'secondary'}>{booking.status}</Badge></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          ) : <p className="text-sm text-muted-foreground">No student bookings yet.</p>}
        </CardContent>
      </Card>

      <Card className="dashboard-card">
        <CardHeader><CardDescription>Updates</CardDescription><CardTitle>Operational alerts</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {dashboard.admin.alerts.map((alert) => (
            <div key={alert.title} className="flex items-center justify-between rounded-2xl border border-border p-3">
              <div><p className="font-medium text-foreground">{alert.title}</p><p className="text-xs text-muted-foreground">{alert.time}</p></div>
              <Badge variant={alert.status === 'Active' ? 'secondary' : alert.status === 'Resolved' ? 'success' : 'outline'}>{alert.status}</Badge>
            </div>
          ))}
          {!dashboard.admin.alerts.length ? <p className="text-sm text-muted-foreground">No service notices.</p> : null}
        </CardContent>
      </Card>
    </div>
  )
}
