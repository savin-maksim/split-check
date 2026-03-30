import React from 'react'
import './section.scss'

function Section({ children }) {
  return <section className="section section--hidden-x container">{children}</section>
}

export default Section
