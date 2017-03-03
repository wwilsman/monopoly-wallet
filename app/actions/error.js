export function setError(name, message) {
  return { type: 'ERROR', name, message }
}

export function clearError() {
  return { type: 'CLEAR_ERROR' }
}
