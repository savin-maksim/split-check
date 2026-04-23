import { useMemo } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useLocation, useParams } from 'react-router-dom'
import { Receipt, Users, Calculator, BarChart3, FilePlus, UserPlus, Plus, Share2 } from 'lucide-react'

import { useCheckStore } from '@/entities/check'
import { cn } from '@/shared/lib'
import { useNavActionStore } from '@/shared/lib/use-nav-action'
import { buildRoute } from '@/shared/constants'

import './bottom-nav.scss'

const ACTION_ICONS: Record<string, { icon: ReactNode; title: string }> = {
  '/': { icon: <FilePlus size={'var(--bottom-nav-icon-size)'} />, title: 'Новый чек' },
  'people': { icon: <UserPlus size={'var(--bottom-nav-icon-size)'} />, title: 'Добавить людей' },
  'items': { icon: <Plus size={'var(--bottom-nav-icon-size)'} />, title: 'Добавить расход' },
  'stats': { icon: <Share2 size={'var(--bottom-nav-icon-size)'} />, title: 'Поделиться' },
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
  const { checkId: paramCheckId } = useParams<{ checkId: string }>()
  // Стабильная строка id — не меняется при правках чека (кроме набора id), в отличие от s.checks
  const checkIdsKey = useCheckStore((s) => s.checks.map((c) => c.id).join('\u0000'))
  const currentCheckId = useCheckStore((s) => s.currentCheckId)
  const onAction = useNavActionStore((s) => s.onAction)

  const isHome = location.pathname === '/'

  const contextCheckId = useMemo(() => {
    if (paramCheckId) return paramCheckId
    if (!isHome) return null
    if (currentCheckId) {
      const idSet = new Set(
        checkIdsKey
          ? checkIdsKey.split('\u0000')
          : [],
      )
      if (idSet.has(currentCheckId)) return currentCheckId
    }
    return null
  }, [paramCheckId, isHome, currentCheckId, checkIdsKey])

  const navItems = useMemo(() => {
    if (!contextCheckId) {
      return [{ to: '/', icon: <Receipt size={'var(--bottom-nav-icon-size)'} />, label: 'Чеки' }]
    }
    return [
      { to: '/', icon: <Receipt size={'var(--bottom-nav-icon-size)'} />, label: 'Чеки' },
      { to: buildRoute.people(contextCheckId), icon: <Users size={'var(--bottom-nav-icon-size)'} />, label: 'Люди' },
      { to: buildRoute.items(contextCheckId), icon: <Calculator size={'var(--bottom-nav-icon-size)'} />, label: 'Расходы' },
      { to: buildRoute.stats(contextCheckId), icon: <BarChart3 size={'var(--bottom-nav-icon-size)'} />, label: 'Статистика' },
    ]
  }, [contextCheckId])

  const actionKey = getActionKey(location.pathname)
  const actionConfig = actionKey ? ACTION_ICONS[actionKey] : null
  const midIndex = contextCheckId ? 2 : 1

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
