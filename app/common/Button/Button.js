import React from 'react'
import { joinStringArray } from '../../utils'
import s from './Button.scss'

const Button = ({ className, secondary, onPress, ...props }) => (
  <button
      className={joinStringArray([
          s.root,
          (secondary && s.secondary),
          (props.disabled && s.disabled),
          className
        ])}
      onClick={(e) => {
          if (!props.disabled) {
            return onPress && onPress(e)
          }
        }}
      {...props}
  />
)

export default Button
