import { useState } from 'react'
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import universityLogo from '@/assets/images/ui_logo.png'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getDashboardRoute, loginUser, registerStudent, setSession } from '@/lib/auth'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationMessage, setRegistrationMessage] = useState('')
  const logoutWarning =
    typeof location.state === 'object' &&
    location.state !== null &&
    'logoutWarning' in location.state
      ? location.state.logoutWarning
      : ''

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (isRegistering && password !== confirmPassword) {
      setError('The passwords do not match.')
      return
    }

    setError('')
    setRegistrationMessage('')
    setIsSubmitting(true)
    try {
      if (isRegistering) {
        const result = await registerStudent({
          firstName,
          lastName,
          email,
          password,
        })
        setIsRegistering(false)
        setPassword('')
        setConfirmPassword('')
        setRegistrationMessage(result.detail)
        return
      }

      const user = await loginUser(email, password)
      setSession(user)
      navigate(getDashboardRoute(user.role), { replace: true })
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : 'Sign in failed. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_25%),linear-gradient(135deg,#eef6ff_0%,#f8fafc_35%,#edfdf5_100%)] p-4">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-slate-200 bg-white/90 shadow-soft backdrop-blur-sm lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative hidden overflow-hidden bg-slate-950 p-8 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,197,94,0.35),_transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_35%,#082f49_100%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white p-1.5">
                <img
                  src={universityLogo}
                  alt="University of Ibadan crest"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.32em] text-slate-300">
                  University
                </p>
                <h2 className="text-xl font-semibold">Ibadan Transit</h2>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">
                  Campus mobility
                </p>
                <h1 className="text-4xl font-semibold leading-tight">
                  Find the fastest route across campus.
                </h1>
              </div>

              <div className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">24/7 Shuttle tracking</span>
                  <ShieldCheck className="h-4 w-4 text-emerald-300" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Accessibility support</span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-xs text-emerald-200">
                    Enabled
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-300">Smart route planner</span>
                  <span className="rounded-full bg-cyan-500/15 px-2 py-1 text-xs text-cyan-200">
                    Live
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              “The campus transportation system helps students move safely, faster, and more confidently across the university.”
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 md:p-10">
          <Card className="w-full max-w-md border-slate-200 bg-white shadow-sm">
            <CardHeader className="space-y-2 pb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                <img
                  src={universityLogo}
                  alt="University of Ibadan crest"
                  className="h-full w-full rounded-2xl bg-white p-1 object-contain"
                />
              </div>
              <CardTitle className="text-3xl font-bold tracking-tight">
                {isRegistering
                  ? 'Create student account'
                  : 'Welcome back'}
              </CardTitle>
              <CardDescription>
                {isRegistering
                  ? 'Create an account to plan routes and manage your shuttle bookings.'
                  : 'Sign in to access your student or admin dashboard.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                {isRegistering ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First name</Label>
                      <Input
                        id="first-name"
                        autoComplete="given-name"
                        required
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last name</Label>
                      <Input
                        id="last-name"
                        autoComplete="family-name"
                        required
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                      />
                    </div>
                  </div>
                ) : null}
                <div className="space-y-2">
                  <Label htmlFor="email">University email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10"
                      placeholder="student@ui.edu.ng"
                      autoComplete="username"
                      required
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value)
                        setError('')
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-10"
                      placeholder="Enter your password"
                      autoComplete={
                        isRegistering ? 'new-password' : 'current-password'
                      }
                      required
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value)
                        setError('')
                      }}
                    />
                  </div>
                </div>

                {isRegistering ? (
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm password</Label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="confirm-password"
                        type="password"
                        className="pl-10"
                        placeholder="Enter your password again"
                        autoComplete="new-password"
                        minLength={8}
                        required
                        value={confirmPassword}
                        onChange={(event) => {
                          setConfirmPassword(event.target.value)
                          setError('')
                        }}
                      />
                    </div>
                  </div>
                ) : null}

                {error ? (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                  >
                    {error}
                  </p>
                ) : null}
                {registrationMessage ? (
                  <p
                    role="status"
                    className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                  >
                    {registrationMessage}
                  </p>
                ) : null}
                {typeof logoutWarning === 'string' && logoutWarning ? (
                  <p
                    role="status"
                    className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
                  >
                    {logoutWarning}
                  </p>
                ) : null}

                <Button
                  className="w-full gap-2"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? isRegistering
                      ? 'Creating account...'
                      : 'Signing in...'
                    : isRegistering
                      ? 'Create student account'
                      : 'Sign in'}
                  {!isSubmitting ? <ArrowRight className="h-4 w-4" /> : null}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  {isRegistering
                    ? 'Already have an account?'
                    : 'New student?'}{' '}
                  <Button
                    type="button"
                    variant="link"
                    className="h-auto p-0"
                    onClick={() => {
                      setIsRegistering((current) => !current)
                      setError('')
                      setRegistrationMessage('')
                    }}
                  >
                    {isRegistering ? 'Sign in' : 'Create an account'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
