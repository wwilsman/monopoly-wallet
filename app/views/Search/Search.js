import React, { Component, PropTypes } from 'react'

import { Flex, Box, Header } from '../../layout'
import { Button, Icon, TextInput } from '../../common'
import { PropertyList } from '../../properties'

class Search extends Component {
  static propTypes = {
    properties: PropTypes.array.isRequired
  }

  static contextTypes = {
    router: PropTypes.shape({
      goBack: PropTypes.func.isRequired
    }).isRequired
  }

  state = {
    query: '',
    filteredProperties: this.props.properties,
    currentProperty: this.props.properties[0]
  }

  componentDidMount() {
    this.input.focus()
  }

  componentWillReceiveProps(props) {
    const filteredProperties = this.filterProperties(this.state.query, props.properties)
    const currentPropertyIndex = this.props.properties.indexOf(this.state.currentProperty)
    const currentProperty = props.properties[currentPropertyIndex]
    
    this.setState({
      filteredProperties,
      currentProperty
    })
  }

  _handleSearch = (query) => {
    const filteredProperties = this.filterProperties(query)
    const currentProperty = filteredProperties[0]
    
    this.setState({
      query,
      filteredProperties,
      currentProperty
    })
  }

  _clearSearch = () => {
    const { properties } = this.props

    this.setState({
      query: '',
      filteredProperties: properties,
      currentProperty: properties[0]
    })

    this.input.focus()
  }

  _changeProperty = (property) => {
    this.setState({
      currentProperty: property
    })
  }

  _goBack = () => {
    this.context.router.goBack()
  }

  filterProperties(query, properties = this.props.properties) {    
    return properties.filter((p) => {
      const reg = new RegExp(`${query}`, 'i')
      return p.name.match(reg) || p.group.match(reg)
    })
  }

  render() {
    const {
      query,
      filteredProperties,
      currentProperty
    } = this.state

    return (
      <Flex>
        <Header>
          <Button icon onClick={this._goBack}>
            <Icon name="larr"/>
          </Button>

          <TextInput
              ref={(ref) => this.input = ref}
              onChangeText={this._handleSearch}
              placeholder="Search Properties"
              value={query}
          />

          {query && (
             <Button icon onClick={this._clearSearch}>
               <Icon name="x"/>
             </Button>
           )}
        </Header>

        <PropertyList
            properties={filteredProperties}
            activeProperty={currentProperty}
            onChange={this._changeProperty}
        />
      </Flex>
    )
  }
}

export default Search
