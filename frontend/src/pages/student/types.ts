export type StudentRouteOption = {
  id: string
  title: string
  origin: string
  destination: string
  mode: string
  time: string
  distance: string
  cost: string
  tag: string
  accessible: boolean
  bookable: boolean
}

export type StudentBooking = {
  id: number
  routeId: string
  route: string
  origin: string
  destination: string
  fare: number
  status: string
  bookedAt: string
  departureAt: string | null
}

export type StudentDashboardData = {
  student: {
    name: string
    activeBookingsCount: number
    nextShuttle: {
      route: string
      departure: string
      eta: string
      seatsLeft: number
    }
    stats: Array<{ label: string; value: string; trend: string }>
    routeOptions: StudentRouteOption[]
    upcomingTrips: Array<{ route: string; departure: string; seatsLeft: number; mode: string; vehicle: string }>
    bookings: StudentBooking[]
    notices: Array<{ title: string; time: string; status: string }>
  }
}

export const EMPTY_STUDENT_DASHBOARD: StudentDashboardData = {
  student: {
    name: 'Student',
    activeBookingsCount: 0,
    nextShuttle: {
      route: 'No upcoming shuttle',
      departure: '--',
      eta: '--',
      seatsLeft: 0,
    },
    stats: [],
    routeOptions: [],
    upcomingTrips: [],
    bookings: [],
    notices: [],
  },
}
