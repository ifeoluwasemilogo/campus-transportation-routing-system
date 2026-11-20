import { ArrowRight, Clock3, Sparkles, TicketCheck, Users } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import type { StudentDashboardData, StudentRouteOption } from '../types'

type Props = {
  dashboard: StudentDashboardData
  dashboardError: string
  selectedRoute?: StudentRouteOption
  isBooking: boolean
  onBook: () => void
}

/** At-a-glance service status, next shuttle, trip summary, and student metrics. */
export function StudentOverview({ dashboard, dashboardError, selectedRoute, isBooking, onBook }: Props) {
  const student = dashboard.student
  const hasDepartures = student.upcomingTrips.length > 0
  const statIcons = [ArrowRight, Clock3, Users, Sparkles]
  const statAccents = ['text-primary', 'text-muted-foreground', 'text-accent-foreground', 'text-warning']

  return (
    <div className="space-y-6">
      <Alert className={hasDepartures && !dashboardError ? 'dashboard-success' : 'dashboard-warning'}>
        <Sparkles className="h-4 w-4" />
        <AlertTitle>
          {dashboardError ? 'Transport status unavailable' : hasDepartures ? 'Shuttle departures available' : 'No upcoming shuttle departures'}
        </AlertTitle>
        <AlertDescription>
          {dashboardError || (hasDepartures
            ? `${student.upcomingTrips.length} departures are listed in the dispatch board.`
            : 'Check again later or contact the transport office for schedule updates.')}
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="dashboard-feature min-w-0 overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <Badge className="border-primary-foreground/20 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">Campus route</Badge>
              <Badge variant="secondary" className="bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/20">
                {student.nextShuttle.route === 'No upcoming shuttle' ? 'No service' : 'Scheduled'}
              </Badge>
            </div>
            <div className="mt-8 space-y-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-primary-foreground/80">Next shuttle</p>
                <h2 className="mt-2 text-3xl font-bold md:text-4xl">{student.nextShuttle.route} {student.nextShuttle.departure}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/85">
                <span className="flex items-center gap-2"><Clock3 className="h-4 w-4" />Leaves in {student.nextShuttle.eta}</span>
                <span className="flex items-center gap-2"><TicketCheck className="h-4 w-4" />{student.nextShuttle.seatsLeft} seats remaining</span>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-3 backdrop-blur-sm">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-primary-foreground/75">Current route</div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-sm text-primary-foreground">
                    <span>{selectedRoute?.origin ?? 'Choose origin'}</span>
                    <ArrowRight className="h-4 w-4 text-primary-foreground/75" />
                    <span>{selectedRoute?.destination ?? 'Choose destination'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90" disabled={isBooking || !selectedRoute?.bookable} onClick={onBook}>Book seat</Button>
                  <Button asChild variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    <a href="#route-planner">View route</a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dashboard-card min-w-0">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Trip summary</span>
              <Badge variant={student.nextShuttle.route === 'No upcoming shuttle' ? 'secondary' : 'success'}>
                {student.nextShuttle.route === 'No upcoming shuttle' ? 'No service' : 'Scheduled'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="dashboard-surface rounded-2xl p-4">
              <p className="text-sm text-muted-foreground">Selected route fare</p>
              <p className="mt-2 text-3xl font-bold tracking-tight">{selectedRoute?.cost ?? 'Select a route'}</p>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5"><span>Confirmed bookings</span><span className="font-semibold text-foreground">{student.activeBookingsCount}</span></div>
              <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5">
                <span>Accessible vehicle</span>
                <span className={`font-semibold ${selectedRoute?.accessible ? 'text-accent-foreground' : 'text-muted-foreground'}`}>
                  {selectedRoute?.accessible ? 'Available' : 'Not listed'}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border px-3 py-2.5"><span>Next departure in</span><span className="font-semibold text-foreground">{student.nextShuttle.eta}</span></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {student.stats.map((stat, index) => {
          const Icon = statIcons[index] ?? ArrowRight
          return (
            <Card key={stat.label} className="dashboard-card">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription>{stat.label}</CardDescription>
                  <Icon className={`h-4 w-4 ${statAccents[index] ?? 'text-muted-foreground'}`} />
                </div>
                <CardTitle className="text-2xl tracking-tight">{stat.value}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 text-sm text-muted-foreground">{stat.trend}</CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
