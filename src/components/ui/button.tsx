import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center text-[13px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'text-black hover:opacity-88 active:scale-[0.97]',
        destructive: 'bg-red-500 text-white hover:bg-red-600',
        outline: 'border-[1.5px] bg-transparent hover:border-[var(--gray-2)]',
        secondary: 'bg-[var(--gray-4)] hover:bg-[var(--gray-3)]',
        ghost: 'text-[var(--gray-1)] hover:bg-[var(--gray-4)] hover:text-black',
        link: 'text-[var(--yellow-dim)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-[14px] py-[7px]',
        sm: 'h-9 px-3 py-1.5',
        lg: 'h-11 px-6 py-2.5',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    const baseStyles = variant === 'default'
      ? {
          background: 'var(--yellow)',
          borderRadius: 'var(--radius-sm)',
        }
      : variant === 'outline'
      ? {
          borderColor: 'var(--gray-3)',
          color: 'var(--black-3)',
          borderRadius: 'var(--radius-sm)',
        }
      : { borderRadius: 'var(--radius-sm)' }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        style={baseStyles}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
