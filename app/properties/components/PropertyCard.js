import React, { Component } from 'react'
import { connect } from 'react-redux'

import { View, Text, Icon } from '../../core/components'

class PropertyCard extends Component {
  calculateStylesFromWidth(width) {
    return {
      card: {
        width: width,
        height: width * 1.5,
        padding: width * 0.075
      },
      wrapper: {
        height: width * 1.425,
        width: width * 0.925,
        margin: width * -0.0325,
        padding: width * 0.0325
      },
      header: {
        height: width * 0.3,
      }
    }
  }

  renderContent() {
    let { property } = this.props

    return (
      <View style={styles.content}>
        {property.rent.map((r, i) => i === 0 ? (
          <Text style={styles.rentLine} key={i}>
            Rent <Icon name="currency"/>{r}
          </Text>
        ) : i === 5 ? (
          <Text style={styles.hotelLine} key={i}>
            With Hotel <Icon name="currency"/>{r}
          </Text>
        ) : (
          <View style={styles.houseLine} key={i}>
            <Text style={styles.houseLineText}>
              With {i} House{i > 1 && 's'}
            </Text>
            <Text style={styles.houseLineText}>
              <Icon name="currency"/>{r}
            </Text>
          </View>
        ))}

        <View>
          <Text style={styles.bottomLine}>
            Mortgage Value <Icon name="currency"/>{property.price * 0.5}
          </Text>
        </View>

        <View>
          <Text style={styles.bottomLine}>
            Houses cost <Icon name="currency"/>{property.cost} each
          </Text>
        </View>

        <View>
          <Text style={styles.bottomLine}>
            Hotels cost <Icon name="currency"/>{property.cost} plus 4 houses
          </Text>
        </View>

        <View style={styles.finalLine}>
          <Text style={styles.finalLineText}>
            If a player owns ALL of the properties of any color group
            the rent is doubled on unimproved properties in that group
          </Text>
        </View>
      </View>
    )
  }

  render() {
    let {
      style,
      property,
      width,
      color,
      simple
    } = this.props

    let s = this.calculateStylesFromWidth(width)
    let headerStyle = { ...styles.header, ...s.header, backgroundColor: color }
    let cardStyle = { ...styles.card, ...s.card }

    return (
      <View style={style}>
        <View style={cardStyle}>
          {simple ? (
            <View style={headerStyle}/>
          ) : (
            <View style={{ ...styles.wrapper, ...s.wrapper }}>
              <View style={{ ...headerStyle, ...styles.headerWithText }}>
                <Text style={styles.headerText}>
                  {property.name}
                </Text>
              </View>

              {this.renderContent()}
            </View>
          )}
        </View>
      </View>
    )
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

const styles = {
  card: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.2)',
    backgroundColor: 'white'
  },
  wrapper: {
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
    padding: 15,
    borderWidth: 2,
    borderColor: 'black'
  },
  headerText: {
    fontSize: 20,
    fontFamily: 'futura',
    textTransform: 'uppercase',
    textAlign: 'center'
  },
  content: {
    flex: 1,
    padding: 10
  },
  rentLine: {
    fontSize: 16,
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
    fontSize: 14,
    fontFamily: 'futura',
  },
  hotelLine: {
    fontSize: 16,
    fontFamily: 'futura',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20
  },
  bottomLine: {
    fontSize: 14,
    fontFamily: 'futura',
    textAlign: 'center'
  },
  finalLine: {
    marginTop: 'auto'
  },
  finalLineText: {
    fontSize: 8,
    fontFamily: 'futura',
    textAlign: 'center'
  }
}

export default PropertyCardContainer
