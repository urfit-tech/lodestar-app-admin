import { MenuClickEventHandler } from 'rc-menu/lib/interface'
import React, { useContext } from 'react'
import { renderMemberAdminLayoutProps } from '../components/layout/MemberAdminLayout'

export type CustomRendererProps = {
  renderMemberAdminLayout?: {
    content?: (props: renderMemberAdminLayoutProps) => React.ReactElement
  }
  renderAdminMenu?: (props: {
    permissions: { [key: string]: boolean }
    menuItems: {
      permissionIsAllowed: boolean
      icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
      key: string
      name: string
      subMenuItems?: {
        permissionIsAllowed: boolean
        key: string
        name: string
      }[]
    }[]
    onClick?: MenuClickEventHandler
  }) => React.ReactNode
}

const CustomRendererContext = React.createContext<CustomRendererProps>({})

export const CustomRendererProvider: React.FC<{
  renderer?: CustomRendererProps
}> = ({ children, renderer = {} }) => {
  return <CustomRendererContext.Provider value={renderer}>{children}</CustomRendererContext.Provider>
}

export const useCustomRenderer = () => useContext(CustomRendererContext)
