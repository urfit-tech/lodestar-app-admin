import defaultLocaleMessages from '../translations/locales/en-us.json'

type LocaleMessages = Record<string, string>
type LocaleMessageModule = LocaleMessages | { default: LocaleMessages }

const localeMessageModules = import.meta.glob<LocaleMessageModule>('../translations/locales/*.json', {
  eager: true,
})

const getLocaleModuleMessages = (module: LocaleMessageModule | undefined): LocaleMessages => {
  if (!module) {
    return defaultLocaleMessages
  }

  return 'default' in module ? module.default : module
}

export const getLocaleMessages = (locale: string): LocaleMessages => {
  const module = localeMessageModules[`../translations/locales/${locale}.json`]
  return getLocaleModuleMessages(module)
}

export { defaultLocaleMessages }
