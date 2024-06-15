import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom'

import { AutoUnregister } from './auto-unregister'
import { Basic } from './basic'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <div>
        <h1>Hello World</h1>
        <Link to="/autoUnregister">AutoUnregister</Link>
      </div>
    ),
  },
  {
    path: '/autoUnregister',
    element: <AutoUnregister />,
  },
  {
    path: '/basic/:mode',
    element: <Basic />,
  },
])

export function App() {
  return <RouterProvider router={router} />
}
