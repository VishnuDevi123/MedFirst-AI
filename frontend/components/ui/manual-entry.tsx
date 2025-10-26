'use client'

import { useState } from 'react'
import { Hash, AlertCircle, ArrowRight, Keyboard } from 'lucide-react'

interface ManualEntryProps {
  onVerify: (objectId: string) => Promise<void>
}

export default function ManualEntry({ onVerify }: ManualEntryProps) {
  const [objectId, setObjectId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const trimmed = objectId.trim()

    if (!trimmed) {
      setError('Object ID is required')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await onVerify(trimmed)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      id="manual-entry"
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-8"
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4 mx-auto">
          <Keyboard className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Enter Object ID
        </h2>
        <p className="text-gray-600">
          Paste the Sui object ID if you prefer manual entry instead of scanning
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="objectId"
            className="block text-sm font-medium text-gray-900 mb-2"
          >
            Object ID *
          </label>
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              id="objectId"
              value={objectId}
              onChange={(event) => setObjectId(event.target.value)}
              placeholder="ex: 0x1234...abcd"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors ${
                error ? 'border-destructive' : 'border-gray-200'
              }`}
              autoComplete="off"
            />
          </div>
          {error && (
            <p className="mt-2 text-sm text-destructive flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              <span>Verifying…</span>
            </>
          ) : (
            <>
              <span>Verify Object ID</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
