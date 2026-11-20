import { useEffect, useState } from 'react'

import { apiRequest } from '@/lib/api'
import { getSession } from '@/lib/auth'

import { EMPTY_STUDENT_DASHBOARD } from '../types'
import type { StudentBooking, StudentDashboardData } from '../types'

/** Owns student dashboard loading and the booking/cancellation API workflows. */
export function useStudentDashboard() {
  const [dashboardData, setDashboardData] = useState<StudentDashboardData>(EMPTY_STUDENT_DASHBOARD)
  const [bookingError, setBookingError] = useState('')
  const [bookingMessage, setBookingMessage] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null)
  const [dashboardError, setDashboardError] = useState('')

  useEffect(() => {
    if (!getSession()?.accessToken) return

    apiRequest<StudentDashboardData>('/api/transport/dashboard/student/')
      .then(setDashboardData)
      .catch((error: unknown) => setDashboardError(error instanceof Error ? error.message : 'Could not load student dashboard.'))
  }, [])

  const bookRoute = async (routeId: string) => {
    const session = getSession()
    if (!session?.accessToken) {
      setBookingError('Your session expired. Please sign in again.')
      setBookingMessage('')
      return
    }

    const route = dashboardData.student.routeOptions.find((option) => option.id === routeId)
    if (!route?.bookable) {
      setBookingError('This route does not have a shuttle departure available to book.')
      setBookingMessage('')
      return
    }

    setIsBooking(true)
    setBookingError('')
    setBookingMessage('')
    try {
      const booking = await apiRequest<StudentBooking>('/api/transport/bookings/', {
        method: 'POST',
        body: JSON.stringify({ routeId }),
      })

      // The API returns the created booking, so update the dashboard immediately without a full reload.
      setDashboardData((current) => ({
        ...current,
        student: {
          ...current.student,
          activeBookingsCount: current.student.activeBookingsCount + 1,
          bookings: [booking, ...current.student.bookings],
        },
      }))
      setBookingMessage(`Seat reserved for ${booking.route}.`)
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Booking could not be completed.')
    } finally {
      setIsBooking(false)
    }
  }

  const cancelBooking = async (bookingId: number) => {
    if (!getSession()?.accessToken) {
      setBookingError('Sign in through the backend to manage bookings.')
      return
    }

    setCancellingBookingId(bookingId)
    setBookingError('')
    try {
      const updatedBooking = await apiRequest<StudentBooking>(`/api/transport/bookings/${bookingId}/`, {
        method: 'PATCH',
      })
      setDashboardData((current) => ({
        ...current,
        student: {
          ...current.student,
          activeBookingsCount: Math.max(0, current.student.activeBookingsCount - 1),
          bookings: current.student.bookings.map((booking) =>
            booking.id === updatedBooking.id ? updatedBooking : booking,
          ),
        },
      }))
    } catch (error) {
      setBookingError(error instanceof Error ? error.message : 'Booking could not be cancelled.')
    } finally {
      setCancellingBookingId(null)
    }
  }

  return {
    dashboardData,
    dashboardError,
    bookingError,
    bookingMessage,
    isBooking,
    cancellingBookingId,
    bookRoute,
    cancelBooking,
  }
}
