import { describe, test, expect, vi } from 'vitest'

import { FormControl } from '../../src/form-control'
describe('FormContol', () => {
  describe('trigger', () => {
    test('does not focus if valid form values', async () => {
      const formControl = new FormControl({ values: { name: '' } })

      /**
       * TODO: invoke a method to register a new ref.
       *
       * The {@link FormControl.register} does not handle a real HTML element.
       */
      formControl.fields['name'] = {
        _f: {
          name: 'name',
          mount: true,
          ref: {
            name: 'name',
            focus: vi.fn(),
          },
        },
      }

      await formControl.trigger('name', { shouldFocus: true })

      expect(formControl.fields['name']._f.ref.focus).not.toHaveBeenCalled()
    })

    test('focuses if invalid form values and filters', async () => {
      const formControl = new FormControl({ values: { name: '' } })

      const focus = vi.fn()

      /**
       * TODO: invoke a method to register a new ref.
       *
       * The {@link FormControl.register} does not handle a real HTML element.
       */
      formControl.fields['name'] = {
        _f: {
          name: 'name',
          mount: true,
          required: true,
          ref: {
            name: 'name',
            required: true,
            focus,
          },
        },
      }

      await formControl.trigger('name', { shouldFocus: true })

      expect(focus).toHaveBeenCalled()
    })

    test('focuses if invalid form values and no filters', async () => {
      const formControl = new FormControl({ values: { name: '' } })

      /**
       * TODO: invoke a method to register a new ref.
       *
       * The {@link FormControl.register} does not handle a real HTML element.
       */
      formControl.fields['name'] = {
        _f: {
          name: 'name',
          mount: true,
          required: true,
          ref: {
            name: 'name',
            required: true,
            focus: vi.fn(),
          },
        },
      }

      /**
       * TODO: this should be handled by the same method to register an HTML element.
       */
      formControl.names.mount.add('name')

      await formControl.trigger(undefined, { shouldFocus: true })

      expect(formControl.fields['name']._f.ref.focus).toHaveBeenCalled()
    })
  })

  test('with resolver that returns no errors and filters', async () => {
    const formControl = new FormControl({
      resolver: async (values) => {
        return { values, errors: {} }
      },
    })

    /**
     * TODO: invoke a method to register a new ref.
     *
     * The {@link FormControl.register} does not handle a real HTML element.
     */
    formControl.fields['name'] = {
      _f: {
        name: 'name',
        mount: true,
        required: true,
        ref: {
          name: 'name',
          required: true,
          focus: vi.fn(),
        },
      },
    }

    await formControl.trigger('name', { shouldFocus: true })

    await formControl.trigger('name', { shouldFocus: true })

    expect(formControl.fields['name']._f.ref.focus).not.toHaveBeenCalled()
  })

  test('with resolver that returns no errors and no filters', async () => {
    const formControl = new FormControl({
      resolver: async (values) => {
        return { values, errors: {} }
      },
    })

    /**
     * TODO: invoke a method to register a new ref.
     *
     * The {@link FormControl.register} does not handle a real HTML element.
     */
    formControl.fields['name'] = {
      _f: {
        name: 'name',
        mount: true,
        required: true,
        ref: {
          name: 'name',
          required: true,
          focus: vi.fn(),
        },
      },
    }

    await formControl.trigger(undefined, { shouldFocus: true })

    expect(formControl.fields['name']._f.ref.focus).not.toHaveBeenCalled()
  })

  test('with resolver that returns errors with no filters', async () => {
    const formControl = new FormControl<{ name: string }>({
      resolver: async () => {
        return {
          errors: {
            name: {
              type: 'required',
            },
          },
        }
      },
    })

    /**
     * TODO: invoke a method to register a new ref.
     *
     * The {@link FormControl.register} does not handle a real HTML element.
     */
    formControl.fields['name'] = {
      _f: {
        name: 'name',
        mount: true,
        required: true,
        ref: {
          name: 'name',
          required: true,
          focus: vi.fn(),
        },
      },
    }

    /**
     * TODO: this should be handled by the same method to register an HTML element.
     */
    formControl.names.mount.add('name')

    await formControl.trigger(undefined, { shouldFocus: true })

    expect(formControl.fields['name']._f.ref.focus).toHaveBeenCalled()
  })

  test('with resolver that returns errors with filters', async () => {
    const formControl = new FormControl<{ name: string }>({
      resolver: async () => {
        return {
          errors: {
            name: {
              type: 'required',
            },
          },
        }
      },
    })

    /**
     * TODO: invoke a method to register a new ref.
     *
     * The {@link FormControl.register} does not handle a real HTML element.
     */
    formControl.fields['name'] = {
      _f: {
        name: 'name',
        mount: true,
        required: true,
        ref: {
          name: 'name',
          required: true,
          focus: vi.fn(),
        },
      },
    }

    /**
     * TODO: this should be handled by the same method to register an HTML element.
     */
    formControl.names.mount.add('name')

    await formControl.trigger('name', { shouldFocus: true, shouldSetErrors: true })

    expect(formControl.fields['name']._f.ref.focus).toHaveBeenCalled()
  })
})
