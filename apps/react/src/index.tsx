import { createRoot } from 'react-dom/client'

import { App } from './app'

const rootId = 'root'

function ensureRootElement() {
  const root = document.getElementById(rootId)

  if (root != null) {
    return root
  }

  const newRoot = document.createElement('div')

  newRoot.id = rootId

  document.body.appendChild(newRoot)

  return newRoot
}

function main() {
  const element = ensureRootElement()

  const root = createRoot(element)

  root.render(<App />)
}

main()
