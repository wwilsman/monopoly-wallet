const errorReducer = (state = false, action) => {
  switch (action.type) {
    case 'ERROR':
      return {
        title: action.title,
        message: action.message
      }

    default:
      return state
  }
}

export default errorReducer
