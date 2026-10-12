import * as nodeCrypto from 'crypto'
import { TextDecoder as NodeTextDecoder, TextEncoder as NodeTextEncoder } from 'util'
import fixture from './oauthNonce.fixture.json'

// jsdom (jest 26) does not provide TextEncoder/TextDecoder or window.crypto
const globalObject = global as any
if (typeof globalObject.TextEncoder === 'undefined') {
  globalObject.TextEncoder = NodeTextEncoder
}
if (typeof globalObject.TextDecoder === 'undefined') {
  globalObject.TextDecoder = NodeTextDecoder
}
// a controllable stand-in so the "crypto unavailable" path can be exercised
const cryptoStub: { getRandomValues?: (array: Uint8Array) => Uint8Array } = {
  getRandomValues: array => (nodeCrypto as any).webcrypto.getRandomValues(array),
}
Object.defineProperty(window, 'crypto', { configurable: true, value: cryptoStub })

type OauthStateModule = typeof import('./oauthState')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  OAUTH_STATE_NONCE_COOKIE,
  OAUTH_STATE_NONCE_MAX_AGE_SECONDS,
  OAUTH_STATE_NONCE_MAX_ENTRIES,
  appendOauthNonce,
  createOauthState,
  encodeOauthState,
  rememberOauthNonce,
} = require('./oauthState') as OauthStateModule

// The storefront /oauth2 decoder rules: optional URI decoding, base64, UTF-8, JSON object.
const decodeLikeStorefront = (raw: string): Record<string, unknown> | null => {
  let value = raw
  try {
    value = decodeURIComponent(raw)
  } catch {
    value = raw
  }
  let binary: string
  try {
    binary = atob(value)
  } catch {
    return null
  }
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  let json = binary
  try {
    json = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    json = binary
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch {
    return null
  }
  return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
    ? (parsed as Record<string, unknown>)
    : null
}

describe('cookie contract constants', () => {
  it('match the shared fixture', () => {
    expect(OAUTH_STATE_NONCE_COOKIE).toBe(fixture.cookie.name)
    expect(OAUTH_STATE_NONCE_MAX_AGE_SECONDS).toBe(fixture.cookie.attributes.maxAgeSeconds)
    expect(OAUTH_STATE_NONCE_MAX_ENTRIES).toBe(fixture.maxEntries)
  })
})

describe('appendOauthNonce', () => {
  it.each(fixture.appendExamples.map(example => [example.before, example.add, example.after]))(
    'appends to %p',
    (before: string | null, add: string, after: string) => {
      expect(appendOauthNonce(before, add)).toBe(after)
      expect(after).toMatch(new RegExp(fixture.valueFormat))
    },
  )

  it('never exceeds the maximum number of entries', () => {
    let value: string | null = null
    for (let i = 0; i < 10; i++) {
      value = appendOauthNonce(value, i.toString(16).repeat(32))
    }
    expect(value!.split(fixture.separator)).toHaveLength(fixture.maxEntries)
    expect(value).toMatch(new RegExp(fixture.valueFormat))
  })
})

describe('createOauthState', () => {
  it('round-trips through the storefront decoder with a 32-hex nonce that stays the same within the page load', () => {
    const payload = { provider: 'google', redirect: '/admin/x?a=1', accountLinkToken: 'token' }
    const first = decodeLikeStorefront(createOauthState(payload))
    const second = decodeLikeStorefront(createOauthState({ provider: 'line', redirect: '/admin' }))
    expect(first).toMatchObject(payload)
    expect(first?.nonce).toMatch(new RegExp(fixture.nonceFormat))
    expect(second?.nonce).toBe(first?.nonce)
  })

  it('round-trips UTF-8 content', () => {
    const payload = { provider: 'line', redirect: '/admin/課程?標籤=測試', accountLinkToken: '' }
    expect(decodeLikeStorefront(createOauthState(payload))).toMatchObject(payload)
  })

  it('encodes ASCII content exactly like btoa(JSON.stringify(...))', () => {
    const state = { provider: 'facebook', redirect: '/admin?q=1', accountLinkToken: 'abc' }
    expect(encodeOauthState(state)).toBe(btoa(JSON.stringify(state)))
  })
})

describe('rememberOauthNonce', () => {
  const originalLocation = window.location
  let jar: string | null
  let writes: string[]

  beforeEach(() => {
    jar = null
    writes = []
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: () => (jar === null ? 'other=1' : `other=1; ${OAUTH_STATE_NONCE_COOKIE}=${jar}`),
      set: (value: string) => {
        writes.push(value)
        const pair = value.split('; ')[0]
        jar = pair.slice(pair.indexOf('=') + 1)
      },
    })
  })

  afterEach(() => {
    delete (document as any).cookie
    delete (window as any).location
    ;(window as any).location = originalLocation
  })

  const setProtocol = (protocol: string) => {
    delete (window as any).location
    ;(window as any).location = { ...originalLocation, protocol, origin: `${protocol}//example.test` }
  }

  const pageNonce = () => decodeLikeStorefront(createOauthState({}))?.nonce as string

  it('writes a host-only __Host- cookie with the contract attributes on https', () => {
    setProtocol('https:')
    rememberOauthNonce()
    expect(writes).toHaveLength(1)
    const parts = writes[0].split('; ')
    expect(parts[0]).toBe(`${fixture.cookie.name}=${pageNonce()}`)
    const attributes = parts.slice(1).map(part => part.toLowerCase())
    expect(attributes).toContain('path=/')
    expect(attributes).toContain('secure')
    expect(attributes).toContain('samesite=lax')
    expect(attributes).toContain(`max-age=${fixture.cookie.attributes.maxAgeSeconds}`)
    expect(attributes.some(attribute => attribute.startsWith('domain'))).toBe(false)
  })

  it('prepends the page nonce to an existing list and refreshes it on every write', () => {
    setProtocol('https:')
    jar = 'not-hex.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    rememberOauthNonce()
    expect(jar).toBe(`${pageNonce()}.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`)
    rememberOauthNonce()
    expect(writes).toHaveLength(2)
    expect(jar).toBe(`${pageNonce()}.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`)
  })

  it('does not write the cookie on http', () => {
    setProtocol('http:')
    rememberOauthNonce()
    expect(writes).toHaveLength(0)
  })
})

describe('without crypto.getRandomValues', () => {
  it('returns the payload unchanged', () => {
    const getRandomValues = cryptoStub.getRandomValues
    cryptoStub.getRandomValues = undefined
    try {
      jest.resetModules()
      const fresh = require('./oauthState') as OauthStateModule
      expect(fresh.createOauthState).not.toBe(createOauthState)
      const payload = { provider: 'google', redirect: '/admin', accountLinkToken: '' }
      expect(fresh.createOauthState(payload)).toBe(btoa(JSON.stringify(payload)))
    } finally {
      cryptoStub.getRandomValues = getRandomValues
    }
  })
})
