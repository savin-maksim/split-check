import ButtonWeight from '../ButtonWeight/ButtonWeight'
import './person-grid.scss'

export default function PersonGridWeights({ people, weights, onAdjustWeight, className = '', ...rest }) {
  return (
    <div className={['person-grid person-grid--weights', className].filter(Boolean).join(' ')} {...rest}>
      {people.map((person) => {
        const u = Math.max(0, Math.floor(Number(weights[person.id]) || 0))
        return (
          <ButtonWeight
            key={person.id}
            value={u}
            label={person.name}
            disabled={u <= 0}
            onDecrease={() => onAdjustWeight(person.id, -1)}
            onIncrease={() => onAdjustWeight(person.id, 1)}
          />
        )
      })}
    </div>
  )
}
