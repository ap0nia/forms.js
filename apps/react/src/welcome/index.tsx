import { Link } from 'react-router-dom'

import * as S from './styles'

type Item = {
  title: string
  description: string
  slugs: string[]
}

const items: Item[] = [
  {
    title: 'AutoUnregister',
    description: 'Should keep all inputs data when inputs get unmounted',
    slugs: ['/auto-unregister'],
  },
  {
    title: 'Basic',
    description: 'Should validate the form in different modes',
    slugs: ['/basic/onSubmit', '/basic/onBlur', '/basic/onChange'],
  },
  {
    title: 'BasicSchemaValidation',
    description: 'BasicSchemaValidation form validation',
    slugs: [
      '/basic-schema-validation/onSubmit',
      '/basic-schema-validation/onBlur',
      '/basic-schema-validation/onChange',
    ],
  },
  {
    title: 'ConditionalField',
    description: 'Should reflect correct form state and data collection',
    slugs: ['/conditional-field'],
  },
  {
    title: 'Controller',
    description: 'Should validate the form in different modes',
    slugs: ['/controller/onSubmit', '/controller/onBlur', '/controller/onChange'],
  },
  {
    title: 'CustomSchemaValidation',
    description: 'Should validate the form in different modes',
    slugs: [
      '/custom-schema-validation/onSubmit',
      '/custom-schema-validation/onBlur',
      '/custom-schema-validation/onChange',
    ],
  },
  {
    title: 'DefaultValues',
    description: 'Should populate defaultValue for inputs',
    slugs: ['/default-values', '/default-values-async'],
  },
  {
    title: 'FormState',
    description: 'Should return correct form state in different modes',
    slugs: ['/form-state/onSubmit', '/form-state/onBlur', '/form-state/onChange'],
  },
  {
    title: 'FormStateWithNestedFields',
    description: 'Should return correct form state with nested fields in different modes',
    slugs: [
      '/form-state-with-nested-fields/onSubmit',
      '/form-state-with-nested-fields/onBlur',
      '/form-state-with-nested-fields/onChange',
    ],
  },
  {
    title: 'FormStateWithSchema',
    description: 'Should return correct form state with schema validation in different modes',
    slugs: [
      '/form-state-with-schema/onSubmit',
      '/form-state-with-schema/onBlur',
      '/form-state-with-schema/onChange',
    ],
  },
  {
    title: 'IsValid',
    description: 'Should showing valid correctly',
    slugs: [
      '/is-valid/build-in/defaultValue',
      '/is-valid/build-in/defaultValues',
      '/is-valid/schema/defaultValue',
      '/is-valid/schema/defaultValues',
    ],
  },
  {
    title: 'ManualRegisterForm',
    description: 'Should validate the form',
    slugs: ['/manual-register-form'],
  },
  {
    title: 'Reset',
    description: 'Should be able to re-populate the form while reset',
    slugs: ['/reset'],
  },
  {
    title: 'ReValidateMode',
    description: 'Should re-validate the form in different modes',
    slugs: [
      '/re-validate-mode/onSubmit/onSubmit',
      '/re-validate-mode/onSubmit/onBlur',
      '/re-validate-mode/onBlur/onSubmit',
      '/re-validate-mode/onChange/onSubmit',
      '/re-validate-mode/onBlur/onBlur',
      '/re-validate-mode/onBlur/onChange',
    ],
  },
  {
    title: 'SetError',
    description: 'Form setError',
    slugs: ['/set-error'],
  },
  {
    title: 'DelayError',
    description: 'Form showing delay error',
    slugs: ['/delay-error'],
  },
  {
    title: 'setFocus',
    description: 'Form setFocus',
    slugs: ['/set-focus'],
  },
  {
    title: 'SetValue',
    description: 'Should set input value',
    slugs: ['/set-value', '/set-value-async-strict-mode'],
  },
  {
    title: 'SetValueCustomRegister',
    description: 'Should only trigger re-render when form state changed or error triggered',
    slugs: ['/set-value-custom-register'],
  },
  {
    title: 'SetValueWithSchema',
    description: 'Should set input value, trigger validation and clear all errors',
    slugs: ['/set-value-with-schema'],
  },
  {
    title: 'SetValueWithTrigger',
    description: 'Should set input value and trigger validation',
    slugs: ['/set-value-with-trigger'],
  },
  {
    title: 'TriggerValidation',
    description: 'Should trigger input validation',
    slugs: ['/trigger-validation'],
  },
  {
    title: 'UseFieldArray',
    description: 'Should behaviour correctly in different situations',
    slugs: [
      '/use-field-array/normal',
      '/use-field-array/default',
      '/use-field-array/defaultAndWithoutFocus',
      '/use-field-array/asyncReset',
      '/use-field-array/defaultAndWithoutFocus',
      '/use-field-array/formState',
    ],
  },
  {
    title: 'UseFieldArrayNested',
    description: 'Should work correctly with nested field array',
    slugs: ['/use-field-array-nested'],
  },
  {
    title: 'UseFieldArrayUnregister',
    description: 'Should work correctly',
    slugs: ['/use-field-array-unregister'],
  },
  {
    title: 'UseFormState',
    description: 'Should subscribed to the form state without re-render the root',
    slugs: ['/use-form-state'],
  },
  {
    title: 'UseWatch',
    description: 'Should watch correctly',
    slugs: ['/use-watch'],
  },
  {
    title: 'UseWatchUseFieldArrayNested',
    description: 'Should watch the correct nested field array',
    slugs: ['/use-watch-use-field-array-nested'],
  },
  {
    title: 'ValidateFieldCriteria',
    description: 'Should validate the form, show all errors and clear all',
    slugs: ['/validate-field-criteria'],
  },
  {
    title: 'Watch',
    description: 'Should watch all inputs',
    slugs: ['/watch'],
  },
  {
    title: 'WatchDefaultValues',
    description: 'Should return default value with watch',
    slugs: ['/watch-default-values'],
  },
  {
    title: 'WatchUseFieldArray',
    description: 'Should behave correctly when watching the field array',
    slugs: ['/watch-field-array/normal', '/watch-field-array/default'],
  },
  {
    title: 'WatchUseFieldArrayNested',
    description: 'Should watch the correct nested field array',
    slugs: ['/watch-use-field-array-nested'],
  },
  {
    title: 'Form',
    description: 'Should validate form and submit the request',
    slugs: ['/form'],
  },
  {
    title: 'Disabled',
    description: 'Should behave correctly when disabling form or fields',
    slugs: ['/disabled'],
  },
]

export function Welcome() {
  return (
    <div style={S.page}>
      <h1 style={S.h1}>App for cypress automation</h1>
      <h2 style={S.h2}>Here you have the full list of the available testing routes:</h2>
      <div style={S.items}>
        {items.map(({ title, description, slugs }: Item) => (
          <div style={S.item} key={title}>
            <div style={S.title}>{title}</div>
            <div style={S.description}>{description}</div>
            <div>
              {slugs.map((slug, index) => (
                <Link key={index + slug} to={slug} style={S.slug}>
                  {slug}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
