export function transitionTo(location, action) {
  return { type: 'NAVIGATE', location, action }
}

export function navigateTo(pathname, query) {
  return transitionTo({ pathname, query }, 'PUSH')
}

export function redirectTo(pathname, query) {
  return transitionTo({ pathname, query }, 'REPLACE')
}
