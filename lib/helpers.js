import MonopolyError from'./error'
import fs from 'fs'

// Helper functions
// ----------------

export function assert(message, condition) {
  if (condition) {
    throw new MonopolyError(message)
  }
}

// Lowercase and dasherize a string
export function dasherize(str) {
  return str.trim().toLowerCase().replace(/\s+/g, '-')
}

// Make a unique _id from an array of objects
export function uniqueValue(key, val, arr) {
  let unique = val
  let count = 1

  while (arr.find((obj) => obj[key] === unique)) {
    unique = `${val}-${count++}`
  }

  return unique
}

// Create a random string
export function randomString(length = 5) {
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let rand = ''

  for (let i = 0; i < length; i++) {
    rand += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return rand
}

// Returns data from a JSON file
export function loadJSON(filename) {
  try {
    return JSON.parse(fs.readFileSync(filename).toString())
  } catch (e) {
    return {}
  }
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
      if (obj[key].match(/-?\d+(\.\d+)?/)) {
        obj[key] = parseFloat(obj[key], 10)
      }

    // Assume it's an object or array
    } else {
      obj[key] = fixNumberStrings(obj[key])
    }
  }

  return obj
}
