export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(
  /\/+$/,
  '',
)
const SESSION_KEY = 'campus-transport-session'

type StoredSession = {
  accessToken?: string
  refreshToken?: string
}

function readStoredSession(): StoredSession | null {
  try {
    const stored: unknown = JSON.parse(
      localStorage.getItem(SESSION_KEY) || 'null',
    )
    return typeof stored === 'object' && stored !== null
      ? (stored as StoredSession)
      : null
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

async function refreshAccessToken(): Promise<string> {
  const session = readStoredSession()
  if (!session?.refreshToken) {
    throw new Error('Your session expired. Please sign in again.')
  }

  const response = await fetch(`${API_BASE_URL}/api/accounts/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: session.refreshToken }),
  })
  const data = (await response.json().catch(() => null)) as
    | { access?: string; detail?: string }
    | null
  if (!response.ok) {
    if (response.status === 400 || response.status === 401) {
      localStorage.removeItem(SESSION_KEY)
      throw new Error(
        data?.detail ||
          'Your saved refresh token is no longer valid. Please sign in again.',
      )
    }
    throw new Error(
      data?.detail ||
        `Could not refresh your session (${response.status}). Please try again.`,
    )
  }
  if (!data?.access) {
    localStorage.removeItem(SESSION_KEY)
    throw new Error(
      'The server returned an invalid session refresh response. Please sign in again.',
    )
  }

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ ...session, accessToken: data.access }),
  )
  return data.access
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const request = (token?: string) =>
    fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })

  let response = await request(readStoredSession()?.accessToken)
  if (
    response.status === 401
    && path !== '/api/accounts/login/'
    && path !== '/api/accounts/register/'
    && path !== '/api/accounts/token/refresh/'
  ) {
    response = await request(await refreshAccessToken())
  }

  const data = (await response.json().catch(() => null)) as
    | { detail?: string }
    | T
    | null
  if (!response.ok) {
    const message =
      getResponseError(data) || `Request failed (${response.status})`
    throw new Error(message)
  }
  if (response.status === 204) {
    return undefined as T
  }
  if (data === null) {
    throw new Error('The server returned an empty response.')
  }
  return data as T
}

function getResponseError(data: unknown): string | null {
  if (!data || typeof data !== 'object') return null
  if ('detail' in data && typeof data.detail === 'string') return data.detail

  const errors = Object.entries(data).flatMap(([field, messages]) => {
    const list = Array.isArray(messages) ? messages : [messages]
    return list
      .filter(
        (message): message is string => typeof message === 'string',
      )
      .map((message) => `${field}: ${message}`)
  })
  return errors.length ? errors.join(' ') : null
}
