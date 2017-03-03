const errorReducer = (state = false, action) => {
  switch (action.type) {
    case 'ERROR':
      return {
        name: action.name,
        message: action.message
      }
      
    case 'CLEAR_ERROR':
      return false

    default:
      return state
  }
}

export default errorReducer
