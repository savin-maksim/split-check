import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useLocation, useParams } from 'react-router-dom'
import { Receipt, Users, Calculator, BarChart3, FilePlus, UserPlus, Plus, Share2 } from 'lucide-react'

import { cn } from '@/shared/lib'
import { useNavActionStore } from '@/shared/lib/use-nav-action'
import { buildRoute } from '@/shared/constants'

import './bottom-nav.scss'

const ACTION_ICONS: Record<string, { icon: ReactNode; title: string }> = {
  '/': { icon: <FilePlus size={24} />, title: 'Новый чек' },
  'people': { icon: <UserPlus size={24} />, title: 'Добавить людей' },
  'items': { icon: <Plus size={24} />, title: 'Добавить расход' },
  'stats': { icon: <Share2 size={24} />, title: 'Поделиться' },
}

const getActionKey = (path: string): string => {
  if (path === '/') return '/'
  if (path.endsWith('/people')) return 'people'
  if (path.endsWith('/items')) return 'items'
  if (path.endsWith('/stats')) return 'stats'
  return ''
}

export const BottomNav = () => {
  const location = useLocation()
  const { checkId } = useParams<{ checkId: string }>()
  const onAction = useNavActionStore((s) => s.onAction)

  const navItems = useMemo(() => {
    if (!checkId) {
      return [{ to: '/', icon: <Receipt size={24} />, label: 'Чеки' }]
    }
    return [
      { to: '/', icon: <Receipt size={24} />, label: 'Чеки' },
      { to: buildRoute.people(checkId), icon: <Users size={24} />, label: 'Люди' },
      { to: buildRoute.items(checkId), icon: <Calculator size={24} />, label: 'Расходы' },
      { to: buildRoute.stats(checkId), icon: <BarChart3 size={24} />, label: 'Статистика' },
    ]
  }, [checkId])

  const actionKey = getActionKey(location.pathname)
  const actionConfig = actionKey ? ACTION_ICONS[actionKey] : null
  const midIndex = checkId ? 2 : 1

  return (
    <nav className="bottom-nav" aria-label="Основная навигация">
      {navItems.slice(0, midIndex).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          className={({ isActive }) => cn('bottom-nav__link', isActive && 'bottom-nav__link--active')}
          aria-label={item.label}
        >
          {item.icon}
        </NavLink>
      ))}

      {actionConfig && onAction ? (
        <button
          className="bottom-nav__action"
          onClick={onAction}
          title={actionConfig.title}
          aria-label={actionConfig.title}
        >
          {actionConfig.icon}
        </button>
      ) : (
        <div className="bottom-nav__action-placeholder" />
      )}

      {navItems.slice(midIndex).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => cn('bottom-nav__link', isActive && 'bottom-nav__link--active')}
          aria-label={item.label}
        >
          {item.icon}
        </NavLink>
      ))}
    </nav>
  )
}
