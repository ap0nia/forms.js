// import { Type } from 'arktype'
//
// export type Options = {
//   /**
//    * Return the raw input values rather than the parsed values.
//    * @default false
//    */
//   raw?: boolean
// }
//
// // export type Resolver = <T extends Type<any>>(
// //   schema: T,
// //   schemaOptions?: never,
// //   factoryOptions?: {
// //     /**
// //      * Return the raw input values rather than the parsed values.
// //      * @default false
// //      */
// //     raw?: boolean;
// //   },
// // ) => <TFieldValues extends FieldValues, TContext>(
// //   values: TFieldValues,
// //   context: TContext | undefined,
// //   options: ResolverOptions<TFieldValues>,
// // ) => ResolverResult<TFieldValues>;
//
// export function createResolver<T extends Type>(
//   schema: T,
//   schemaOptions?: never,
//   factoryOptions?: Options,
// ) {
//   return function resolver<TFieldValues, TContext>(
//     values: TFieldValues,
//     context: TContext | undefined,
//     options: ResolverOptions<TFieldValues>,
//   ): ResolverResult<TFieldValues> {
//     return {}
//   }
// }
