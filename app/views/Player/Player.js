import React, { Component, PropTypes } from 'react'
import styles from './Player.css'

import { Flex, Header, Section, Text } from '../../layout'
import { Icon, Button, Currency } from '../../common'
import { PropertyGrid, PropertyList } from '../../properties'
import { BankModal } from '../../game'

class Player extends Component {
  static propTypes = {
    player: PropTypes.object.isRequired,
    payBank: PropTypes.func.isRequired,
    collectMoney: PropTypes.func.isRequired
  }

  static contextTypes = {
    router: PropTypes.shape({
      push: PropTypes.func.isRequired,
      match: PropTypes.shape({
        url: PropTypes.string.isRequired
      }).isRequired
    }).isRequired
  }

  state = {
    showBankModal: false,
    bankModalType: 'collect',
    showProperty: false
  }


  _handleShowCollectModal = () => {
    this.setState({
      showBankModal: true,
      bankModalType: 'collect'
    })
  }

  _handleShowPayModal = () => {
    this.setState({
      showBankModal: true,
      bankModalType: 'pay'
    })
  }

  _handleHideBankModal = () => {
    this.setState({
      showBankModal: false
    })
  }

  _handlePayBank = (amount) => {
    this.props.payBank(amount)

    this.setState({
      showBankModal: false
    })
  }

  _handleCollectMoney = (amount) => {
    this.props.collectMoney(amount)

    this.setState({
      showBankModal: false
    })
  }

  _handleShowProperty = (property) => {
    if (Array.isArray(property)) {
      property = property[0]
    }

    this.setState({
      showProperty: property
    })
  }

  _handleSearch = () => {
    const {
      push,
      match: { url }
    } = this.context.router

    push(`${url}/search`)
  }

  _handleHideProperty = () => {
    this.setState({
      showProperty: false
    })
  }

  render() {
    const {
      player,
      properties
    } = this.props

    const {
      showBankModal,
      bankModalType,
      showProperty
    } = this.state

    return (
      <Flex container>
        <Header>
          {showProperty ? (
             <Button icon onClick={this._handleHideProperty}>
               <Icon name="x"/>
             </Button>
           ) : (
             <Button icon>
               <Icon name="menu"/>
             </Button>
           )}

          <Button icon onClick={this._handleSearch}>
            <Icon name="search"/>
          </Button>
        </Header>

        {!showProperty && (
           <Section size="1/4" justify="center">
             <Currency
                 amount={player.balance}
                 className={styles.balance}
             />

             <Flex row justify="center">
               <Button
                   onClick={this._handleShowCollectModal}
                   color="green"
                   width="1/3"
                   small>
                 Collect
               </Button>

               <Button
                   onClick={this._handleShowPayModal}
                   color="red"
                   width="1/3"
                   small>
                 Pay
               </Button>
             </Flex>
           </Section>
         )}

        {showProperty ? (
           <PropertyList
               properties={properties}
               activeProperty={showProperty}
               onChange={this._handleShowProperty}
           />
         ) : (
           <Section stretch>
             <PropertyGrid
                 properties={properties}
                 onClickGroup={this._handleShowProperty}
             />
           </Section>
         )}

        {showBankModal && (
           <BankModal
               type={bankModalType}
               onClose={this._handleHideBankModal}
               onCollect={this._handleCollectMoney}
               onPayBank={this._handlePayBank}
           />
         )}
      </Flex>
    )
  }
}

export default Player
