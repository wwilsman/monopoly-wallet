import React from 'react'
import { Text } from 'react-native'
import { connect } from 'react-redux'

const Icon = ({ name, glyphs, theme, style }) => {
  let glyph = glyphs[name] || '?'

  if (typeof glyph === 'number') {
    glyph = String.fromCharCode(glyph)
  }

  let fontStyle = {
    fontFamily: `${theme}-icons`,
    fontWeight: 'normal',
    fontStyle: 'normal'
  }

  return (
    <Text style={[style, fontStyle]}>
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
