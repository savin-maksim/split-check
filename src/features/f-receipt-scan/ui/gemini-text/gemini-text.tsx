import type { ComponentPropsWithoutRef } from 'react'

import { cn } from '@/shared/lib'

import './gemini-text.scss'

type TGeminiTextProps = ComponentPropsWithoutRef<'span'>

export const GeminiText = ({ className, children, ...rest }: TGeminiTextProps) => (
  <span className={cn('gemini-text', className)} {...rest}>
    {children}
  </span>
)
