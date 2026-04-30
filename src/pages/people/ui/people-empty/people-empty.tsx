import { UserPlus, Users } from 'lucide-react'

import { PageHeader, EmptyState } from '@/shared/ui'

export const PeopleEmpty = () => (
  <>
    <PageHeader icon={<Users size={'var(--header-icon-size)'} aria-hidden="true" />} title="Участники" />
    <EmptyState
      icon={<UserPlus size={'var(--empty-state-icon-size)'} aria-hidden="true" />}
      title="Добавьте участников"
    >
      <p>
        Нажмите на кнопку в навигационной панели, чтобы добавить людей, между которыми нужно разделить расходы
      </p>
    </EmptyState>
  </>
)
