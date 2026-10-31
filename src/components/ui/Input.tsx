import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  rightElement?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ icon, rightElement, className, style, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3 flex items-center pointer-events-none" style={{ color: '#747986' }}>
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg text-sm transition-all duration-150 outline-none',
            icon ? 'pl-9' : 'pl-3',
            rightElement ? 'pr-10' : 'pr-3',
            'py-2.5',
            className
          )}
          style={{
            backgroundColor: '#191B22',
            border: '1px solid #343843',
            color: '#E7E9EE',
            ...style,
          }}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export default Input
