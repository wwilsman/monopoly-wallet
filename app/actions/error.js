export function setError(title, message) {
  return { type: 'ERROR', title, message }
}
