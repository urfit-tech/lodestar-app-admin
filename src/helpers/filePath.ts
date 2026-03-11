export const getFileExtension = (value: string) => {
  const basename = value.split(/[\\/]/).pop() || value
  const dotIndex = basename.lastIndexOf('.')

  if (dotIndex <= 0) {
    return ''
  }

  return basename.slice(dotIndex)
}
