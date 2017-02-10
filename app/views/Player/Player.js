import React, { Component, PropTypes } from 'react'
import styles from './Player.css'

import { Flex, Box, Header, Text } from '../../layout'
import { Icon, Button, Currency } from '../../common'
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

  _showCollectModal = () => {
    this.setState({
      showBankModal: true,
      bankModalType: 'collect'
    })
  }

  _showPayModal = () => {
    this.setState({
      showBankModal: true,
      bankModalType: 'pay'
    })
  }

  _hideBankModal = () => {
    this.setState({
      showBankModal: false
    })
  }

  _payBank = (amount) => {
    this.props.payBank(amount)
    this._hideBankModal()
  }

  _collectFromBank = (amount) => {
    this.props.collectMoney(amount)
    this._hideBankModal()
  }

  _showProperty = (property) => {
    if (Array.isArray(property)) {
      property = property[0]
    }

    this.setState({
      showProperty: property
    })
  }

  _goToSearch = () => {
    const {
      router: { push, match }
    } = this.context

    push(`${match.url}/search`)
  }

  _hideProperty = () => {
    this.setState({
      showProperty: false
    })
  }

  render() {
    const { player, properties } = this.props
    const { showBankModal, bankModalType, showProperty } = this.state

    return (
      <Flex>
        <Header>
          {showProperty ? (
             <Button icon onClick={this._hideProperty}>
               <Icon name="x"/>
             </Button>
           ) : (
             <Button icon>
               <Icon name="menu"/>
             </Button>
           )}

          <Button icon onClick={this._goToSearch}>
            <Icon name="search"/>
          </Button>
        </Header>

        {!showProperty && (
           <Box size="1/4" justify="center">
             <Currency className={styles.balance}
                       amount={player.balance}/>

             <div className={styles.buttons}>
               <Button small color="green" width="1/3"
                       onClick={this._showCollectModal}>
                 Collect
               </Button>

               <Button small color="red" width="1/3"
                       onClick={this._showPayModal}>
                 Pay
               </Button>
             </div>
           </Box>
         )}

        {showProperty ? (
         ) : (
           <Box stretch>
             <PropertyGrid
                 properties={properties}
                 onClickGroup={this._showProperty}
             />
           </Box>
         )}

        {showBankModal && (
           <BankModal
               type={bankModalType}
               onClose={this._hideBankModal}
               onCollect={this._collectFromBank}
               onPayBank={this._payBank}
           />
         )}
      </Flex>
    )
  }
}

export default Player
