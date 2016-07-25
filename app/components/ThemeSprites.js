import React from 'react'
import jQuery from 'jquery'

export default class ThemeSprites extends React.Component {

  constructor() {
    super(...arguments)

    this.state = {
      loading: true,
      src: `/themes/${this.props.theme}/${this.props.name}.svg`
    }
  }

  componentWillMount() {
    SVGCache.instance.subscribe(this, this.state.src, (component) => {
      component.setState({ loading: false })
    })
  }

  render() {
    if (this.state.loading) {
      return <span/>
    }

    let __html = SVGCache.instance.getItem(this.state.src).content
    return <span style={{ display: 'none' }} dangerouslySetInnerHTML={{ __html }}/>
  }
}

export class Sprite extends React.Component {

  render() {
    let href = `#${this.props.name}`
    return <svg><use xlinkHref={ href }/></svg>
  }
}

class SVGCache {

  static get instance() {
    if (!this.singleton) {
      this.singleton = new SVGCache()
    }

    return this.singleton
  }

  constructor() {
    this.cache = {}
  }

  getItem(src) {
    if (!this.cache[src]) {
      this.cache[src] = {
        subscribers: []
      }
    }

    return this.cache[src]
  }

  subscribe(subscriber, src, callback) {
    let item = this.getItem(src)

    switch(item.state) {
      case "loaded":
        callback(subscriber)
        break
      case "loading":
        item.subscribers.push(subscriber)
        break
      default:
        item.subscribers.push(subscriber)
        this.load(src, callback)
    }
  }

  load(src, callback) {
    let item = this.getItem(src)

    if (item.state == "loaded" || item.state == "loading") {
      return false
    }

    let request = jQuery.ajax({
      method: "GET",
      dataType: "text",
      url: src
    })

    item.state = "loading"

    request.done(function (data) {
      item.state = "loaded"
      item.content = data

      if (callback) {
        item.subscribers.forEach(callback)
      }
    })

    return true
  }
}
