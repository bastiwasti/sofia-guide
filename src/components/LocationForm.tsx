import { useState } from 'react'
import { X } from 'lucide-react'

interface LocationFormProps {
  initialCoords?: { lat: number; lng: number }
  onSave: (location: {
    category_id: number
    name: string
    meta: string | null
    rating: number | null
    price_range: string | null
    lat: number
    lng: number
  }) => Promise<void>
  onCancel: () => void
}

export default function LocationForm({ initialCoords, onSave, onCancel }: LocationFormProps) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const lat = initialCoords?.lat || 0
  const lng = initialCoords?.lng || 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    try {
      await onSave({
        category_id: 6,
        name: name.trim(),
        meta: null,
        rating: null,
        price_range: null,
        lat,
        lng
      })
    } catch (error) {
      console.error('Failed to save location:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="location-form-overlay">
      <div className="location-form">
        <div className="form-header">
          <h2>Neue Location</h2>
          <button className="close-button" onClick={onCancel}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-content">
            <div className="form-group">
              <label>Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z.B. Bar Central"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label>Kategorie</label>
              <div className="category-badge">Neu</div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onCancel}>
              Abbrechen
            </button>
            <button type="submit" className="save-btn" disabled={saving || !name.trim()}>
              {saving ? 'Speichert...' : 'Speichern'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .location-form-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 3000;
          display: flex;
          align-items: flex-end;
          animation: fadeIn 0.2s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .location-form {
          width: 100%;
          background: var(--color-white);
          border-radius: var(--border-radius-lg) var(--border-radius-lg) 0 0;
          box-shadow: 0 -4px 32px rgba(0, 0, 0, 0.2);
          animation: slideUp 0.3s ease;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          border-bottom: 1px solid var(--color-gray-light);
          flex-shrink: 0;
        }

        .form-header h2 {
          font-size: 18px;
          margin: 0;
        }

        .close-button {
          background: transparent;
          color: var(--color-gray-medium);
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .close-button:active {
          background: var(--color-gray-light);
        }

        .location-form form {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
        }

        .form-content {
          padding: var(--spacing-md);
          overflow-y: auto;
          flex: 1;
        }

        .form-group {
          margin-bottom: var(--spacing-md);
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-gray-dark);
          margin-bottom: 6px;
        }

        .category-badge {
          display: inline-block;
          background: #6B7280;
          color: white;
          padding: 6px 12px;
          border-radius: var(--border-radius-sm);
          font-size: 14px;
          font-weight: 500;
        }

        .form-actions {
          display: flex;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          border-top: 1px solid var(--color-gray-light);
          flex-shrink: 0;
          background: var(--color-white);
          position: sticky;
          bottom: 0;
        }

        .cancel-btn,
        .save-btn {
          flex: 1;
          padding: 12px;
          border-radius: var(--border-radius-sm);
          font-weight: 600;
          font-size: 14px;
        }

        .cancel-btn {
          background: var(--color-gray-light);
          color: var(--color-text);
          border: none;
        }

        .save-btn {
          background: var(--color-craft);
          color: white;
          border: none;
        }

        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        input[type="text"] {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid var(--color-gray-light);
          border-radius: var(--border-radius-sm);
          font-size: 14px;
          font-family: var(--font-body);
          background: var(--color-white);
        }

        input[type="text"]:focus {
          outline: none;
          border-color: var(--color-craft);
        }
      `}</style>
    </div>
  )
}
