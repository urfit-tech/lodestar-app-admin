import { describe, expect, it } from 'vitest'
import { getFileExtension } from './filePath'

describe('getFileExtension', () => {
  it('returns the trailing file extension with the leading dot', () => {
    expect(getFileExtension('avatar.png')).toBe('.png')
    expect(getFileExtension('archive.tar.gz')).toBe('.gz')
  })

  it('ignores folders and filenames without an extension', () => {
    expect(getFileExtension('/tmp/demo/photo.jpg')).toBe('.jpg')
    expect(getFileExtension('README')).toBe('')
    expect(getFileExtension('.env')).toBe('')
  })
})
