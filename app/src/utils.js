export function uid(prefix = 'uid') {
  let n = uid.n = (uid.n || 0) + 1;
  return `${prefix}-${n}`;
}

export function dataAttrs(props) {
  return Object.keys(props).reduce((data, key) => {
    if (key.match(/^data-/)) {
      data[key] = props[key];
    }

    return data;
  }, {});
}
