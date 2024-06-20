import React from 'react'
import AnnouncementModal from './components/announcement/AnnouncementModal'

const LoadablePage: React.VFC<{ pageName: string }> = ({ pageName }) => {
  const PageComponent = React.lazy(() => import(`./pages/${pageName}`))
  return (
    <>
      <PageComponent />
      <AnnouncementModal />
    </>
  )
}

export default LoadablePage
