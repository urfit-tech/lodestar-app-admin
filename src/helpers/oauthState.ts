// OAuth state helpers for the admin social login buttons.
// The admin only emits the nonce (state + __Host- cookie); the storefront /oauth2 page reads it.
// Cookie contract: ./oauthNonce.fixture.json (shared with the storefronts and the xuemi questionnaire).

export const OAUTH_STATE_NONCE_COOKIE = '__Host-oauth_state_nonce'
export const OAUTH_STATE_NONCE_MAX_AGE_SECONDS = 600
export const OAUTH_STATE_NONCE_MAX_ENTRIES = 5
const OAUTH_STATE_NONCE_SEPARATOR = '.'
const NONCE_FORMAT = /^[0-9a-f]{32}$/

const bytesToBinaryString = (bytes: Uint8Array): string => {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return binary
}

/** base64 of the UTF-8 bytes of JSON.stringify(obj); equals btoa(JSON.stringify(obj)) for ASCII content. */
export const encodeOauthState = (obj: Record<string, unknown>): string =>
  btoa(bytesToBinaryString(new TextEncoder().encode(JSON.stringify(obj))))

let pageNonce: string | null | undefined

const getPageNonce = (): string | null => {
  if (pageNonce !== undefined) {
    return pageNonce
  }
  try {
    const cryptoObject = typeof window !== 'undefined' ? window.crypto : undefined
    if (!cryptoObject || typeof cryptoObject.getRandomValues !== 'function') {
      pageNonce = null
      return pageNonce
    }
    const bytes = new Uint8Array(16)
    cryptoObject.getRandomValues(bytes)
    let hex = ''
    for (let i = 0; i < bytes.length; i++) {
      hex += (bytes[i] < 16 ? '0' : '') + bytes[i].toString(16)
    }
    pageNonce = hex
  } catch {
    pageNonce = null
  }
  return pageNonce
}

/** Encodes the OAuth state payload with this page's nonce attached (payload unchanged when crypto is unavailable). */
export const createOauthState = (payload: Record<string, unknown>): string => {
  const nonce = getPageNonce()
  return encodeOauthState(nonce ? { ...payload, nonce } : payload)
}

/**
 * Returns the cookie value after adding `nonce`: newest first, an existing equal entry removed,
 * malformed entries dropped, at most OAUTH_STATE_NONCE_MAX_ENTRIES kept.
 */
export const appendOauthNonce = (existing: string | null | undefined, nonce: string): string => {
  const kept = (existing || '')
    .split(OAUTH_STATE_NONCE_SEPARATOR)
    .filter(entry => NONCE_FORMAT.test(entry) && entry !== nonce)
  const entries: string[] = []
  for (let i = 0; i < kept.length; i++) {
    if (entries.indexOf(kept[i]) === -1) {
      entries.push(kept[i])
    }
  }
  return [nonce].concat(entries).slice(0, OAUTH_STATE_NONCE_MAX_ENTRIES).join(OAUTH_STATE_NONCE_SEPARATOR)
}

const readOauthNonceCookie = (): string | null => {
  const prefix = `${OAUTH_STATE_NONCE_COOKIE}=`
  const cookies = document.cookie ? document.cookie.split(';') : []
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim()
    if (cookie.indexOf(prefix) === 0) {
      const raw = cookie.slice(prefix.length)
      try {
        return decodeURIComponent(raw)
      } catch {
        return raw
      }
    }
  }
  return null
}

/** Adds this page's nonce to the host-only __Host- cookie list (https only); every write refreshes Max-Age. */
export const rememberOauthNonce = (): void => {
  const nonce = getPageNonce()
  if (!nonce || window.location.protocol !== 'https:') {
    return
  }
  try {
    const value = appendOauthNonce(readOauthNonceCookie(), nonce)
    document.cookie = `${OAUTH_STATE_NONCE_COOKIE}=${value}; Path=/; Max-Age=${OAUTH_STATE_NONCE_MAX_AGE_SECONDS}; Secure; SameSite=Lax`
  } catch {
    // cookies unavailable (e.g. blocked); the login flow does not depend on it yet
  }
}
