import React from 'react'
import { ThemeProvider } from 'styled-components'
import { useApp } from '../contexts/AppContext'
import '../styles/default/index.scss'
import defaultThemeVars from '../theme/default.json'

export const AppThemeProvider: React.FC = ({ children }) => {
  const { settings } = useApp()

  const themeVars = Object.keys(settings)
    .filter(key => key.split('.')[0] === 'theme')
    .map(key => key.split('.')[1])
    .reduce((vars: { [key: string]: string }, themeKey: string) => {
      vars[themeKey] = settings[`theme.${themeKey}`]
      return vars
    }, defaultThemeVars)

  return <ThemeProvider theme={themeVars}>{children}</ThemeProvider>
}
