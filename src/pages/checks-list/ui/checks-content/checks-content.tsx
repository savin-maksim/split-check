import { memo } from 'react'

import type { TCheck } from '@/entities/check'
import { WCheckCard } from '@/widgets/w-check-card'
import { AnimatedList } from '@/shared/ui'

type TChecksContentProps = {
  checks: TCheck[]
  currentCheckId: string | null
  onOpen: (check: TCheck) => void
  onEdit: (check: TCheck) => void
  onDelete: (check: TCheck) => void
}

export const ChecksContent = memo(({ checks, currentCheckId, onOpen, onEdit, onDelete }: TChecksContentProps) => (
  <AnimatedList
    as="ul"
    className="list-layout"
    items={checks}
    staggerDelay={0.05}
    getKey={(check) => check.id}
    renderItem={(check) => (
      <WCheckCard
        check={check}
        isActive={currentCheckId === check.id}
        onOpen={() => onOpen(check)}
        onEdit={() => onEdit(check)}
        onDelete={() => onDelete(check)}
      />
    )}
  />
))
ChecksContent.displayName = 'ChecksContent'
