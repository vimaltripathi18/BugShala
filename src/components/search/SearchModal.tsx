'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, ArrowRight, FileText, Cpu, Tag } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import type { SearchSuggestion } from '@/types'
import { cn } from '@/lib/utils'

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debouncedQuery = useDebounce(query, 200)

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus()
        setQuery('')
        setSuggestions([])
        setSelectedIndex(-1)
      }, 50)
    }
  }, [open])

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([])
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setSuggestions(data.suggestions ?? [])
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(() => fetchSuggestions(debouncedQuery), 0)
    return () => window.clearTimeout(timeout)
  }, [debouncedQuery, fetchSuggestions])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return
    if (selectedIndex >= 0 && suggestions[selectedIndex]) {
      router.push(suggestions[selectedIndex].href)
    } else {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      handleSubmit()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const iconMap = {
    bug: <FileText size={14} style={{ color: '#C5F36A' }} />,
    technology: <Cpu size={14} style={{ color: '#79A9F5' }} />,
    category: <Tag size={14} style={{ color: '#E6B85C' }} />,
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-xl rounded-xl overflow-hidden"
        style={{
          backgroundColor: '#13151A',
          border: '1px solid #343843',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        }}
      >
        {/* Search input */}
        <form onSubmit={handleSubmit}>
          <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: '#343843' }}>
            <Search size={16} style={{ color: '#747986', flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => { setQuery(e.target.value); setSelectedIndex(-1) }}
              onKeyDown={handleKeyDown}
              placeholder="Search an error, technology, or problem..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: '#E7E9EE', fontFamily: 'var(--font-inter)' }}
              aria-label="Search"
              autoComplete="off"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setSuggestions([]) }}
                className="p-0.5 rounded transition-opacity hover:opacity-80"
                style={{ color: '#747986' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
        </form>

        {/* Suggestions */}
        {query.length >= 2 && (
          <div className="max-h-80 overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div
                  className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: '#343843', borderTopColor: '#C5F36A' }}
                />
              </div>
            )}

            {!loading && suggestions.length === 0 && (
              <div className="px-4 py-6 text-center text-sm" style={{ color: '#747986' }}>
                No results for &quot;{query}&quot;
                <button
                  onClick={handleSubmit}
                  className="mt-2 flex items-center gap-1 mx-auto text-xs transition-opacity hover:opacity-80"
                  style={{ color: '#C5F36A' }}
                >
                  <span>Search all bugs</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            )}

            {!loading && suggestions.length > 0 && (
              <ul role="listbox">
                {suggestions.map((s, i) => (
                  <li key={s.id} role="option" aria-selected={i === selectedIndex}>
                    <button
                      onClick={() => { router.push(s.href); onClose() }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100',
                        i === selectedIndex ? 'opacity-100' : 'hover:opacity-90'
                      )}
                      style={{
                        backgroundColor: i === selectedIndex ? '#20232B' : 'transparent',
                      }}
                    >
                      <span className="flex-shrink-0">{iconMap[s.type]}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate" style={{ color: '#E7E9EE' }}>
                          {s.title}
                        </p>
                        {s.subtitle && (
                          <p className="text-xs truncate" style={{ color: '#747986' }}>
                            {s.subtitle}
                          </p>
                        )}
                      </div>
                      <ArrowRight size={12} style={{ color: '#343843', flexShrink: 0 }} />
                    </button>
                  </li>
                ))}

                {/* Full search link */}
                <li>
                  <button
                    onClick={handleSubmit}
                    className="w-full flex items-center gap-2 px-4 py-3 text-xs border-t transition-opacity hover:opacity-80"
                    style={{ color: '#C5F36A', borderColor: '#343843' }}
                  >
                    <Search size={12} />
                    <span>Search all results for &quot;{query}&quot;</span>
                    <ArrowRight size={12} className="ml-auto" />
                  </button>
                </li>
              </ul>
            )}
          </div>
        )}

        {/* Default state - quick links */}
        {query.length < 2 && (
          <div className="p-4">
            <p className="text-xs mb-3" style={{ color: '#747986' }}>Popular searches</p>
            <div className="flex flex-wrap gap-2">
              {[
                'Cannot read properties of undefined',
                'React hydration error',
                'CORS policy blocked',
                'Module not found',
                'npm dependency conflict',
              ].map(q => (
                <button
                  key={q}
                  onClick={() => setQuery(q)}
                  className="text-xs px-3 py-1.5 rounded-md transition-all duration-150"
                  style={{
                    backgroundColor: '#191B22',
                    border: '1px solid #343843',
                    color: '#A1A5B0',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Keyboard hint */}
        <div
          className="flex items-center gap-3 px-4 py-2 border-t text-xs"
          style={{ borderColor: '#343843', color: '#747986' }}
        >
          <span><kbd style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>↑↓</kbd> navigate</span>
          <span><kbd style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>↵</kbd> select</span>
          <span><kbd style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}
