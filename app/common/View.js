import '../utils/injectResponderEventPlugin'
import React, { Component } from 'react'

import { normalizeNativeEvent, joinStringArray } from '../utils'

const eventHandlerNames = [
  'onClick',
  'onClickCapture',
  'onMoveShouldSetResponder',
  'onMoveShouldSetResponderCapture',
  'onResponderGrant',
  'onResponderMove',
  'onResponderReject',
  'onResponderRelease',
  'onResponderTerminate',
  'onResponderTerminationRequest',
  'onStartShouldSetResponder',
  'onStartShouldSetResponderCapture',
  'onTouchCancel',
  'onTouchCancelCapture',
  'onTouchEnd',
  'onTouchEndCapture',
  'onTouchMove',
  'onTouchMoveCapture',
  'onTouchStart',
  'onTouchStartCapture'
]

class View extends Component {
  _normalizeEventForHandler(handler, name) {
    const shouldCancelEvent = (name === 'onResponderRelease')

    return (e) => {
      e.nativeEvent = normalizeNativeEvent(e.nativeEvent)
      const returnValue = handler(e)

      if (shouldCancelEvent && e.cancelable) {
        e.preventDefault()
      }

      return returnValue
    }
  }

  render() {
    const { className, ...props } = this.props

    eventHandlerNames.forEach((name) => {
      const handler = this.props[name]

      if (typeof handler === 'function') {
        props[name] = this._normalizeEventForHandler(handler, name)
      }
    })

    return (<div className={joinStringArray(className)} {...props}/>)
  }
}

export default View
