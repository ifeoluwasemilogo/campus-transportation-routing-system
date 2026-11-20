import { Pencil, Plus, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { ADMIN_SECTION_INFO, displayStatus } from '../config'
import type { AdminResources, AdminResourceKind, ManagedRecord } from '../types'

type Props = {
  section: AdminResourceKind
  resources: AdminResources
  deletingId: number | null
  onCreate: () => void
  onEdit: (record: ManagedRecord) => void
  onDelete: (record: ManagedRecord) => void
}

function RowActions({ disabled, onEdit, onDelete }: { disabled: boolean; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="inline-flex items-center gap-2">
      <Button variant="outline" size="sm" disabled={disabled} onClick={onEdit} aria-label="Edit">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="sm" disabled={disabled} onClick={onDelete} aria-label="Delete">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  )
}

/** Resource CRUD table for routes, fleet, trips, and notices. */
export function AdminResourceManager({ section, resources, deletingId, onCreate, onEdit, onDelete }: Props) {
  const { title, description, singular } = ADMIN_SECTION_INFO[section]
  const rows = resources[section]
  const routeName = (id: number) => resources.routes.find((route) => route.id === id)?.title ?? 'Unknown route'
  const vehicleName = (id: number) => resources.vehicles.find((vehicle) => vehicle.id === id)?.code ?? 'Unknown vehicle'

  return (
    <Card className="dashboard-card">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardDescription>React admin console</CardDescription>
            <CardTitle>{title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
          <Button onClick={onCreate}><Plus className="mr-2 h-4 w-4" />Add {singular}</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          {section === 'routes' ? (
            <Table>
              <TableHeader><TableRow><TableHead>Route</TableHead><TableHead>Type</TableHead><TableHead>Duration</TableHead><TableHead>Fare</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>{resources.routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell><p className="font-medium">{route.title}</p><p className="text-xs text-muted-foreground">{route.origin} → {route.destination}</p></TableCell>
                  <TableCell>{displayStatus(route.mode)}</TableCell>
                  <TableCell>{route.duration_minutes} min</TableCell>
                  <TableCell>{route.fare ? `₦${route.fare.toLocaleString()}` : 'Free'}</TableCell>
                  <TableCell><Badge variant={route.active ? 'success' : 'outline'}>{route.active ? 'Active' : 'Hidden'}</Badge></TableCell>
                  <TableCell className="text-right"><RowActions disabled={deletingId === route.id} onEdit={() => onEdit(route)} onDelete={() => onDelete(route)} /></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          ) : null}

          {section === 'vehicles' ? (
            <Table>
              <TableHeader><TableRow><TableHead>Vehicle</TableHead><TableHead>Capacity</TableHead><TableHead>Accessibility</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>{resources.vehicles.map((vehicle) => (
                <TableRow key={vehicle.id}>
                  <TableCell><p className="font-medium">{vehicle.code}</p><p className="text-xs text-muted-foreground">{vehicle.registration}</p></TableCell>
                  <TableCell>{vehicle.capacity} seats</TableCell>
                  <TableCell>{vehicle.accessible ? 'Accessible' : 'Standard'}</TableCell>
                  <TableCell><Badge variant={vehicle.status === 'ACTIVE' ? 'success' : vehicle.status === 'MAINTENANCE' ? 'secondary' : 'outline'}>{displayStatus(vehicle.status)}</Badge></TableCell>
                  <TableCell className="text-right"><RowActions disabled={deletingId === vehicle.id} onEdit={() => onEdit(vehicle)} onDelete={() => onDelete(vehicle)} /></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          ) : null}

          {section === 'trips' ? (
            <Table>
              <TableHeader><TableRow><TableHead>Route</TableHead><TableHead>Vehicle</TableHead><TableHead>Departure</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>{resources.trips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">{routeName(trip.route)}</TableCell>
                  <TableCell>{vehicleName(trip.vehicle)}</TableCell>
                  <TableCell>{new Date(trip.departure_at).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={trip.status === 'SCHEDULED' ? 'success' : trip.status === 'DELAYED' ? 'secondary' : 'outline'}>{displayStatus(trip.status)}</Badge></TableCell>
                  <TableCell className="text-right"><RowActions disabled={deletingId === trip.id} onEdit={() => onEdit(trip)} onDelete={() => onDelete(trip)} /></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          ) : null}

          {section === 'notices' ? (
            <Table>
              <TableHeader><TableRow><TableHead>Notice</TableHead><TableHead>Published</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>{resources.notices.map((notice) => (
                <TableRow key={notice.id}>
                  <TableCell><p className="font-medium">{notice.title}</p><p className="max-w-xl truncate text-xs text-muted-foreground">{notice.message}</p></TableCell>
                  <TableCell>{new Date(notice.created_at).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={notice.status === 'ACTIVE' ? 'secondary' : 'success'}>{displayStatus(notice.status)}</Badge></TableCell>
                  <TableCell className="text-right"><RowActions disabled={deletingId === notice.id} onEdit={() => onEdit(notice)} onDelete={() => onDelete(notice)} /></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          ) : null}
          {!rows.length ? <p className="py-8 text-center text-sm text-muted-foreground">Nothing here yet. Add your first {singular}.</p> : null}
        </div>
      </CardContent>
    </Card>
  )
}
