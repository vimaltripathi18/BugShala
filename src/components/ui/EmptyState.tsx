import { Search } from 'lucide-react'
import Button from './Button'

interface EmptyStateProps {
  heading?: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({
  heading = 'No results found',
  description = 'Try adjusting your search or filters.',
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div
        className="flex items-center justify-center w-14 h-14 rounded-xl mb-4"
        style={{ backgroundColor: '#20232B', border: '1px solid #343843' }}
      >
        {icon ?? <Search size={22} style={{ color: '#747986' }} />}
      </div>
      <h3 className="text-base font-semibold mb-2" style={{ color: '#E7E9EE' }}>
        {heading}
      </h3>
      <p className="text-sm max-w-xs" style={{ color: '#747986' }}>
        {description}
      </p>
      {action && (
        <Button variant="secondary" size="sm" className="mt-5" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
