import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Text } from 'react-native'

export class ThemeIcons extends Component {
  static propTypes = {
    theme: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props)

    this.styleNode = document.getElementById(`${props.theme}-css`)
    this.currentTheme = props.theme
  }

  componentWillMount() {
    this.injectStyleSheet()
  }

  componentWillUnmount() {
    this.removeStyleSheet()
  }

  componentDidUpdate() {
    this.injectStyleSheet()
  }

  render() {
    return null
  }

  injectStyleSheet() {
    let { theme } = this.props

    if (theme !== this.currentTheme) {
      this.removeStyleSheet()
    }

    if (!theme || this.getStyleNode()) {
      return
    }

    let style = document.createElement('link')
    style.rel = 'stylesheet'
    style.href = `/themes/${theme}/icons/style.css`
    style.id = `${theme}-css`

    document.head.appendChild(style)

    this.styleNode = style
    this.currentTheme = theme
  }

  removeStyleSheet() {
    let { theme } = this.props
    let style = this.getStyleNode()

    if (style && style.parentNode) {
      style.parentNode.removeChild(style)
    }

    this.styleNode = null
  }

  getStyleNode() {
    let { theme } = this.props
    let style = this.styleNode

    if (theme && !style) {
      style = document.getElementById(`${theme}-css`)
      this.styleNode = style
    }

    return style
  }
}

const IconComponent = ({ name, glyphs, theme, style }) => {
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

function mapStateToIconProps({
  theme: { _id, glyphs = {} }
}) {
  return {
    theme: _id,
    glyphs
  }
}

export const Icon = connect(
  mapStateToIconProps
)(IconComponent)
