import Link from 'next/link'
import { Zap } from 'lucide-react'

const FOOTER_LINKS = {
  Product: [
    { href: '/bugs', label: 'Bug Library' },
    { href: '/bugs#technologies', label: 'Technologies' },
    { href: '/bugs#categories', label: 'Categories' },
    { href: '/about', label: 'About' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
}

export default function Footer() {
  const year = 2026

  return (
    <footer
      className="border-t mt-auto"
      style={{ backgroundColor: '#13151A', borderColor: '#343843' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 w-fit mb-3">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg"
                style={{ backgroundColor: '#C5F36A' }}
              >
                <Zap size={16} style={{ color: '#15190D' }} strokeWidth={2.5} />
              </div>
              <span className="text-[15px] font-semibold tracking-tight" style={{ color: '#E7E9EE' }}>
                Bug<span style={{ color: '#C5F36A' }}>Shala</span>
              </span>
            </Link>
            <p className="text-sm max-w-xs" style={{ color: '#747986', lineHeight: '1.6' }}>
              A practical debugging knowledge platform. Understand errors, discover reliable fixes, and become a better developer.
            </p>
            <p className="text-xs mt-4" style={{ color: '#747986' }}>
              Every bug has a lesson.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#747986' }}>
                {group}
              </h3>
              <ul className="space-y-2">
                {links.map(link => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors duration-150 hover:opacity-100"
                      style={{ color: '#A1A5B0' }}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-10 pt-6 border-t text-xs"
          style={{ borderColor: '#343843', color: '#747986' }}
        >
          <p>© {year} BugShala. All rights reserved.</p>
          <p>Built for developers who want to understand their errors.</p>
        </div>
      </div>
    </footer>
  )
}
