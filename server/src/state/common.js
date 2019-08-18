import {
  pipe,
  reduce,
  withProperty,
  withGroup
} from './utils';

// transfers an amount from a player to the bank or another player
export function transferAmount(from, to, amount) {
  return pipe(
    reduce(from === 'bank' ? from : `players.${from}.balance`, b => b - amount),
    reduce(to === 'bank' ? to : `players.${to}.balance`, b => b + amount)
  );
}

// transfers a property to a player and determines the property's monopoly
// status based on the group owner
export function transferProperty(id, owner) {
  return withProperty(id, ({ group }) => pipe(
    reduce(`properties.${id}.owner`, () => owner),
    withGroup(group, g => {
      let monopoly = owner !== 'bank' && g.every(p => p.owner === owner);

      return pipe(g.map(p => p.monopoly !== monopoly && (
        reduce(`properties.${p.id}.monopoly`, () => monopoly)
      )));
    }),
  ));
}

// adds a new notice object to the state
export function notice(id, meta) {
  return reduce('notice', () => ({
    timestamp: Date.now(),
    meta,
    id
  }));
}
