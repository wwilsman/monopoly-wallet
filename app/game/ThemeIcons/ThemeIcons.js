import React, { Component } from 'react'

class ThemeIcons extends Component {
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

  injectStyleSheet() {
    const { theme } = this.props

    if (theme !== this.currentTheme) {
      this.removeStyleSheet()
    }

    if (!theme || this.getStyleNode()) {
      return
    }

    const style = document.createElement('link')
    style.rel = 'stylesheet'
    style.href = `/themes/${theme}/icons/style.css`
    style.id = `${theme}-css`

    document.head.appendChild(style)

    this.styleNode = style
    this.currentTheme = theme
  }

  removeStyleSheet() {
    const { theme } = this.props
    const style = this.getStyleNode()

    if (style && style.parentNode) {
      style.parentNode.removeChild(style)
    }

    this.styleNode = null
  }

  getStyleNode() {
    const { theme } = this.props
    let style = this.styleNode

    if (theme && !style) {
      style = document.getElementById(`${theme}-css`)
      this.styleNode = style
    }

    return style
  }

  render() {
    return null
  }
}

export default ThemeIcons
