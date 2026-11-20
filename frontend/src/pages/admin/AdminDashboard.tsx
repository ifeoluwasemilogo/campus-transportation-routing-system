import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { apiRequest } from '@/lib/api'
import { getSession, logoutUser } from '@/lib/auth'

import { AdminHeader } from './components/AdminHeader'
import { AdminNavigation } from './components/AdminNavigation'
import { AdminOverview } from './components/AdminOverview'
import { AdminResourceDialog } from './components/AdminResourceDialog'
import { AdminResourceManager } from './components/AdminResourceManager'
import { ADMIN_SECTION_INFO } from './config'
import { useAdminDashboard } from './hooks/useAdminDashboard'
import type { AdminResourceKind, AdminSection, ManagedRecord } from './types'

/** Page-level controller that connects admin navigation, data, and CRUD actions. */
export function AdminDashboard() {
  const navigate = useNavigate()
  const user = getSession()
  const { dashboardData, bookings, resources, dashboardError, refreshData, refreshAfterSave } = useAdminDashboard()
  const [section, setSection] = useState<AdminSection>('overview')
  const [managementError, setManagementError] = useState('')
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogKind, setDialogKind] = useState<AdminResourceKind>('routes')
  const [editingRecord, setEditingRecord] = useState<ManagedRecord | null>(null)

  const openCreate = (kind: AdminResourceKind) => {
    setDialogKind(kind)
    setEditingRecord(null)
    setManagementError('')
    setDialogOpen(true)
  }

  const openEdit = (kind: AdminResourceKind, record: ManagedRecord) => {
    setDialogKind(kind)
    setEditingRecord(record)
    setManagementError('')
    setDialogOpen(true)
  }

  const deleteRecord = async (kind: AdminResourceKind, record: ManagedRecord) => {
    const label = ADMIN_SECTION_INFO[kind].singular
    if (!window.confirm(`Delete this ${label}? This action cannot be undone.`)) return

    setDeletingId(record.id)
    setManagementError('')
    try {
      await apiRequest<void>(`/api/transport/admin/${kind}/${record.id}/`, { method: 'DELETE' })
      await refreshData()
    } catch (error) {
      setManagementError(error instanceof Error ? error.message : `Could not delete this ${label}.`)
    } finally {
      setDeletingId(null)
    }
  }

  const exportBookings = () => {
    const rows = [
      ['Student email', 'Route', 'Fare', 'Status', 'Booked at'],
      ...bookings.map((booking) => [
        booking.studentEmail,
        booking.route,
        booking.fare === 0 ? 'Free' : `NGN ${booking.fare}`,
        booking.status,
        new Date(booking.bookedAt).toISOString(),
      ]),
    ]
    const escapeCsv = (value: string) => {
      const safeValue = /^[=+\-@]/.test(value) ? `'${value}` : value
      return `"${safeValue.replaceAll('"', '""')}"`
    }
    const csv = rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'campus-transport-bookings.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

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
        <AdminHeader
          name={user?.name ?? 'Admin'}
          hasBookings={Boolean(bookings.length)}
          onExportBookings={exportBookings}
          onSignOut={handleLogout}
          onNewDispatch={() => openCreate('trips')}
        />

        <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
          <AdminNavigation
            section={section}
            onSelect={(nextSection) => {
              setSection(nextSection)
              setManagementError('')
            }}
          />

          <main id="overview" className="min-w-0 space-y-6">
            {dashboardError ? (
              <Alert className="dashboard-warning">
                <AlertTitle>Operations data is unavailable</AlertTitle>
                <AlertDescription>{dashboardError}</AlertDescription>
              </Alert>
            ) : null}
            {managementError ? (
              <Alert className="dashboard-error">
                <AlertTitle>Management action failed</AlertTitle>
                <AlertDescription>{managementError}</AlertDescription>
              </Alert>
            ) : null}
            {section === 'overview' ? (
              <AdminOverview
                dashboard={dashboardData}
                bookings={bookings}
                onManageTrips={() => setSection('trips')}
                onCreateNotice={openCreate}
              />
            ) : (
              <AdminResourceManager
                section={section}
                resources={resources}
                deletingId={deletingId}
                onCreate={() => openCreate(section)}
                onEdit={(record) => openEdit(section, record)}
                onDelete={(record) => void deleteRecord(section, record)}
              />
            )}
          </main>
        </div>
      </div>

      {dialogOpen ? (
        <AdminResourceDialog
          key={`${dialogKind}-${editingRecord?.id ?? 'new'}`}
          open={dialogOpen}
          kind={dialogKind}
          record={editingRecord}
          routes={resources.routes}
          vehicles={resources.vehicles}
          onOpenChange={setDialogOpen}
          onSaved={refreshAfterSave}
        />
      ) : null}
    </div>
  )
}
