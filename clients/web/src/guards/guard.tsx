import React from 'react'
import { matchPath, Navigate, useLocation } from 'react-router-dom'
import { useSession } from '@/features/auth/hooks/session.hook'
import { paths, routes } from '@/settings/routes'

const AUTH_PREFIX = '@/auth/'
const SIGN_IN_ROUTE = '@/auth/sign-in'

// Route *patterns* (with :params), not resolved paths — matchPath needs patterns
const PUBLIC_PATTERNS = [
//   routes.home,
//   routes.user.public.profile,
  routes.auth.public.sign_in,
  routes.auth.public.sign_up,
//   routes.club.public.base,
]

const AUTH_PATTERNS = [routes.auth.public.sign_in, routes.auth.public.sign_up]

const matchesAny = (patterns: string[], pathname: string) =>
  patterns.some((pattern) => matchPath(pattern, pathname))

const Guard = ({ children }: { children: React.ReactNode }) => {
  const { data: session, isLoading } = useSession()
  const location = useLocation()

  const isPublicRoute = matchesAny(PUBLIC_PATTERNS, location.pathname)
  const isAuthRoute = matchesAny(AUTH_PATTERNS, location.pathname)

  if (isLoading) {
    return null
  }

  if (!session && !isPublicRoute) {
    return <Navigate to={paths.public.auth.signIn} state={{ from: location }} replace />
  }

  if (session && isAuthRoute) {
    return <Navigate to={'/'} replace />
  }

  return <>{children}</>
}

export default Guard