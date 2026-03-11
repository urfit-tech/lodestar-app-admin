import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import AnnouncementModal from './components/announcement/AnnouncementModal'

const pageModules = import.meta.glob<{ default: React.ComponentType }>('./pages/**/*.{ts,tsx,js,jsx}')
const pageComponentCache = new Map<string, React.LazyExoticComponent<React.ComponentType>>()

const resolvePageImporter = (pageName: string) => {
  const candidates = [
    `./pages/${pageName}.tsx`,
    `./pages/${pageName}.ts`,
    `./pages/${pageName}.jsx`,
    `./pages/${pageName}.js`,
    `./pages/${pageName}/index.tsx`,
    `./pages/${pageName}/index.ts`,
    `./pages/${pageName}/index.jsx`,
    `./pages/${pageName}/index.js`,
  ]

  const importer = candidates.map(candidate => pageModules[candidate]).find(Boolean)

  if (!importer) {
    throw new Error(`Unknown page module: ${pageName}`)
  }

  return importer
}

const getPageComponent = (pageName: string) => {
  const cachedComponent = pageComponentCache.get(pageName)
  if (cachedComponent) {
    return cachedComponent
  }

  const pageComponent = React.lazy(async () => {
    const pageModule = await resolvePageImporter(pageName)()
    return { default: pageModule.default }
  })

  pageComponentCache.set(pageName, pageComponent)
  return pageComponent
}

const LoadablePage: React.VFC<{ pageName: string }> = ({ pageName }) => {
  const { enabledModules } = useApp()
  const PageComponent = getPageComponent(pageName)

  return (
    <>
      <PageComponent />
      {enabledModules.announcement && <AnnouncementModal />}
    </>
  )
}

export default LoadablePage
