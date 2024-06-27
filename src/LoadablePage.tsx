import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import AnnouncementModal from './components/announcement/AnnouncementModal'

const LoadablePage: React.VFC<{ pageName: string }> = ({ pageName }) => {
  const { enabledModules } = useApp()
  const PageComponent = React.lazy(() => import(`./pages/${pageName}`))
  return (
    <>
      <PageComponent />
      {enabledModules.announcement && <AnnouncementModal />}
    </>
  )
}

export default LoadablePage
