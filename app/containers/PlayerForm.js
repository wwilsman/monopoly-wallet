import { connect } from 'react-redux'
import PlayerForm from '../components/PlayerForm'

const mapStateToProps = ({ game: { tokens }, player }) => {
  return { tokens, player }
}

export default connect(mapStateToProps)(PlayerForm)
