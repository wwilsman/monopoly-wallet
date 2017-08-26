import { createSelector } from 'reselect';

const getPlayerTokens = (state) => state.game.config.playerTokens;

const getIconWhitelist = createSelector(
  getPlayerTokens,
  (tokens = []) => {
    const whitelist = ['currency', 'building'];
    return tokens.concat(whitelist);
  }
);

export const getIsThemedIcon = createSelector(
  [getIconWhitelist, (state, props) => props.name],
  (whitelist, name) => whitelist.includes(name)
);
