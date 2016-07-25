import { connect } from 'react-redux'
import ThemeSprites from '../components/ThemeSprites'

const mapStateToProps = ({ game: { theme }}) => {
  return { theme }
}

export default connect(mapStateToProps)(ThemeSprites)