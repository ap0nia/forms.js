import { FormControl } from './logic/create-form-control'
import type { FieldValues } from './types/fields'
import type { UseFormProps } from './types/form'

/**
 * Custom hook to manage the entire form.
 *
 * @remarks
 * • [API](https://react-hook-form.com/docs/useform)
 * • [Demo](https://codesandbox.io/s/react-hook-form-get-started-ts-5ksmm)
 * • [Video](https://www.youtube.com/watch?v=RkXv4AXXC_4)
 *
 * @param props - form configuration and validation parameters.
 *
 * @returns methods - individual functions to manage the form state. {@link UseFormReturn}
 *
 * @example
 *
 * ```tsx
 * function App() {
 *   const { register, handleSubmit, watch, formState: { errors } } = useForm();
 *   const onSubmit = data => console.log(data);
 *
 *   console.log(watch("example"));
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <input defaultValue="test" {...register("example")} />
 *       <input {...register("exampleRequired", { required: true })} />
 *       {errors.exampleRequired && <span>This field is required</span>}
 *       <button>Submit</button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  // TTransformedValues extends FieldValues | undefined = undefined,
>(props: UseFormProps<TFieldValues, TContext> = {}) {
  const formControl = new FormControl<TFieldValues, TContext>(props, () => {})
  return formControl
}
