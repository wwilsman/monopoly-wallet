// action types
export const PUSH = 'ROUTER_PUSH';
export const REPLACE = 'ROUTER_REPLACE';
export const LOCATION_CHANGED = 'ROUTER_LOCATION_CHANGED';

// action creators
export const push = (pathname) => ({
  type: PUSH,
  location: { pathname }
});

export const replace = (pathname) => ({
  type: REPLACE,
  location: { pathname }
});

// initial state
const initialState = {
  location: {}
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
        location: { pathname: history.location.pathname }
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
  };
};
