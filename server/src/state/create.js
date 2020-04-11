import slug from 'slug';

// creates a brand new game state
export default function create({
  room,
  theme,
  config,
  properties
}) {
  return {
    room,
    theme,
    config,

    bank: config.bankStart < 0 ? Infinity : config.bankStart,
    houses: config.houseCount,
    hotels: config.hotelCount,
    players: { all: [] },
    timestamp: Date.now(),
    notice: null,
    history: [],

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
