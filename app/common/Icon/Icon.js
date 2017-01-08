import React from 'react'
import s from './Icon.scss'

import Text from '../Text'

const Icon = ({ name, className }) => {
  return (
    <Text className={[s.root, className]}>
      <svg xmlns="http://www.w3.org/2000/svg"
           className={s.icon}>
        <use xlinkHref={`#icon-${name}`}/>
      </svg>
    </Text>
  )
}

export default Icon
