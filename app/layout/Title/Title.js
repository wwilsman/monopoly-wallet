import React from 'react'
import styles from './Title.css'

import Text from '../Text'

const Title = ({ lg, sm, className, ...props }) => (
  <Text upcase center med={sm} xl={!lg && !sm} xxl={lg}
        className={[styles.root, className].join(' ')}
        {...props}/>
)

export default Title
