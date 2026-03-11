const normalizeBasePath = (value: string) => {
  const normalized = `/${value.trim().replace(/^\/+|\/+$/g, '')}/`.replace(/\/+/g, '/')
  return normalized === '//' ? '/' : normalized
}

export const getRouterBasename = (basePath = import.meta.env.BASE_URL) => {
  const normalized = normalizeBasePath(basePath)
  return normalized === '/' ? '/' : normalized.replace(/\/$/, '')
}

export const createPathWithBase = (path: string, basePath = import.meta.env.BASE_URL) => {
  const normalizedBasePath = getRouterBasename(basePath)
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return normalizedBasePath === '/' ? normalizedPath : `${normalizedBasePath}${normalizedPath}`
}

export const stripBasePath = (pathname: string, basePath = import.meta.env.BASE_URL) => {
  const normalizedBasePath = getRouterBasename(basePath)
  if (normalizedBasePath === '/' || !pathname.startsWith(normalizedBasePath)) {
    return pathname || '/'
  }

  const strippedPath = pathname.slice(normalizedBasePath.length)
  return strippedPath.length > 0 ? strippedPath : '/'
}
