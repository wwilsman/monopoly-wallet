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

  _handleSearch = (query) => {
    const filtered = this.props.properties.filter((p) => {
      const reg = new RegExp(`${query}`, 'i')
      return p.name.match(reg) || p.group.match(reg)
    })

    this.setState({
      query,
      filteredProperties: filtered,
      currentProperty: filtered[0]
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
