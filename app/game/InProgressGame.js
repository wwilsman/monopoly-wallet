import React, { Component, PropTypes } from 'react'
import { View, Text } from 'react-native'
import {
  Container,
  Header,
  Title,
  Content,
  Centered,
  Footer
} from '../layout'

export class InProgressGame extends Component {
  static childContextTypes = {
    socket: PropTypes.object
  }

  render() {
    return (
      <Container>
        <Header>{this.props.currentPlayer.name}</Header>

        <Footer>
          <Text>Footer</Text>
        </Footer>
      </Container>
    )
  }
}
