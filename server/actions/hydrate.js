export const HYDRATE = 'HYDRATE';

/**
 * Hydrates the game state
 * @param {Object} state - State to hydrate
 * @returns {Object} Redux action
 */
export const hydrate = (state) => ({
  type: HYDRATE,
  state
});
