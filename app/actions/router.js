export const PUSH = 'ROUTER_PUSH';
export const REPLACE = 'ROUTER_REPLACE';
export const LOCATION_CHANGED = 'ROUTER_LOCATION_CHANGED';

export const push = (pathname) => ({
  type: PUSH,
  location: { pathname }
});

export const replace = (pathname) => ({
  type: REPLACE,
  location: { pathname }
});
