import { defaultLocaleMessages, getLocaleMessages } from './localeMessages'

describe('getLocaleMessages', () => {
  it('returns locale-specific messages when the locale file exists', () => {
    const zhTwMessages = getLocaleMessages('zh-tw')

    expect(zhTwMessages).not.toBe(defaultLocaleMessages)
    expect(zhTwMessages['common.ui.save']).toBeDefined()
  })

  it('falls back to default locale messages when the locale file does not exist', () => {
    expect(getLocaleMessages('does-not-exist')).toBe(defaultLocaleMessages)
  })
})
