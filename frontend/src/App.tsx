import { lazy, Suspense, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { getDashboardRoute, getSession } from './lib/auth'
import { LoginPage } from './pages/auth/LoginPage'
import { StudentDashboard } from './pages/student/StudentDashboard'

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(({ AdminDashboard: page }) => ({ default: page })))

function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: ReactNode
  requiredRole?: 'student' | 'admin'
}) {
  const session = getSession()

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && session.role !== requiredRole) {
    return <Navigate to={getDashboardRoute(session.role)} replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/student"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <Suspense fallback={<div className="p-8 text-sm text-slate-500">Loading admin dashboard…</div>}>
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
