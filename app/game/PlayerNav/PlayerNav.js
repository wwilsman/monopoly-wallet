import React, { Component, PropTypes } from 'react'
import { formatCurrency } from '../../utils'
import s from './PlayerNav.scss'

import { View, Text, Icon } from '../../common'

class PlayerNav extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    player: PropTypes.object.isRequired
  }

  static contextTypes = {
    router: PropTypes.object
  }

  goToPath(pathname) {
    const { location } = this.props
    const { router } = this.context

    if (pathname !== location.pathname) {
      router.transitionTo({ pathname })
    }
  }

  render() {
    const { player, root } = this.props
    const bankPath = `${root}/bank`

    return (
      <View className={s.root}>
        <Text className={s.balance}>
          <Icon name="currency"/>
          {formatCurrency(player.balance)}
        </Text>

        <View className={s.bank}
              onClick={() => this.goToPath(bankPath)}>
          <Icon name="bank"/>
        </View>
      </View>
    )
  }
}

export default PlayerNav
