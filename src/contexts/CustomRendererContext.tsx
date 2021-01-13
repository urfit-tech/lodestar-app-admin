import React, { useContext } from 'react'
import { renderMemberAdminLayoutProps } from '../components/layout/MemberAdminLayout'

export type CustomRendererProps = {
  renderMemberAdminLayout?: (props: renderMemberAdminLayoutProps) => React.ReactElement
}

const CustomRendererContext = React.createContext<CustomRendererProps>({})

export const CustomRendererProvider: React.FC<{
  renderer?: CustomRendererProps
}> = ({ children, renderer = {} }) => {
  return <CustomRendererContext.Provider value={renderer}>{children}</CustomRendererContext.Provider>
}

export const useCustomRenderer = () => useContext(CustomRendererContext)
