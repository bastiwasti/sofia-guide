import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export interface Note {
  id: number
  content: string
  session_id: string | null
  backup_emoji: string | null
  author_emoji: string | null
  is_active_user: number
  created_at: string
}

export function useNotes(autoRefresh = false, refreshInterval = 30000) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchNotes()

    if (autoRefresh) {
      const interval = setInterval(fetchNotes, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  async function fetchNotes() {
    try {
      setLoading(true)
      setError(null)
      const data = await api.get<Note[]>('/notes')
      setNotes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes')
    } finally {
      setLoading(false)
    }
  }

  async function createNote(note: { content: string; session_id: string }) {
    try {
      const newNote = await api.post<Note>('/notes', note)
      setNotes(prev => [newNote, ...prev])
      return newNote
    } catch (err) {
      throw err
    }
  }

  async function deleteNote(id: number, session_id: string) {
    try {
      await api.delete(`/notes/${id}`, { session_id })
      setNotes(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      throw err
    }
  }

  return {
    notes,
    loading,
    error,
    refetch: fetchNotes,
    createNote,
    deleteNote
  }
}
