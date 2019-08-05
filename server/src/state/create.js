import slug from 'slug';

// creates a brand new game state
export default function create({
  id,
  theme,
  config,
  properties
}) {
  return {
    id,
    theme,
    config,

    bank: config.bankStart < 0 ? Infinity : config.bankStart,
    houses: config.houseCount,
    hotels: config.hotelCount,
    players: { all: [] },
    trades: {},
    notice: null,

    properties: properties.reduce((map, property) => {
      let id = slug(property.name, { lower: true });

      map[id] = {
        ...property,
        mortgaged: false,
        monopoly: false,
        buildings: 0,
        owner: 'bank',
        id
      };

      map.all.push(id);
      return map;
    }, { all: [] })
  };
}
