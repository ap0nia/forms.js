import { createRoot } from 'react-dom/client'

import { App } from './app'

function main() {
  const root = document.getElementById('root')

  if (root == null) {
    console.error('Create root element in template')
    return
  }

  createRoot(root).render(<App />)
}

main()
