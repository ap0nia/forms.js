export function generateId() {
  const number = typeof performance === 'undefined' ? Date.now() : performance.now() * 1000

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16 + number) % 16 | 0

    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export default generateId
