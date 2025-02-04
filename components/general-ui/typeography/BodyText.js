import PropTypes from 'prop-types'
import React from 'react'

const BodyText = (props) => {
  const { children, hint = false, className = '', weight = 'regular', renderFeatures } = props
  const classes = [className]

  if (hint === true) classes.push('govuk-hint')
  if (weight === 'bold') classes.push('govuk-!-font-weight-bold')

  const finalClassName = classes.join(' ').trim()

  return (
    <p className={`govuk-body ${finalClassName}`}>
      {children}
      {renderFeatures(props)}
    </p>
  )
}

export default BodyText

BodyText.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  hint: PropTypes.bool,
  weight: PropTypes.string,
  renderFeatures: PropTypes.func
}

BodyText.defaultProps = {
  className: '',
  hint: false,
  weight: 'regular',
  renderFeatures: () => { return null }
}
