const characters = 'abcdefghijklmnopqrstuvwxyz'

function generateRandomKey() {
  const keyLength = Math.floor(Math.random() * 10) + 1 // Random key length between 1 and 10

  let key = ''

  for (let i = 0; i < keyLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length)
    key += characters[randomIndex]
  }

  return key
}

/**
 * @param {number} depth
 */
function generateJSONObject(depth) {
  /**
   * @type Record<string, any>
   */
  const obj = {}

  if (depth === 0) {
    obj[generateRandomKey()] = 'string'
  } else {
    obj[generateRandomKey()] = generateJSONObject(depth - 1)
  }

  return obj
}

const depth = 25
const jsonObject = generateJSONObject(depth)
const jsonString = JSON.stringify(jsonObject, null, 2)
console.log(jsonString)
