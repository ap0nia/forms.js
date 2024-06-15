import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom'

import { AutoUnregister } from './auto-unregister'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <div>
        <h1>Hello World</h1>
        <Link to="about">About Us</Link>
        <Link to="/autoUnregister">AutoUnregister</Link>
      </div>
    ),
  },
  {
    path: 'about',
    element: <div>About</div>,
  },
  {
    path: '/autoUnregister',
    element: <AutoUnregister />,
  },
])

export function App() {
  return <RouterProvider router={router} />
}
