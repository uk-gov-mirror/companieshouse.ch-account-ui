import PropTypes from 'prop-types'
import React from 'react'
import ListItem from './ListItem'

const List = (props) => {
  const { type = 'bullet', children, className = '', items = [], renderFeatures } = props
  const classes = [className]
  if (type === 'bullet') classes.push('govuk-list--bullet')
  if (type === 'number') classes.push('govuk-list--number')

  const finalClassName = classes.join(' ').trim()

  return (
    <ul className={`govuk-list ${finalClassName}`}>
      {children}
      {renderFeatures(props)}
      {items.map((itemText, index) => <ListItem key={index}>{itemText}</ListItem>)}
    </ul>
  )
}

export default List

List.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  type: PropTypes.string,
  renderFeatures: PropTypes.func,
  items: PropTypes.array
}

List.defaultProps = {
  className: '',
  type: 'bullet',
  renderFeatures: () => { return null },
  items: []
}
