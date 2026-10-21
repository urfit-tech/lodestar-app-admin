import { CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js'

// country_code is an ISO region (TW/US), not the international calling prefix.
export const normalizeMemberPhone = (value: string, country: CountryCode) => {
  const input = value.trim()
  const parsed = /^[+\d\s().-]+$/.test(input)
    ? parsePhoneNumberFromString(input, { defaultCountry: country, extract: false })
    : undefined
  if (!parsed?.country || !parsed.isValid() || parsed.ext) {
    throw new Error('請輸入有效電話，並選擇正確的國家／地區；國際電話請以 +國碼 開頭。')
  }
  return {
    phone: parsed.formatNational().replace(/\D/g, ''),
    country_code: parsed.country,
    international_phone: parsed.number,
  }
}
