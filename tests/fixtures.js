import { createState } from '../server/game';
import defaultConfig from '../server/themes/classic/config';
import defaultProperties from '../server/themes/classic/properties';

export const GAME_FIXTURE = createState({
  properties: defaultProperties
}, defaultConfig);

export const CONFIG_FIXTURE = {
  ...defaultConfig
};
