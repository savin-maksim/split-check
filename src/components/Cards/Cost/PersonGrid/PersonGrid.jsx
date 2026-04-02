import Button from '@/components/Button/Button'
import './person-grid.scss'

const variantClass = {
  weights: 'person-grid--weights',
}

export default function PersonGrid({
  people,
  selected = [],
  onToggle,
  children,
  variant,
  ...rest
}) {
  if (children) {
    return (
      <div className={['person-grid', variantClass[variant]].filter(Boolean).join(' ')} {...rest}>
        {children}
      </div>
    )
  }

  return (
    <div className={['person-grid', variantClass[variant]].filter(Boolean).join(' ')} {...rest}>
      {people.map((person) => (
        <Button
          key={person.id}
          className={selected.some((p) => p.id === person.id) ? 'button--active' : ''}
          onClick={() => onToggle?.(person)}
        >
          {person.name}
        </Button>
      ))}
    </div>
  )
}
