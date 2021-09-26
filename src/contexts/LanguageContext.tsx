import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import moment from 'moment'
import 'moment/locale/zh-tw'
import React, { createContext, useEffect, useState } from 'react'
import { IntlProvider } from 'react-intl'
import hasura from '../hasura'

type LanguageProps = {
  locale: string
  currentLanguage: string
  setCurrentLanguage?: (language: string) => void
}
const defaultLanguage: LanguageProps = {
  locale: 'zh',
  currentLanguage: 'zh',
}

const LanguageContext = createContext<LanguageProps>(defaultLanguage)

export const LanguageProvider: React.FC = ({ children }) => {
  const { enabledModules, settings } = useApp()
  const [currentLanguage, setCurrentLanguage] = useState('zh')
  const [locale, setLocale] = useState('zh')
  moment.locale('zh-tw')

  const { data } = useQuery<hasura.GET_LOCALES>(
    gql`
      query GET_LOCALES {
        locale {
          key
          ${currentLanguage.replaceAll('-', '_')}
        }
      }
    `,
  )
  const localeMessages =
    data?.locale.reduce((accum, v) => {
      accum[v.key] = (v as any)[currentLanguage.replaceAll('-', '_')]
      return accum
    }, {} as { [key: string]: string }) || {}

  useEffect(() => {
    const browserLanguage = settings['language'] || navigator.language.split('-')[0]
    const cachedLanguage = localStorage.getItem('kolable.app.language')
    if (enabledModules.locale) {
      if (cachedLanguage && locales[cachedLanguage]) {
        setCurrentLanguage(cachedLanguage)
      } else if (browserLanguage && locales[browserLanguage]) {
        setCurrentLanguage(browserLanguage)
      } else {
        setCurrentLanguage('zh')
      }
    } else {
      setCurrentLanguage('zh')
    }
  }, [enabledModules, settings])

  useEffect(() => {
    switch (currentLanguage) {
      case 'zh':
      case 'zh-acsi':
        setLocale('zh')
        moment.locale('zh-tw')
        break
      default:
        setLocale(currentLanguage)
        moment.locale(currentLanguage)
    }
  }, [currentLanguage])

  return (
    <LanguageContext.Provider
      value={{
        locale,
        currentLanguage,
        setCurrentLanguage: (newLanguage: string) => {
          if (locales[currentLanguage]) {
            localStorage.setItem('kolable.app.language', newLanguage)
            setCurrentLanguage(newLanguage)
          }
        },
      }}
    >
      <IntlProvider defaultLocale="zh" locale={locale} messages={localeMessages}>
        {children}
      </IntlProvider>
    </LanguageContext.Provider>
  )
}

export default LanguageContext
