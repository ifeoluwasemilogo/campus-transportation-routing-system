import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { apiRequest } from '@/lib/api'

import type { AdminResourceKind, AdminRoute, AdminTrip, AdminVehicle, ManagedRecord } from '../types'

type FormValues = Record<string, string | boolean>

type Props = {
  open: boolean
  kind: AdminResourceKind
  record: ManagedRecord | null
  routes: AdminRoute[]
  vehicles: AdminVehicle[]
  onOpenChange: (open: boolean) => void
  onSaved: () => Promise<void>
}

const resourceLabels: Record<AdminResourceKind, string> = {
  routes: 'route',
  vehicles: 'vehicle',
  trips: 'trip',
  notices: 'service notice',
}

function localDateTimeValue(value: string) {
  const date = new Date(value)
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
  return date.toISOString().slice(0, 16)
}

function defaultValues(
  kind: AdminResourceKind,
  record: ManagedRecord | null,
  routes: AdminRoute[],
  vehicles: AdminVehicle[],
): FormValues {
  if (record) {
    if (kind === 'trips') {
      const trip = record as AdminTrip
      return {
        route: trip.route.toString(),
        vehicle: trip.vehicle.toString(),
        departure_at: localDateTimeValue(trip.departure_at),
        status: trip.status,
      }
    }
    const values: FormValues = {}
    for (const [name, value] of Object.entries(record)) {
      if (name === 'id' || name === 'created_at') continue
      if (typeof value === 'string' || typeof value === 'boolean') values[name] = value
      else if (typeof value === 'number') values[name] = value.toString()
    }
    return values
  }

  if (kind === 'routes') {
    return {
      slug: '',
      title: '',
      origin: '',
      destination: '',
      mode: 'SHUTTLE',
      duration_minutes: '15',
      distance_km: '1.00',
      fare: '0',
      active: true,
    }
  }
  if (kind === 'vehicles') {
    return { code: '', registration: '', capacity: '20', accessible: false, status: 'ACTIVE' }
  }
  if (kind === 'trips') {
    const departure = new Date(Date.now() + 60 * 60 * 1000)
    departure.setMinutes(departure.getMinutes() - departure.getTimezoneOffset())
    return {
      route: routes[0]?.id?.toString() ?? '',
      vehicle: vehicles[0]?.id?.toString() ?? '',
      departure_at: departure.toISOString().slice(0, 16),
      status: 'SCHEDULED',
    }
  }
  return { title: '', message: '', status: 'ACTIVE' }
}

