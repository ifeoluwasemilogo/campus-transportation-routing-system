import { apiRequest } from './api'

export type UserRole = 'student' | 'admin'

export type SessionUser = {
  email: string
  name: string
  role: UserRole
  accessToken: string
  refreshToken: string
}

const SESSION_KEY = 'campus-transport-session'

export function getSession(): SessionUser | null {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    const session: unknown = JSON.parse(raw)
    if (
      typeof session === 'object' &&
      session !== null &&
      'email' in session &&
      typeof session.email === 'string' &&
      'name' in session &&
      typeof session.name === 'string' &&
      'role' in session &&
      (session.role === 'student' || session.role === 'admin') &&
      'accessToken' in session &&
      typeof session.accessToken === 'string' &&
      'refreshToken' in session &&
      typeof session.refreshToken === 'string'
    ) {
      return session as SessionUser
    }
    localStorage.removeItem(SESSION_KEY)
    return null
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function setSession(user: SessionUser) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export async function logoutUser() {
  const session = getSession()
  try {
    if (session?.refreshToken) {
      await apiRequest<{ detail: string }>(
        '/api/accounts/logout/',
        {
          method: 'POST',
          body: JSON.stringify({ refresh: session.refreshToken }),
        },
      )
    }
  } finally {
    clearSession()
  }
}

export function getDashboardRoute(role: UserRole) {
  return role === 'admin' ? '/admin' : '/student'
}

export async function loginUser(email: string, password: string) {
  const trimmedEmail = email.trim().toLowerCase()
  const data = await apiRequest<{
    user: { email: string; name: string; role: UserRole }
    tokens: { access: string; refresh: string }
  }>(
    '/api/accounts/login/',
    {
      method: 'POST',
      body: JSON.stringify({ email: trimmedEmail, password }),
    },
  )

  if (
    !data.tokens.access ||
    !data.tokens.refresh ||
    !data.user.email ||
    !data.user.name ||
    !['admin', 'student'].includes(data.user.role)
  ) {
    throw new Error('The server returned an invalid login response.')
  }

  return {
    email: data.user.email,
    name: data.user.name,
    role: data.user.role,
    accessToken: data.tokens.access,
    refreshToken: data.tokens.refresh,
  }
}

export async function registerStudent({
  firstName,
  lastName,
  email,
  password,
}: {
  firstName: string
  lastName: string
  email: string
  password: string
}) {
  return apiRequest<{ detail: string }>(
    '/api/accounts/register/',
    {
      method: 'POST',
      body: JSON.stringify({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
      }),
    },
  )
}
