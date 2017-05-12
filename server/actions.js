import slug from 'slug';

export const JOIN_GAME = 'JOIN_GAME';

/**
 * Action creator for joining a game
 * @param {String} name - Player name
 * @param {String} token - Player token
 * @returns {Object} Redux action
 */
export const join = (name, token) => ({
  type: JOIN_GAME,
  player: {
    id: slug(`${name}_${token}`),
    name,
    token
  }
});
