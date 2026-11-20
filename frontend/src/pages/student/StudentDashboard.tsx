import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getSession, logoutUser } from '@/lib/auth'

import { BookingsPanel } from './components/BookingsPanel'
import { DeparturesPanel } from './components/DeparturesPanel'
import { RoutePlanner } from './components/RoutePlanner'
import { ServiceNotices } from './components/ServiceNotices'
import { StudentHeader } from './components/StudentHeader'
import { StudentNavigation } from './components/StudentNavigation'
import { StudentOverview } from './components/StudentOverview'
import { useStudentDashboard } from './hooks/useStudentDashboard'

/** Composes student-facing dashboard sections and coordinates page navigation. */
export function StudentDashboard() {
  const navigate = useNavigate()
  const user = getSession()
  const {
    dashboardData,
    dashboardError,
    bookingError,
    bookingMessage,
    isBooking,
    cancellingBookingId,
    bookRoute,
    cancelBooking,
  } = useStudentDashboard()
  const [selectedRouteIdState, setSelectedRouteId] = useState('')
  const { student } = dashboardData

  // Keep the selected route valid when fresh dashboard data replaces the initial empty state.
  const selectedRouteId = student.routeOptions.some((route) => route.id === selectedRouteIdState)
    ? selectedRouteIdState
    : student.routeOptions[0]?.id ?? ''
  const selectedRoute = student.routeOptions.find((route) => route.id === selectedRouteId)
  const bookSelectedRoute = () => { void bookRoute(selectedRouteId) }

  const handleLogout = async () => {
    let logoutWarning = ''
    try {
      await logoutUser()
    } catch {
      logoutWarning = 'Your local session was cleared, but the server could not revoke the refresh token.'
    } finally {
      navigate('/login', { replace: true, state: { logoutWarning } })
    }
  }

  return (
    <div className="dashboard-page">
      <div className="mx-auto max-w-[1500px] space-y-6">
        <StudentHeader
          name={user?.name ?? student.name}
          canBook={Boolean(selectedRoute?.bookable)}
          isBooking={isBooking}
          onBook={bookSelectedRoute}
          onSignOut={handleLogout}
        />

        <div className="grid min-w-0 gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <StudentNavigation />
          <main id="overview" className="min-w-0 space-y-6">
            <StudentOverview
              dashboard={dashboardData}
              dashboardError={dashboardError}
              selectedRoute={selectedRoute}
              isBooking={isBooking}
              onBook={bookSelectedRoute}
            />
            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <RoutePlanner
                routes={student.routeOptions}
                selectedRouteId={selectedRouteId}
                selectedRoute={selectedRoute}
                isBooking={isBooking}
                bookingError={bookingError}
                bookingMessage={bookingMessage}
                onSelectRoute={setSelectedRouteId}
                onBook={bookSelectedRoute}
              />
              <BookingsPanel
                bookings={student.bookings}
                cancellingBookingId={cancellingBookingId}
                onCancel={(bookingId) => { void cancelBooking(bookingId) }}
              />
              <DeparturesPanel trips={student.upcomingTrips} />
            </div>
            <ServiceNotices notices={student.notices} />
          </main>
        </div>
      </div>
    </div>
  )
}
