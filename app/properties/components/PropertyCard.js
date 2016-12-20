import React, { Component } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { connect } from 'react-redux'

class PropertyCard extends Component {
  state = {
    cardStyle: {},
    cardWrapperStyle: {},
    headerStyle: {}
  }

  render() {
    let {
      style,
      property,
      background,
      header,
      simple
    } = this.props

    let cardStyle = [
      styles.card,
      this.state.cardStyle
    ]

    let cardWrapperStyle = [
      styles.outline,
      this.state.cardWrapperStyle
    ]

    let headerStyle = [
      styles.header,
      this.state.headerStyle
    ]

    return (
      <View
          style={style}
          onLayout={this._onLayout}>
        <View style={cardStyle}>
          {simple ? (
            <View style={headerStyle}/>
          ) : (
            <View style={cardWrapperStyle}>
              <View style={[headerStyle, styles.headerWithText]}>
                <Text style={styles.headerText}>
                  {property.name}
                </Text>
              </View>
              <View style={styles.content}>
                {property.rent.map((r, i) => i === 0 ? (
                  <Text style={styles.rentLine} key={i}>
                    Rent ${r}
                  </Text>
                ) : i === 5 ? (
                  <Text style={styles.hotelLine} key={i}>
                    With Hotel ${r}
                  </Text>
                ) : (
                  <View style={styles.houseLine} key={i}>
                    <Text style={styles.houseLineText}>
                      With {i} House{i > 1 && 's'}
                    </Text>
                    <Text style={styles.houseLineText}>
                      ${r}
                    </Text>
                  </View>
                ))}

                <View>
                  <Text style={styles.bottomLine}>
                    Mortgage Value ${property.price * 0.5}
                  </Text>
                </View>

                <View>
                  <Text style={styles.bottomLine}>
                    Houses cost ${property.cost} each
                  </Text>
                </View>

                <View>
                  <Text style={styles.bottomLine}>
                    Hotels cost ${property.cost} plus 4 houses
                  </Text>
                </View>

                <View style={styles.finalLine}>
                  <Text style={styles.finalLineText}>
                    If a player owns ALL of the properties of any color group
                    the rent is doubled on unimproved properties in that group
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    )
  }

  _onLayout = (e) => {
    this._calculateStyles(e)

    if (this.props.onLayout) {
      this.props.onLayout(e)
    }
  }

  _calculateStyles = ({ nativeEvent: { layout: { width } } }) => {
    if (width !== this.state.width) {
      this.setState({
        width,
        cardStyle: {
          height: width * 1.5,
          padding: width * 0.075
        },
        cardWrapperStyle: {
          height: width * 1.425,
          width: width * 0.925,
          margin: width * -0.0325,
          padding: width * 0.0325
        },
        headerStyle: {
          height: width * 0.3,
          backgroundColor: this.props.color
        }
      })
    }
  }
}

function mapStateToProps(state, props) {
  return {
    color: state.theme.colors[props.property.group]
  }
}

const PropertyCardContainer = connect(
  mapStateToProps
)(PropertyCard)

export default PropertyCardContainer

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.2)'
  },
  outline: {
    flex: 1,
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: 'black'
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.2)'
  },
  headerWithText: {
    padding: 20,
    borderWidth: 2,
    borderColor: 'black'
  },
  headerText: {
    fontSize: 24,
    fontFamily: 'futura',
    textTransform: 'uppercase',
    textAlign: 'center'
  },
  content: {
    flex: 1,
    padding: 10
  },
  rentLine: {
    fontSize: 18,
    fontFamily: 'futura',
    textAlign: 'center',
    marginBottom: 5
  },
  houseLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5
  },
  houseLineText: {
    fontSize: 16,
    fontFamily: 'futura',
  },
  hotelLine: {
    fontSize: 18,
    fontFamily: 'futura',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20
  },
  bottomLine: {
    fontSize: 16,
    fontFamily: 'futura',
    textAlign: 'center'
  },
  finalLine: {
    marginTop: 'auto'
  },
  finalLineText: {
    fontSize: 9,
    fontFamily: 'futura',
    textAlign: 'center'
  }
})
