export function updateTheme(payload) {
  return { type: 'UPDATE_THEME', payload }
}

export function clearTheme() {
  return { type: 'CLEAR_THEME' }
}
