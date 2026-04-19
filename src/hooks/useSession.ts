import { useState, useEffect, useCallback } from 'react'
import { UserSession } from './useUserSessions'

export function useSession() {
  const [session, setSession] = useState<UserSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [validated, setValidated] = useState(false)

  const loadAndValidateSession = useCallback(async () => {
    setLoading(true)
    const saved = localStorage.getItem('userSession')
    
    if (!saved) {
      setSession(null)
      setLoading(false)
      setValidated(false)
      return
    }

    try {
      const parsed = JSON.parse(saved) as UserSession
      
      const response = await fetch(`/api/user-sessions/${parsed.session_id}/validate`)
      const data = await response.json()
      
      if (data.valid) {
        setSession(parsed)
      } else {
        localStorage.removeItem('userSession')
        setSession(null)
        console.log('Invalid session removed from localStorage')
      }
    } catch (e) {
      console.error('Failed to parse saved session:', e)
      localStorage.removeItem('userSession')
      setSession(null)
    } finally {
      setLoading(false)
      setValidated(true)
    }
  }, [])

  useEffect(() => {
    loadAndValidateSession()
  }, [loadAndValidateSession])

  const setSessionWithStorage = useCallback((newSession: UserSession | null) => {
    setSession(newSession)
    if (newSession) {
      localStorage.setItem('userSession', JSON.stringify(newSession))
    } else {
      localStorage.removeItem('userSession')
    }
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem('userSession')
    setSession(null)
  }, [])

  return {
    session,
    loading,
    validated,
    setSession: setSessionWithStorage,
    clearSession,
    refresh: loadAndValidateSession
  }
}
