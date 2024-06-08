/**
 * @see https://github.com/react-hook-form/react-hook-form/blob/master/src/types/utils.ts
 *
 * Projects that React Hook Form installed don't include the DOM library need these interfaces to compile.
 * React Native applications is no DOM available. The JavaScript runtime is ES6/ES2015 only.
 * These definitions allow such projects to compile with only --lib ES6.
 *
 * Warning: all of these interfaces are empty.
 * If you want type definitions for various properties, you need to add `--lib DOM` (via command line or tsconfig.json).
 */

interface File extends Blob {
  readonly lastModified: number
  readonly name: string
}

interface FileList {
  readonly length: number
  item(index: number): File | null
  [index: number]: File
}

export type BrowserNativeObject = Date | FileList | File

/**
 * Special edge cases whenever recurring into records, aside from the explicit "any" type.
 */
export type NonRecordNonPrimitives =
  | BrowserNativeObject
  | BigInt
  | Blob
  | Function
  | Map<any, any>
  | Set<any>
  | Symbol

export type NotRecord<T> = T extends Record<string, any>
  ? T extends NonRecordNonPrimitives
    ? T
    : never
  : T
