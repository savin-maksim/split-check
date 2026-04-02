import './card.scss'

export default function Card({ as: Tag = 'article', className, children, ...rest }) {
  return (
    <Tag className={['card', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </Tag>
  )
}
