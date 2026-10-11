import * as nodeCrypto from 'crypto'
import React from 'react'
import { render, unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'
import { TextEncoder as NodeTextEncoder } from 'util'

// jsdom (jest 26) does not provide TextEncoder or window.crypto
const globalObject = global as any
if (typeof globalObject.TextEncoder === 'undefined') {
  globalObject.TextEncoder = NodeTextEncoder
}
Object.defineProperty(window, 'crypto', {
  configurable: true,
  value: { getRandomValues: (array: Uint8Array) => (nodeCrypto as any).webcrypto.getRandomValues(array) },
})

jest.mock('lodestar-app-element/src/contexts/AppContext', () => ({
  useApp: () => ({
    loading: false,
    settings: {
      'auth.facebook_app_id': 'fb-id',
      'auth.google_client_id': 'google-id',
      'auth.line_client_id': 'line-id',
      'auth.parenting.client_id': 'parenting-id',
    },
  }),
}))
jest.mock('react-intl', () => ({
  ...jest.requireActual('react-intl'),
  useIntl: () => ({ formatMessage: () => 'login' }),
}))
jest.mock('use-query-params', () => ({
  StringParam: {},
  useQueryParam: () => [undefined],
}))

type SocialLoginButtonModule = typeof import('./SocialLoginButton')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { FacebookLoginButton, GoogleLoginButton, LineLoginButton, ParentingLoginButton } =
  require('./SocialLoginButton') as SocialLoginButtonModule

const NONCE_COOKIE = '__Host-oauth_state_nonce'

describe('social login buttons', () => {
  const originalLocation = window.location
  let container: HTMLDivElement
  let jar: string | null
  let writes: string[]

  beforeEach(() => {
    jar = null
    writes = []
    Object.defineProperty(document, 'cookie', {
      configurable: true,
      get: () => (jar === null ? '' : `${NONCE_COOKIE}=${jar}`),
      set: (value: string) => {
        writes.push(value)
        const pair = value.split('; ')[0]
        jar = pair.slice(pair.indexOf('=') + 1)
      },
    })
    delete (window as any).location
    ;(window as any).location = {
      ...originalLocation,
      protocol: 'https:',
      origin: 'https://example.test',
      pathname: '/admin',
      search: '?tab=1',
      assign: jest.fn(),
    }
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    act(() => {
      unmountComponentAtNode(container)
    })
    container.remove()
    delete (document as any).cookie
    delete (window as any).location
    ;(window as any).location = originalLocation
  })

  it.each([
    ['facebook', FacebookLoginButton],
    ['google', GoogleLoginButton],
    ['line', LineLoginButton],
    ['parenting', ParentingLoginButton],
  ])('%s: remembers the page nonce on mount and on click, and puts it in the state', (provider, Component) => {
    act(() => {
      render(<Component accountLinkToken="link-token" />, container)
    })
    expect(writes).toHaveLength(1)
    expect(writes[0].split('; ')[0]).toMatch(new RegExp(`^${NONCE_COOKIE}=[0-9a-f]{32}$`))
    const nonce = jar

    const anchor = container.querySelector('a') as HTMLAnchorElement
    const state = /[?&]state=([^&]*)/.exec(anchor.getAttribute('href') as string)![1]
    expect(JSON.parse(atob(state))).toEqual({
      provider,
      redirect: '/admin?tab=1',
      accountLinkToken: 'link-token',
      nonce,
    })

    anchor.addEventListener('click', event => event.preventDefault())
    act(() => {
      anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }))
    })
    expect(writes).toHaveLength(2)
    expect(jar).toBe(nonce)
  })
})
