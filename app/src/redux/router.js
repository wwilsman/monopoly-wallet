// action types
export const PUSH = 'ROUTER/PUSH';
export const REPLACE = 'ROUTER/REPLACE';
export const GO_BACK = 'ROUTER/GO_BACK';
export const LOCATION_CHANGED = 'ROUTER/LOCATION_CHANGED';

// action creators
export const push = (pathname, state = {}) => ({
  type: PUSH,
  location: {
    pathname,
    state: {
      internal: true,
      ...state
    }
  }
});

export const replace = (pathname) => ({
  type: REPLACE,
  location: { pathname }
});

export const goBack = () => ({
  type: GO_BACK
});

// initial state
const initialState = {
  location: {
    pathname: '',
    state: {}
  }
};

// reducer
export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case PUSH:
    case REPLACE:
    case LOCATION_CHANGED:
      return {
        ...state,
        location: {
          ...state.location,
          ...action.location
        }
      };

    default:
      return state;
  }
};

/**
 * Redux middleware to keep the state and URL in sync
 * @param {Object} history - history object
 * @returns {Function} Redux middleware
 */
export const middleware = (history) => (store) => {
  let isDispatching = false;

  // update our state location when the history changes
  // outside of the router middleware
  history.listen(() => {
    if (!isDispatching) {
      store.dispatch({
        type: LOCATION_CHANGED,
        location: {
          pathname: history.location.pathname,
          state: history.location.state || {}
        }
      });
    }
  });

  // the actual middleware dispatches the action and updates the
  // history from the new router state
  return (next) => (action) => {
    next(action);

    // let the history listener know we might be changing the history
    isDispatching = true;

    // the actions trigger corresponding history methods
    let { router } = store.getState();

    if (action.type === PUSH) {
      history.push(router.location);
    } else if (action.type === REPLACE) {
      history.replace(router.location);
    }

    // let the history listener know we're done
    isDispatching = false;

    // history navigation happens outside of isDispatching so the
    // listener can dispatch a LOCATION_CHANGED action
    if (action.type === GO_BACK) {
      history.goBack();
    }
  };
};
