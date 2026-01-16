import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-blue-200 bg-blue-100 text-blue-700 hover:bg-blue-100/80 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
        secondary:
          'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100/80 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        destructive:
          'border-red-200 bg-red-100 text-red-700 hover:bg-red-100/80 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        outline: 'text-foreground border-slate-200 dark:border-slate-800',
        success:
          'border-green-200 bg-green-100 text-green-700 hover:bg-green-100/80 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
        warning:
          'border-yellow-200 bg-yellow-50 text-yellow-800 hover:bg-yellow-50/80 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
