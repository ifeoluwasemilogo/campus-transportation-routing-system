export type AdminRoute = {
  id: number
  slug: string
  title: string
  origin: string
  destination: string
  mode: 'SHUTTLE' | 'WALK_SHUTTLE' | 'WALKING'
  duration_minutes: number
  distance_km: string
  fare: number
  active: boolean
}

export type AdminVehicle = {
  id: number
  code: string
  registration: string
  capacity: number
  accessible: boolean
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE'
}

export type AdminTrip = {
  id: number
  route: number
  vehicle: number
  departure_at: string
  status: 'SCHEDULED' | 'DELAYED' | 'CANCELLED' | 'COMPLETED'
}

export type AdminNotice = {
  id: number
  title: string
  message: string
  status: 'ACTIVE' | 'RESOLVED'
  created_at: string
}

export type AdminResourceKind = 'routes' | 'vehicles' | 'trips' | 'notices'

export type AdminDashboardData = {
  admin: {
    fleetStatus: { current: number; total: number }
    maintenanceVehicles: number
    stats: Array<{ label: string; value: string }>
    routes: Array<{ route: string; driver: string; status: string; load: string }>
    alerts: Array<{ title: string; time: string; status: string }>
  }
}

export type AdminBooking = {
  id: number
  studentEmail: string
  route: string
  fare: number
  status: string
  bookedAt: string
}

export type AdminSection = 'overview' | AdminResourceKind
export type ManagedRecord = AdminRoute | AdminVehicle | AdminTrip | AdminNotice

export type AdminResources = {
  routes: AdminRoute[]
  vehicles: AdminVehicle[]
  trips: AdminTrip[]
  notices: AdminNotice[]
}
