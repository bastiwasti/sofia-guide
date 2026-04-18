import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export interface Category {
  id: number
  name: string
  color: string
  icon: string
  created_at: string
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      setLoading(true)
      setError(null)
      const data = await api.get<Category[]>('/categories')

      const sortOrder = ['Kneipen', 'Essen', 'Nightlife', 'Sehenswürdigkeiten', 'Neu']

      const sortedData = data.sort((a, b) => {
        const indexA = sortOrder.indexOf(a.name)
        const indexB = sortOrder.indexOf(b.name)

        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB
        } else if (indexA !== -1) {
          return -1
        } else if (indexB !== -1) {
          return 1
        } else {
          return a.name.localeCompare(b.name)
        }
      })

      setCategories(sortedData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  async function createCategory(category: { name: string; color: string; icon: string }) {
    try {
      const newCategory = await api.post<Category>('/categories', category)
      setCategories(prev => [...prev, newCategory])
      return newCategory
    } catch (err) {
      throw err
    }
  }

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
    createCategory
  }
}
