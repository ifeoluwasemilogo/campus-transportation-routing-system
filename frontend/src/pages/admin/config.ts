import type { AdminDashboardData, AdminResourceKind } from './types'

export const EMPTY_ADMIN_DASHBOARD: AdminDashboardData = {
  admin: {
    fleetStatus: { current: 0, total: 0 },
    maintenanceVehicles: 0,
    stats: [
      { label: 'Fleet status', value: '0/0' },
      { label: 'Upcoming trips', value: '0' },
      { label: 'Active notices', value: '0' },
      { label: 'Confirmed bookings', value: '0' },
    ],
    routes: [],
    alerts: [],
  },
}

export const ADMIN_SECTION_INFO: Record<AdminResourceKind, { title: string; description: string; singular: string }> = {
  routes: { title: 'Campus routes', description: 'Manage stops, route types, fares, and student availability.', singular: 'route' },
  vehicles: { title: 'Fleet', description: 'Maintain vehicle capacity, accessibility, and service status.', singular: 'vehicle' },
  trips: { title: 'Trip schedule', description: 'Assign vehicles to routes and manage upcoming departures.', singular: 'trip' },
  notices: { title: 'Service notices', description: 'Publish operational updates to the student portal.', singular: 'notice' },
}

export const displayStatus = (value: string) =>
  value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase())