export function AdminResourceDialog({
  open,
  kind,
  record,
  routes,
  vehicles,
  onOpenChange,
  onSaved,
}: Props) {
  const [values, setValues] = useState<FormValues>(() => defaultValues(kind, record, routes, vehicles))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const label = resourceLabels[kind]

  const updateValue = (name: string, value: string | boolean) => {
    setValues((current) => ({ ...current, [name]: value }))
  }

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const body: Record<string, string | boolean | number> = { ...values }
      if (kind === 'trips') {
        body.route = Number(body.route)
        body.vehicle = Number(body.vehicle)
      }
      await apiRequest(
        `/api/transport/admin/${kind}/${record?.id ? `${record.id}/` : ''}`,
        {
          method: record ? 'PATCH' : 'POST',
          body: JSON.stringify(body),
        },
      )
      await onSaved()
      onOpenChange(false)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : `Could not save this ${label}.`)
    } finally {
      setSaving(false)
    }
  }

  const textField = (name: string, title: string, type = 'text', required = true) => (
    <div className="space-y-2" key={name}>
      <Label htmlFor={`resource-${name}`}>{title}</Label>
      <Input
        id={`resource-${name}`}
        type={type}
        min={type === 'number' ? '0' : undefined}
        step={name === 'distance_km' ? '0.01' : undefined}
        required={required}
        value={values[name]?.toString() ?? ''}
        onChange={(event) => {
          const value = event.target.value
          updateValue(name, value)
          if (kind === 'routes' && name === 'title' && !record) {
            updateValue('slug', value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60))
          }
        }}
      />
    </div>
  )

  const selectField = (name: string, title: string, options: Array<[string, string]>) => (
    <div className="space-y-2" key={name}>
      <Label htmlFor={`resource-${name}`}>{title}</Label>
      <select
        id={`resource-${name}`}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        required
        value={values[name]?.toString() ?? ''}
        onChange={(event) => updateValue(name, event.target.value)}
      >
        {options.map(([value, optionLabel]) => (
          <option value={value} key={value}>{optionLabel}</option>
        ))}
      </select>
    </div>
  )

  const booleanField = (name: string, title: string) => (
    <label key={name} className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm font-medium">
      <input
        type="checkbox"
        checked={values[name] === true}
        onChange={(event) => updateValue(name, event.target.checked)}
        className="h-4 w-4 accent-emerald-600"
      />
      {title}
    </label>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{record ? 'Edit' : 'Add'} {label}</DialogTitle>
          <DialogDescription>Changes are saved to the transport system and reflected in the student portal.</DialogDescription>
        </DialogHeader>
        <form className="space-y-5" onSubmit={save}>
          {kind === 'routes' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {textField('title', 'Route name')}
              {textField('slug', 'Route ID', 'text')}
              {textField('origin', 'Origin')}
              {textField('destination', 'Destination')}
              {selectField('mode', 'Route type', [
                ['SHUTTLE', 'Shuttle'],
                ['WALK_SHUTTLE', 'Walk + shuttle'],
                ['WALKING', 'Walking path'],
              ])}
              {textField('duration_minutes', 'Duration (minutes)', 'number')}
              {textField('distance_km', 'Distance (km)', 'number')}
              {textField('fare', 'Fare (NGN)', 'number')}
              {booleanField('active', 'Available to students')}
            </div>
          ) : null}
          {kind === 'vehicles' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {textField('code', 'Fleet code')}
              {textField('registration', 'Registration')}
              {textField('capacity', 'Seat capacity', 'number')}
              {selectField('status', 'Vehicle status', [
                ['ACTIVE', 'Active'],
                ['MAINTENANCE', 'Maintenance'],
                ['INACTIVE', 'Inactive'],
              ])}
              {booleanField('accessible', 'Wheelchair accessible')}
            </div>
          ) : null}
          {kind === 'trips' ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {selectField('route', 'Route', routes.map((route) => [route.id.toString(), route.title]))}
              {selectField('vehicle', 'Vehicle', vehicles.map((vehicle) => [vehicle.id.toString(), `${vehicle.code} · ${vehicle.registration}`]))}
              {textField('departure_at', 'Departure time', 'datetime-local')}
              {selectField('status', 'Trip status', [
                ['SCHEDULED', 'Scheduled'],
                ['DELAYED', 'Delayed'],
                ['CANCELLED', 'Cancelled'],
                ['COMPLETED', 'Completed'],
              ])}
              {(!routes.length || !vehicles.length) ? (
                <p className="text-sm text-warning-foreground sm:col-span-2">Create at least one route and one vehicle before scheduling a trip.</p>
              ) : null}
            </div>
          ) : null}
          {kind === 'notices' ? (
            <div className="space-y-4">
              {textField('title', 'Notice title')}
              <div className="space-y-2">
                <Label htmlFor="resource-message">Message</Label>
                <Textarea
                  id="resource-message"
                  required
                  value={values.message?.toString() ?? ''}
                  onChange={(event) => updateValue('message', event.target.value)}
                />
              </div>
              {selectField('status', 'Notice status', [
                ['ACTIVE', 'Active'],
                ['RESOLVED', 'Resolved'],
              ])}
            </div>
          ) : null}
          {error ? <p role="alert" className="dashboard-error rounded-lg px-3 py-2 text-sm">{error}</p> : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || (kind === 'trips' && (!routes.length || !vehicles.length))}>
              {saving ? 'Saving…' : record ? 'Save changes' : `Create ${label}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
