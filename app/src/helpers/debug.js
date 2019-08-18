import { useEffect, useRef } from 'react';

export default function useDebugChanges(name, obj) {
  const prev = useRef();

  useEffect(() => {
    if (prev.current) {
      const changes = Object.keys({ ...prev.current, ...obj })
        .reduce((changes, key) => {
          if (prev.current[key] !== obj[key]) {
            return Object.assign(changes, {
              [key]: {
                from: prev.current[key],
                to: obj[key]
              }
            });
          } else {
            return changes;
          }
        }, {});

      if (Object.keys(changes).length) {
        // eslint-disable-next-line no-console
        console.log('[changes]', name, changes);
      }
    }

    prev.current = obj;
  });
}
