import { Share2 } from 'lucide-react'
import IconButton from '../../components/Button/IconButton'
import './header.scss'

function Header({ onShare }) {
  return (
    <header className="header">
      <div className="header__container container">
        <h1 className="header__logo">
          Split Check
        </h1>
        {onShare && (
          <IconButton
            onClick={onShare}
            icon={<Share2 size={24} />}
            ariaLabel="Поделиться"
            className="header__share-button"
          />
        )}
      </div>
    </header>
  )
}

export default Header 