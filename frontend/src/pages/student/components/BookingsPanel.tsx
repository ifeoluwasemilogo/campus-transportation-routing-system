import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import type { StudentBooking } from '../types'

type Props = {
  bookings: StudentBooking[]
  cancellingBookingId: number | null
  onCancel: (bookingId: number) => void
}

/** Booking history and cancellation controls. */
export function BookingsPanel({ bookings, cancellingBookingId, onCancel }: Props) {
  return (
    <Card id="bookings" className="dashboard-card min-w-0">
      <CardHeader><CardDescription>Your travel activity</CardDescription><CardTitle>Recent bookings</CardTitle></CardHeader>
      <CardContent>
        {bookings.length ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Route</TableHead><TableHead>Fare</TableHead><TableHead>Booked</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
              <TableBody>{bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>{booking.route}</TableCell>
                  <TableCell>{booking.fare ? `₦${booking.fare.toLocaleString()}` : 'Free'}</TableCell>
                  <TableCell>{booking.departureAt ? new Date(booking.departureAt).toLocaleString() : new Date(booking.bookedAt).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={booking.status === 'Confirmed' ? 'success' : 'secondary'}>{booking.status}</Badge></TableCell>
                  <TableCell>
                    {booking.status === 'Confirmed' ? (
                      <Button size="sm" variant="ghost" disabled={cancellingBookingId === booking.id} onClick={() => onCancel(booking.id)}>
                        {cancellingBookingId === booking.id ? 'Cancelling...' : 'Cancel'}
                      </Button>
                    ) : '—'}
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </div>
        ) : <p className="text-sm text-muted-foreground">Your confirmed shuttle bookings will appear here.</p>}
      </CardContent>
    </Card>
  )
}
