import MonopolyError from'./error'

// Helper functions
// ----------------

export function assert(message, condition) {
  if (condition) {
    throw new MonopolyError(message)
  }
}

// Lowercase and dasherize a string
export function dasherize(str) {
  return str.toLowerCase().replace(' ', '-')
}

// Make a unique _id from an array of objects
export function uniqueID(name, arr) {
  let _id = dasherize(name)
  let uniqueID = _id
  let unique = 1

  while (arr.find((obj) => obj._id === _id)) {
    uniqueID = `${_id}-${unique++}`
  }

  return uniqueID
}

// Create a random ID
export function randID(length = 5) {
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let rand = ''

  for (let i = 0; i < length; i++) {
    rand += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return rand
}

export function deepExtend(obj, ...others) {
  others.filter((o) => !!o).forEach((source) => {
    for (let prop in source) {
      if (source.hasOwnProperty(prop)) {
        if (obj[prop] !== undefined && typeof source[prop] === 'object' && source[prop] !== null) {
          if (Array.isArray(source[prop])) {
            obj[prop] = source[prop].slice(0)
          } else {
            obj[prop] = deepExtend({}, obj[prop], source[prop])
          }
        } else {
          obj[prop] = source[prop]
        }
      }
    }
  })

  return obj
}

// Convert all-number strings within an object to floats
export function fixNumberStrings(obj) {

  // Loop through the object
  for (let key in obj) {

    // Already a number
    if (typeof obj[key] === 'number') {
      continue

    // Found a string
    } else if (typeof obj[key] === 'string') {

      // String only contains numbers
      if (obj[key].test(/-?\d+(\.\d+)?/)) {
        obj[key] = parseFloat(obj[key], 10)
      }

    // Assume it's an object or array
    } else {
      obj[key] = fixNumberStrings(obj[key])
    }
  }

  return obj
}
