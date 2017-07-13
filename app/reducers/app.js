import {
  APP_ERROR,
  APP_LOADING_DONE
} from '../actions/app';

const initialState = {
  error: false,
  loading: true
};

export default (state = initialState, action) => {
  switch (action.type) {
    case APP_ERROR:
      return { ...state,
        error: action.error.message,
        loading: false
      };

    case APP_LOADING_DONE:
      return { ...state,
        loading: false
      };

    default:
      return state;
  }
};
