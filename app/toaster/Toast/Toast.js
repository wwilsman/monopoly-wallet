import React from 'react'
import s from './Toast.scss'

import { View, Text, Button } from '../../common'

const Toast = ({
  message,
  primaryButton,
  onPrimaryButtonPress,
  secondaryButton,
  onSecondaryButtonPress,
  onDismiss,
  isError
}) => (
  <View className={[s.root, (isError && s.error)]}>
    <Text className={s.message}>{message}</Text>

    {secondaryButton && (
       <Button className={s.button} secondary
               onPress={(e) => onSecondaryButtonPress(onDismiss, e)}>
         {secondaryButton}
       </Button>
     )}

    {primaryButton && (
       <Button className={s.button}
               onPress={(e) => onPrimaryButtonPress(onDismiss, e)}>
         {primaryButton}
       </Button>
     )}
  </View>
)

export default Toast
