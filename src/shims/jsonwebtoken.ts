type JwtPayload = Record<string, unknown> | null

const decodeBase64Url = (input: string) => {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
  const binary = atob(padded)

  return decodeURIComponent(
    Array.from(binary)
      .map(char => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  )
}

const decode = (token?: string): JwtPayload => {
  if (!token) {
    return null
  }

  const [, payload] = token.split('.')
  if (!payload) {
    return null
  }

  try {
    return JSON.parse(decodeBase64Url(payload)) as JwtPayload
  } catch {
    return null
  }
}

export default { decode }
