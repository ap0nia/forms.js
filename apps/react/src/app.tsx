import './app.css'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

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
import { Reset } from './reset'
import { RevalidateMode } from './revalidate-mode'
import { SetError } from './set-error'
import { SetFocus } from './set-focus'
import { SetValue } from './set-value'
import { SetValueAsyncStrictMode } from './set-value-async-strict-mode'
import { SetValueCustomRegister } from './set-value-custom-register'
import { SetValueWithSchema } from './set-value-with-schema'
import { SetValueWithTrigger } from './set-value-with-trigger'
import { TriggerValidation } from './trigger-validation'
import { UseFieldArray } from './use-field-array'
import { UseFieldArrayNested } from './use-field-array-nested'
import { UseFieldArrayUnregister } from './use-field-array-unregister'
import { UseFormState } from './use-form-state'
import { UseWatch } from './use-watch'
import { UseWatchUseFieldArrayNested } from './use-watch-use-field-array-nested'
import { ValidateFieldCriteria } from './validate-field-criteria'
import { Watch } from './watch'
import { Welcome } from './welcome'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Welcome />,
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
  {
    path: '/reset',
    element: <Reset />,
  },
  {
    path: '/set-error',
    element: <SetError />,
  },
  {
    path: '/set-focus',
    element: <SetFocus />,
  },
  {
    path: '/set-value',
    element: <SetValue />,
  },
  {
    path: '/set-value-custom-register',
    element: <SetValueCustomRegister />,
  },
  {
    path: '/set-value-async-strict-mode',
    element: <SetValueAsyncStrictMode />,
  },
  {
    path: '/set-value-with-schema',
    element: <SetValueWithSchema />,
  },
  {
    path: '/set-value-with-trigger',
    element: <SetValueWithTrigger />,
  },
  {
    path: '/trigger-validation',
    element: <TriggerValidation />,
  },
  {
    path: '/use-field-array/:mode',
    element: <UseFieldArray />,
  },
  {
    path: '/use-field-array-nested',
    element: <UseFieldArrayNested />,
  },
  {
    path: '/use-field-array-unregister',
    element: <UseFieldArrayUnregister />,
  },
  {
    path: '/use-form-state',
    element: <UseFormState />,
  },
  {
    path: '/use-watch',
    element: <UseWatch />,
  },
  {
    path: '/use-watch-use-field-array-nested',
    element: <UseWatchUseFieldArrayNested />,
  },
  {
    path: '/validate-field-criteria',
    element: <ValidateFieldCriteria />,
  },
  {
    path: '/watch',
    element: <Watch />,
  },
])

export function App() {
  return <RouterProvider router={router} />
}
