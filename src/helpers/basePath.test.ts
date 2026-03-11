import { describe, expect, it } from 'vitest'
import { createPathWithBase, getRouterBasename, stripBasePath } from './basePath'

describe('basePath helpers', () => {
  it('normalizes a vite base path for react-router basename', () => {
    expect(getRouterBasename('/admin/')).toBe('/admin')
    expect(getRouterBasename('/')).toBe('/')
    expect(getRouterBasename('admin')).toBe('/admin')
  })

  it('prefixes absolute app paths with the configured base path', () => {
    expect(createPathWithBase('/members/1', '/admin/')).toBe('/admin/members/1')
    expect(createPathWithBase('members/1', '/admin/')).toBe('/admin/members/1')
    expect(createPathWithBase('/members/1', '/')).toBe('/members/1')
  })

  it('strips the configured base path from browser locations', () => {
    expect(stripBasePath('/admin/members/1', '/admin/')).toBe('/members/1')
    expect(stripBasePath('/members/1', '/admin/')).toBe('/members/1')
    expect(stripBasePath('/admin', '/admin/')).toBe('/')
  })
})
