// function useForm() {
//   const formControl = useMemo(() => {
//     return new FormControl()
//   }, [])
//
//   const register = useCallback(
//     (name: string, options?: any) => {
//       const { registerElement, unregisterElement } = formControl.register(name, options)
//
//       const onChange = formControl.handleChange.bind(formControl)
//
//       const props = {
//         name,
//         onBlur: onChange,
//         onChange,
//         ref: (instance: HTMLElement | null) => {
//           if (instance) {
//             registerElement(instance as HTMLInputElement)
//           } else {
//             unregisterElement()
//           }
//         },
//       }
//
//       return props
//     },
//     [formControl],
//   )
//
//   const [, forceUpdate] = useReducer((count) => count + 1, 0)
//
//   useEffect(() => {
//     const unsubscribe = formControl.derivedState.subscribe((v) => {
//       console.log({ v })
//       // forceUpdate()
//     })
//
//     return () => {
//       unsubscribe()
//     }
//   }, [])
//
//   return {
//     formControl,
//     formState: formControl.derivedState.value,
//     register,
//   }
// }
