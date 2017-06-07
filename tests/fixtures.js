import { createState } from '../server/game';
import defaultConfig from '../server/themes/classic/config';
import defaultProperties from '../server/themes/classic/properties';

export const GAME_FIXTURE = {
  id: 'T35TT',
  ...createState({
    properties: defaultProperties
  }, defaultConfig)
};

export const CONFIG_FIXTURE = {
  ...defaultConfig
};
