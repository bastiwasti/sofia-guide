import { useState, useEffect } from 'react'
import { api, ApiError } from '../lib/api'

export interface UserSession {
  id: number
  session_id: string
  emoji: string
  recovery_code: string
  role: 'user' | 'admin'
  created_at: string
  last_seen: string
}

export function useUserSessions() {
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    const handleEmojiChange = () => {
      console.log('Emoji changed, refetching user sessions...')
      fetchSessions()
    }

    window.addEventListener('emojiChanged', handleEmojiChange)
    return () => window.removeEventListener('emojiChanged', handleEmojiChange)
  }, [])

  async function fetchSessions() {
    try {
      setLoading(true)
      setError(null)
      const data = await api.get<UserSession[]>('/user-sessions')
      setSessions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user sessions')
    } finally {
      setLoading(false)
    }
  }

  async function createSession(emoji: string, recoveryCode: string) {
    try {
      const newSession = await api.post<UserSession>('/user-sessions', {
        emoji,
        recovery_code: recoveryCode
      })
      setSessions(prev => [newSession, ...prev])
      return newSession
    } catch (err: unknown) {
      if (err instanceof ApiError && isErrorBody(err.body) && err.body.error === 'Emoji already taken') {
        throw { error: 'Emoji already taken', takenEmojis: (err.body as { taken_emojis?: string[] }).taken_emojis ?? [] }
      }
      throw err
    }
  }

  async function reclaimSession(emoji: string, recoveryCode: string) {
    try {
      const session = await api.put<UserSession>('/user-sessions/reclaim', {
        emoji,
        recovery_code: recoveryCode
      })
      setSessions(prev => prev.map(s => s.emoji === emoji ? session : s))
      return session
    } catch (err: unknown) {
      if (err instanceof ApiError && isErrorBody(err.body) && err.body.error === 'Invalid recovery code') {
        throw { error: 'Invalid recovery code' }
      }
      throw err
    }
  }

  async function deleteSession(sessionId: string) {
    await api.delete(`/user-sessions/${sessionId}`)
    setSessions(prev => prev.filter(s => s.session_id !== sessionId))
  }

  async function updateSessionEmoji(sessionId: string, emoji: string, recoveryCode: string) {
    try {
      const updated = await api.patch<UserSession>(`/user-sessions/${sessionId}/emoji`, {
        emoji,
        recovery_code: recoveryCode
      })
      setSessions(prev => prev.map(s => s.session_id === sessionId ? updated : s))
      return updated
    } catch (err: unknown) {
      if (err instanceof ApiError && isErrorBody(err.body)) {
        if (err.body.error === 'Emoji already taken') {
          throw { error: 'Emoji already taken', takenEmojis: (err.body as { taken_emojis?: string[] }).taken_emojis ?? [] }
        }
        if (err.body.error === 'Invalid recovery code') {
          throw { error: 'Invalid recovery code' }
        }
      }
      throw err
    }
  }

  function isErrorBody(body: unknown): body is { error: string } {
    return !!body && typeof body === 'object' && 'error' in body && typeof (body as { error: unknown }).error === 'string'
  }

  return {
    sessions,
    loading,
    error,
    refetch: fetchSessions,
    createSession,
    reclaimSession,
    deleteSession,
    updateSessionEmoji
  }
}