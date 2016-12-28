import '../apis/modules/injectResponderEventPlugin'
import normalizeNativeEvent from '../apis/modules/normalizeNativeEvent'

import React, { Component } from 'react'

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
    let { ...props } = this.props

    eventHandlerNames.reduce((props, name) => {
      const handler = this.props[name]

      if (typeof handler === 'function') {
        props[name] = this._normalizeEventForHandler(handler, name)
      }

      return props
    }, props)

    return (<div {...this.props}/>)
  }
}

export default View
