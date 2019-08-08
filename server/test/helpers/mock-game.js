import { create } from '../../src/state';

// set up a mock game in the game room manager
export default async function mockGame({
  room,
  theme,
  config = {},
  players = [],
  properties = [],
  bank,
  houses,
  hotels
} = {}) {
  let state;

  if (room && !theme) {
    state = await this.loadGame(room)
      .then(s => ({ ...s, config: { ...s.config, ...config } }))
      .catch(() => {});
  }

  if (!state) {
    theme = theme || 'classic';

    state = create({
      room, theme,
      config: { ...this.loadTheme(theme, 'config'), ...config },
      properties: this.loadTheme(theme, 'properties')
    });
  }

  return await this.saveGame({
    ...state,
    bank: bank ?? state.bank,
    houses: houses ?? state.houses,
    hotels: hotels ?? state.hotels,

    players: players.reduce((players, transform) => ({
      ...players,

      all: !players.all.includes(transform.token)
        ? players.all.concat(transform.token)
        : players.all,

      [transform.token]: {
        ...(players[transform.token] || {
          name: `PLAYER ${players.all.length + 1}`,
          balance: state.config.playerStart,
          bankrupt: false
        }),
        ...transform
      }
    }), state.players),

    properties: properties.reduce((properties, transform) => {
      if (transform.group) {
        return properties.all.reduce((properties, id) => ({
          ...properties,

          [id]: properties[id].group === transform.group
            ? { ...properties[id], ...transform }
            : properties[id]
        }), properties);
      } else if (transform.id) {
        return {
          ...properties,

          [transform.id]: {
            ...properties[transform.id],
            ...transform
          }
        };
      } else {
        return properties;
      }
    }, state.properties)
  });
}
