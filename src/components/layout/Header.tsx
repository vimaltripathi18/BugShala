'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { Search, Menu, X, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import SearchModal from '@/components/search/SearchModal'

const NAV_LINKS = [
  { href: '/bugs', label: 'Bug Library' },
  { href: '/devkit', label: 'DevKit' },
  { href: '/arena', label: 'Bug Arena' },
  { href: '/bugs#technologies', label: 'Technologies' },
  { href: '/bugs#categories', label: 'Categories' },
  { href: '/about', label: 'About' },
]

export default function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const mobileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setMobileOpen(false)
        setSearchOpen(false)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    const timeout = window.setTimeout(() => setMobileOpen(false), 0)
    return () => window.clearTimeout(timeout)
  }, [pathname])

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname.startsWith(href.split('#')[0])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 h-[60px] transition-all duration-200',
          scrolled
            ? 'border-b'
            : 'border-b border-transparent'
        )}
        style={{
          backgroundColor: scrolled ? 'rgba(13,14,18,0.95)' : '#0D0E12',
          borderColor: scrolled ? '#343843' : 'transparent',
          backdropFilter: scrolled ? 'blur(8px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 focus-visible:outline-none" style={{ outline: 'none' }}>
            <div
              className="flex items-center justify-center w-8 h-8 rounded-lg"
              style={{ backgroundColor: '#C5F36A' }}
              aria-hidden="true"
            >
              <Zap size={16} style={{ color: '#15190D' }} strokeWidth={2.5} />
            </div>
            <span className="text-[15px] font-semibold tracking-tight" style={{ color: '#E7E9EE' }}>
              Bug<span style={{ color: '#C5F36A' }}>Shala</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm transition-all duration-150',
                  isActive(link.href)
                    ? 'font-medium'
                    : 'hover:opacity-100'
                )}
                style={{
                  color: isActive(link.href) ? '#C5F36A' : '#A1A5B0',
                  backgroundColor: isActive(link.href) ? 'rgba(197,243,106,0.08)' : 'transparent',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all duration-150 cursor-pointer"
              style={{
                backgroundColor: '#191B22',
                border: '1px solid #343843',
                color: '#747986',
              }}
              aria-label="Open search (Ctrl+K)"
            >
              <Search size={14} />
              <span>Search</span>
              <kbd
                className="hidden lg:flex items-center gap-0.5 text-[11px] rounded px-1 py-0.5"
                style={{ backgroundColor: '#262A34', color: '#747986', fontFamily: 'var(--font-jetbrains-mono)' }}
              >
                <span className="text-[10px]">⌘</span>K
              </kbd>
            </button>

            {/* Mobile search icon */}
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 rounded-md transition-all duration-150"
              style={{ color: '#A1A5B0' }}
              aria-label="Open search"
            >
              <Search size={18} />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-md transition-all duration-150"
              style={{ color: '#A1A5B0' }}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile nav drawer */}
        {mobileOpen && (
          <div
            ref={mobileRef}
            className="md:hidden border-t"
            style={{
              backgroundColor: '#13151A',
              borderColor: '#343843',
            }}
          >
            <nav className="flex flex-col p-4 gap-1" aria-label="Mobile navigation">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2.5 rounded-md text-sm transition-all duration-150"
                  style={{
                    color: isActive(link.href) ? '#C5F36A' : '#A1A5B0',
                    backgroundColor: isActive(link.href) ? 'rgba(197,243,106,0.08)' : 'transparent',
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Search Modal */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
