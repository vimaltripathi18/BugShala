import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const variantStyles = {
  primary: {
    backgroundColor: '#C5F36A',
    color: '#15190D',
    border: 'none',
    hover: '#8FBF3D',
  },
  secondary: {
    backgroundColor: '#20232B',
    color: '#E7E9EE',
    border: '1px solid #343843',
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#A1A5B0',
    border: 'none',
  },
  outline: {
    backgroundColor: 'transparent',
    color: '#E7E9EE',
    border: '1px solid #343843',
  },
  danger: {
    backgroundColor: 'rgba(240,113,120,0.1)',
    color: '#F07178',
    border: '1px solid rgba(240,113,120,0.2)',
  },
}

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', className, children, style, ...props }, ref) => {
    const vs = variantStyles[variant]
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2',
          sizeStyles[size],
          className
        )}
        style={{
          backgroundColor: vs.backgroundColor,
          color: vs.color,
          border: vs.border ?? 'none',
          ...style,
        }}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
export default Button
