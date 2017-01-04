import React from 'react'
import { joinStringArray } from '../utils'

const Text = ({ className, ...props }) => (
  <span className={joinStringArray(className)} {...props}/>
)

export default Text
