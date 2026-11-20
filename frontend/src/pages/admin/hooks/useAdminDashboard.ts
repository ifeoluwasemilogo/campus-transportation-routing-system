import { useCallback, useEffect, useState } from 'react'

import { apiRequest } from '@/lib/api'

import { EMPTY_ADMIN_DASHBOARD } from '../config'
import type { AdminBooking, AdminDashboardData, AdminResources } from '../types'

const EMPTY_RESOURCES: AdminResources = {
  routes: [],
  vehicles: [],
  trips: [],
  notices: [],
}

async function loadInitialAdminData(load: () => Promise<void>, reportError: (message: string) => void) {
  try {
    await load()
  } catch (error) {
    reportError(error instanceof Error ? error.message : 'Could not load transport operations.')
  }
}

/** Loads the dashboard and all React-admin resources from the protected API. */
export function useAdminDashboard() {
  const [dashboardData, setDashboardData] = useState(EMPTY_ADMIN_DASHBOARD)
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [resources, setResources] = useState<AdminResources>(EMPTY_RESOURCES)
  const [dashboardError, setDashboardError] = useState('')

  const refreshData = useCallback(async () => {
    const [dashboard, bookingList, routes, vehicles, trips, notices] = await Promise.all([
      apiRequest<AdminDashboardData>('/api/transport/dashboard/admin/'),
      apiRequest<AdminBooking[]>('/api/transport/admin/bookings/'),
      apiRequest<AdminResources['routes']>('/api/transport/admin/routes/'),
      apiRequest<AdminResources['vehicles']>('/api/transport/admin/vehicles/'),
      apiRequest<AdminResources['trips']>('/api/transport/admin/trips/'),
      apiRequest<AdminResources['notices']>('/api/transport/admin/notices/'),
    ])

    setDashboardData(dashboard)
    setBookings(bookingList)
    setResources({ routes, vehicles, trips, notices })
    setDashboardError('')
  }, [])

  useEffect(() => {
    void loadInitialAdminData(refreshData, setDashboardError)
  }, [refreshData])

  const refreshAfterSave = useCallback(async () => {
    try {
      await refreshData()
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : 'Could not load transport operations.')
    }
  }, [refreshData])

  return {
    dashboardData,
    bookings,
    resources,
    dashboardError,
    refreshData,
    refreshAfterSave,
  }
}
