import { getTradeId, createGameState } from '../src/helpers';
export { getTradeId, createGameState };

// Convenient selectors
export const getPlayer = (state, token) => state.players[token];
export const getProperty = (state, id) => state.properties[id];
export const getProperties = (state, group) => (
  state.properties._all
    .map((id) => getProperty(state, id))
    .filter((prop) => prop.group === group)
);

/**
 * Modifies a game state with transforms
 * @param {Object} state - The state to extend or create a new state
 * @param {[Object]} transforms.players - Array of players to create or modify
 * @param {[Object]} transforms.properties - Array of properties or groups to modify
 * @param {[Object]} transforms.trades - Array of trade to create or modify
 * @param {[Object]} transforms.auction - Auction data to modify
 * @param {Object} config - Game configuration
 * @returns {Object} A new transformed game state
 */
export function transformGameState(state, transforms, config) {
  return {
    ...state,
    ...transforms,

    // transform existing players by id or create new ones
    players: (transforms.players||[]).reduce((players, transform) => ({
      ...players,

      _all: [...players._all, transform.token],

      [transform.token]: players[transform.token] ? {
        ...players[transform.token],
        ...transform
      } : {
        name: transform.name || `Player ${players._all.length + 1}`,
        balance: transform.balance || config.playerStart,
        bankrupt: transform.bankrupt || false,
        ...transform
      }
    }), JSON.parse(JSON.stringify(state.players))),

    // transform existing properties by id or group
    properties: (transforms.properties||[]).reduce((properties, transform) => {
      if (transform.group) {
        properties._all.forEach((propertyId) => {
          if (properties[propertyId].group === transform.group) {
            properties[propertyId] = {
              ...properties[propertyId],
              ...transform
            };
          }
        });
      } else if (transform.id) {
        properties[transform.id] = {
          ...properties[transform.id],
          ...transform
        };
      }

      return properties;
    }, JSON.parse(JSON.stringify(state.properties))),

    // transform exisiting trades or create new ones
    trades: (transforms.trades||[]).reduce((trades, transform) => {
      const id = getTradeId(transform.from, transform.with);

      return {
        ...trades,

        [id]: trades[id] ? {
          ...trades[id],
          ...transform
        } : {
          from: transform.from,
          with: transform.with,
          properties: transform.properties || [],
          amount: transform.amount || 0
        }
      };
    }, JSON.parse(JSON.stringify(state.trades))),

    // transform existing auction or create a new one
    auction: transforms.auction ? (
      state.auction ? {
        ...JSON.parse(JSON.stringify(state.auction)),
        ...transforms.auction
      } : {
        players: Object.keys(state.players)
          .concat((transforms.players||[]).map((pl) => pl.token))
          .filter((token, i, players) => players.indexOf(token) === i),
        winning: false,
        amount: 0,
        ...transforms.auction
      }
    ) : (
      typeof transforms.auction === 'undefined'
        ? state.auction
        : false
    )
  };
}
