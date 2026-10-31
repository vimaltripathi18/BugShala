import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 flex-wrap">
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          {index > 0 && (
            <ChevronRight size={12} style={{ color: '#343843' }} aria-hidden="true" />
          )}
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="text-xs transition-colors duration-150 hover:opacity-80"
              style={{ color: '#A1A5B0' }}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className="text-xs"
              style={{ color: index === items.length - 1 ? '#E7E9EE' : '#A1A5B0' }}
              aria-current={index === items.length - 1 ? 'page' : undefined}
            >
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  )
}
