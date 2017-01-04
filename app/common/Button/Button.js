import React from 'react'
import s from './Button.scss'

const Button = ({ className, secondary, onPress, ...props }) => (
  <button
      className={[
        s.root,
        (secondary && s.secondary),
        (props.disabled && s.disabled),
        className
      ].filter(Boolean).join(' ')}
      onClick={(e) => {
          if (!props.disabled) {
            return onPress && onPress(e)
          }
        }}
      {...props}
  />
)

export default Button
