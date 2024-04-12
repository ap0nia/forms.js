export type RawData = Blob | FileList

export function isRawData(data: unknown): data is RawData {
  return data instanceof Blob || data instanceof FileList
}
