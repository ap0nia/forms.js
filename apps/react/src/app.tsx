import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom'

import { AutoUnregister } from './auto-unregister'
import { Basic } from './basic'
import { BasicSchemaValidation } from './basic-schema-validation'
import { ConditionalField } from './conditional-field'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <div>
        <h1>Hello World</h1>
        <Link to="/basic/onSubmit">Basic onSubmit</Link>
        <Link to="/auto-unregister">AutoUnregister</Link>
      </div>
    ),
  },
  {
    path: '/auto-unregister',
    element: <AutoUnregister />,
  },
  {
    path: '/basic/:mode',
    element: <Basic />,
  },
  {
    path: '/basic-schema-validation/:mode',
    element: <BasicSchemaValidation />,
  },
  {
    path: '/conditional-field',
    element: <ConditionalField />,
  },
])

export function App() {
  return <RouterProvider router={router} />
}
