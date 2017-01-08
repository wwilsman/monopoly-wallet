import React, { Component } from 'react'
import fetch from 'isomorphic-fetch'

const svgCache = {}

const loadSVG = (url, callback) => {
  if (svgCache[url]) {
    callback(svgCache[url])
  } else {
    fetch(url)
      .then((res) => res.text())
      .then((svg) => {
        let node = document.createElement('div')
        node.innerHTML = svg
        node = node.firstChild
        svgCache[url] = node
        callback(node)
      })
  }
}

class ThemeIcons extends Component {
  constructor(props) {
    super(props)

    this.svgNode = document.getElementById(`${props.theme}-icons`)
    this.currentTheme = props.theme
  }

  componentWillMount() {
    this.injectSVG()
  }

  componentWillUnmount() {
    this.removeSVG()
  }

  componentDidUpdate() {
    this.injectSVG()
  }

  injectSVG() {
    const { theme } = this.props

    if (theme !== this.currentTheme) {
      this.removeSVG()
    }

    if (!theme || this.getSVGNode()) {
      return
    }

    loadSVG(`/themes/${theme}/icons.svg`, (svg) => {
      svg.id = `${theme}-icons`
      document.head.appendChild(svg)
      this.svgNode = svg
    })

    this.currentTheme = theme
  }

  removeSVG() {
    const { theme } = this.props
    const svg = this.getSVGNode()

    if (svg && svg.parentNode) {
      svg.parentNode.removeChild(svg)
    }

    this.svgNode = null
  }

  getSVGNode() {
    const { theme } = this.props
    let svg = this.svgNode

    if (theme && !svg) {
      svg = document.getElementById(`${theme}-icons`)
      this.svgNode = svg
    }

    return svg
  }

  render() {
    return null
  }
}

export default ThemeIcons
