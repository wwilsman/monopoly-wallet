import React, { Component } from 'react'
import { connect } from 'react-redux'

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

  render() {
    return null
  }
}

function mapStateToProps(state) {
  return {
    theme: state.theme._id
  }
}

const ThemeIconsContainer = connect(
  mapStateToProps
)(ThemeIcons)

export default ThemeIconsContainer
