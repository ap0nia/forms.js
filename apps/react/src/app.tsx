import './app.css'

import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom'

import { AutoUnregister } from './auto-unregister'
import { Basic } from './basic'
import { BasicSchemaValidation } from './basic-schema-validation'
import { ConditionalField } from './conditional-field'
import { Controller } from './controller'
import { CrossFrameForm } from './cross-frame-form'
import { CustomSchemaValidation } from './custom-schema-validation'
import { DefaultValues } from './default-values'
import { DefaultValuesAsync } from './default-values-async'
import { DelayError } from './delay-error'
import FormState from './form-state'
import { FormStateWithNestedFields } from './form-state-with-nested-fields'
import { FormStateWithSchema } from './form-state-with-schema'
import { IsValid } from './is-valid'
import { ManualRegisterForm } from './manual-register-form'
import { RevalidateMode } from './revalidate-mode'

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
  {
    path: '/controller/:mode',
    element: <Controller />,
  },
  {
    path: '/cross-frame-form',
    element: <CrossFrameForm />,
  },
  {
    path: '/custom-schema-validation/:mode',
    element: <CustomSchemaValidation />,
  },
  {
    path: '/default-values',
    element: <DefaultValues />,
  },
  {
    path: '/default-values-async',
    element: <DefaultValuesAsync />,
  },
  {
    path: '/delay-error',
    element: <DelayError />,
  },
  {
    path: '/form-state/:mode',
    element: <FormState />,
  },
  {
    path: '/form-state-with-nested-fields/:mode',
    element: <FormStateWithNestedFields />,
  },
  {
    path: '/form-state-with-schema/:mode',
    element: <FormStateWithSchema />,
  },
  {
    path: '/is-valid/:mode/:defaultValues',
    element: <IsValid />,
  },
  {
    path: '/manual-register-form',
    element: <ManualRegisterForm />,
  },
  {
    path: '/re-validate-mode/:mode/:reValidateMode',
    element: <RevalidateMode />,
  },
])

export function App() {
  return <RouterProvider router={router} />
}
