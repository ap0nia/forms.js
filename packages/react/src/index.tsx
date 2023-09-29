import { createRoot } from 'react-dom/client'

import { App } from './App'

function main() {
  const id = 'root'

  const root = document.getElementById(id)

  if (root == null) {
    throw new Error(`Element with id ${id} not found`)
  }

  createRoot(root).render(<App />)
}

main()
