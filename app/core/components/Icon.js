import React from 'react'
import { connect } from 'react-redux'

import Text from './Text'

const Icon = ({
  name,
  glyphs,
  theme,
  style
}) => {
  let glyph = glyphs[name] || '?'

  if (typeof glyph === 'number') {
    glyph = String.fromCharCode(glyph)
  }

  const fontStyle = {
    fontFamily: `${theme}-icons`,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 1
  }

  return (
    <Text style={{ ...style, ...fontStyle }}>
      {glyph}
    </Text>
  )
}

function mapStateToIconProps(state) {
  return {
    theme: state.theme._id,
    glyphs: state.theme.glyphs
  }
}

const IconContainer = connect(
  mapStateToIconProps
)(Icon)

export default IconContainer
