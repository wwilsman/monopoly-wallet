import React from 'react'
import s from './StatusScreen.scss'

import View from '../View'
import Text from '../Text'
import Container from '../Container'

const StatusScreen = ({ error, status, message }) => (
  <Container>
    <View className={[s.centered, (error && s.error)]}>
      <Text className={s.status}>{status}</Text>
      <Text className={s.message}>{message}</Text>
    </View>
  </Container>
)

export default StatusScreen
