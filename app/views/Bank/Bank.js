import React, { Component } from 'react'
import s from './Bank.scss'

import { View, Container, Content, Button, TextField } from '../../common'
import { TransactionField } from '../../game'
import { PropertyGrid, PropertyList, PropertySearch } from '../../properties'

class Bank extends Component {
  state = {
    search: '',
    isListView: false,
    isSeaching: false,
    activeProperty: null,
    collect: true
  }

  toggleCollect = (collect = !!this.state.collect) => {
    this.transactionField.focus()
    this.setState({ collect })
  }

  viewPropertyGroup = (properties) => {
    this.setState({
      isListView: true,
      activeProperty: properties[0]
    })
  }

  viewProperty = (activeProperty) => {
    this.setState({
      isListView: true,
      activeProperty
    })
  }

  activateProperty = (activeProperty) => {
    this.setState({ activeProperty })
  }

  searchProperty = (search) => {
    this.setState({ search, isSearching: !!search })
  }

  render() {
    const { properties } = this.props

    const {
      activeProperty,
      isListView,
      isSearching,
      search,
      collect
    } = this.state

    return (
      <Container>
        {isListView ? (
           <PropertyList
               properties={properties}
               active={activeProperty}
               onChange={this.activateProperty}
           />
         ) : (
           <Content>
             <View className={s.transaction}>
               <View className={s.toggles}>
                 <Button className={[s.button, (collect && s.active)]}
                         onPress={() => this.toggleCollect(true)}>
                   Collect
                 </Button>

                 <Button className={[s.button, (!collect && s.active)]}
                         onPress={() => this.toggleCollect(false)}>
                   Pay
                 </Button>
               </View>

               <TransactionField
                   ref={(field) => this.transactionField = field}
                   collect={collect}
                   payee="bank"
               />
             </View>

             <TextField
                 label="Search Properties"
                 onChangeText={this.searchProperty}
                 value={search}
             />

             {isSearching ? (
                <PropertySearch
                    properties={properties}
                    onPress={this.viewProperty}
                    query={search}
                />
              ) : (
                <PropertyGrid
                    properties={properties}
                    onGroupPress={this.viewPropertyGroup}
                    small
                />
              )}
           </Content>
         )}
      </Container>
    )
  }
}

export default Bank
