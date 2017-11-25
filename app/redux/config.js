// initial config state
const initialState = {
  bankStart: 0,
  playerStart: 0,
  passGoAmount: 0,
  payJailAmount: 0,
  playerTokens: [],
  groupColors: {}
};

// config reducer
export const reducer = (state = initialState, action) => {
  switch (action.type) {
    default:
      if (action.config) {
        return { ...(state || {}), ...action.config };
      } else {
        return state;
      }
  }
};
