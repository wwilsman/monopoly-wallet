import CSSPropertyOperations from 'react-dom/lib/CSSPropertyOperations'
import Animated from 'animated'

function mapTransform(t) {
  var k = Object.keys(t)[0];
  return `${k}(${t[k]})`;
}

function mapStyle(style) {
  if (style && style.transform && typeof style.transform !== 'string') {
    style.transform = style.transform.map(mapTransform).join(' ')
  }

  return style
}

Animated.inject.ApplyAnimatedValues((instance, props, comp) => {
  if (instance.setNativeProps) {
    instance.setNativeProps(props)

  } else if (instance.nodeType && instance.setAttribute !== undefined) {
    CSSPropertyOperations.setValueForStyles(
      instance,
      mapStyle(props.style),
      comp._reactInternalInstance
    )

  } else {
    return false
  }
})

export default {
  ...Animated,
  View: Animated.createAnimatedComponent('div'),
  Text: Animated.createAnimatedComponent('span')
}
