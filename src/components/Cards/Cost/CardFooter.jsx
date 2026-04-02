import './card-footer.scss'

const variantClass = {
  grid: 'footer__inner--grid',
}

export default function CardFooter({ children, variant, ...rest }) {
  return (
    <div className="footer">
      <div className={['footer__inner', variantClass[variant]].filter(Boolean).join(' ')} {...rest}>
        {children}
      </div>
    </div>
  )
}
