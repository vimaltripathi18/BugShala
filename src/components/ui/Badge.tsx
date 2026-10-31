import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'lime' | 'success' | 'warning' | 'error' | 'info' | 'muted'
  size?: 'sm' | 'md'
  className?: string
}

const variantStyles: Record<string, { bg: string; color: string; border: string }> = {
  default: { bg: '#20232B', color: '#A1A5B0', border: '#343843' },
  lime: { bg: 'rgba(197,243,106,0.1)', color: '#C5F36A', border: 'rgba(197,243,106,0.2)' },
  success: { bg: 'rgba(72,199,142,0.1)', color: '#48C78E', border: 'rgba(72,199,142,0.2)' },
  warning: { bg: 'rgba(230,184,92,0.1)', color: '#E6B85C', border: 'rgba(230,184,92,0.2)' },
  error: { bg: 'rgba(240,113,120,0.1)', color: '#F07178', border: 'rgba(240,113,120,0.2)' },
  info: { bg: 'rgba(121,169,245,0.1)', color: '#79A9F5', border: 'rgba(121,169,245,0.2)' },
  muted: { bg: '#191B22', color: '#747986', border: '#343843' },
}

export default function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  const styles = variantStyles[variant] ?? variantStyles.default
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-md border',
        size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1',
        className
      )}
      style={{
        backgroundColor: styles.bg,
        color: styles.color,
        borderColor: styles.border,
        fontFamily: 'var(--font-inter)',
      }}
    >
      {children}
    </span>
  )
}
