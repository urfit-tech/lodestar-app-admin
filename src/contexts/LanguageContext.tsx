import moment from 'moment'
import 'moment/locale/zh-tw'
import React, { createContext, useState } from 'react'
import { IntlProvider } from 'react-intl'
import { useApp } from './AppContext'

const supportedLanguages = ['zh', 'en', 'vi']

type LanguageProps = {
  currentLanguage: string
  setCurrentLanguage?: (language: string) => void
}
const defaultLanguage: LanguageProps = {
  currentLanguage: 'zh',
}

const LanguageContext = createContext<LanguageProps>(defaultLanguage)

export const LanguageProvider: React.FC = ({ children }) => {
  const { enabledModules } = useApp()

  const browserLanguage = navigator.language.split('-')[0]
  const cachedLanguage = localStorage.getItem('kolable.app.language')
  const [currentLanguage, setCurrentLanguage] = useState(
    typeof cachedLanguage === 'string' && supportedLanguages.includes(cachedLanguage)
      ? cachedLanguage
      : supportedLanguages.includes(browserLanguage)
      ? browserLanguage
      : 'zh',
  )

  moment.locale(currentLanguage)

  let messages: any = {}
  try {
    if (enabledModules.locale) {
      messages = require(`../translations/locales/${currentLanguage}.json`)
    }
  } catch {}

  const language: LanguageProps = {
    currentLanguage,
    setCurrentLanguage: (language: string) => {
      if (supportedLanguages.includes(language)) {
        localStorage.setItem('kolable.app.language', language)

        setCurrentLanguage(language)

        switch (language) {
          case 'zh':
            moment.locale('zh-tw')
            break
          default:
            moment.locale(language)
        }
      }
    },
  }

  return (
    <LanguageContext.Provider value={language}>
      <IntlProvider
        defaultLocale="zh"
        locale={currentLanguage}
        messages={messages}
        onError={error => process.env.VERBOSE && console.error(error)}
      >
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  )
}

export default LanguageContext
