import { memo } from 'react'

import type { TCheck } from '@/entities/check'
import { WCheckCard } from '@/widgets/w-check-card'

type TChecksContentProps = {
  checks: TCheck[]
  currentCheckId: string | null
  onOpen: (check: TCheck) => void
  onEdit: (check: TCheck) => void
  onDelete: (check: TCheck) => void
}

export const ChecksContent = memo(({ checks, currentCheckId, onOpen, onEdit, onDelete }: TChecksContentProps) => (
  <ul className="list-layout">
    {checks.map((check) => (
      <WCheckCard
        key={check.id}
        check={check}
        isActive={currentCheckId === check.id}
        onOpen={() => onOpen(check)}
        onEdit={() => onEdit(check)}
        onDelete={() => onDelete(check)}
      />
    ))}
  </ul>
))
ChecksContent.displayName = 'ChecksContent'
