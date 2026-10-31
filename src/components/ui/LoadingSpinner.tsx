import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizes = { sm: 16, md: 24, lg: 32 }
  const s = sizes[size]
  return (
    <div
      className={cn('animate-spin rounded-full border-2 border-t-transparent', className)}
      style={{
        width: s,
        height: s,
        borderColor: '#343843',
        borderTopColor: '#C5F36A',
      }}
      role="status"
      aria-label="Loading"
    />
  )
}
