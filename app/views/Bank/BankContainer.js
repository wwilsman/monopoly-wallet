import { connect } from 'react-redux'

import Bank from './Bank'
import { getUnownedProperties } from '../../core/selectors'

function mapStateToProps(state) {
  return {
    properties: getUnownedProperties(state)
  }
}

const BankContainer = connect(
  mapStateToProps
)(Bank)

export default BankContainer
