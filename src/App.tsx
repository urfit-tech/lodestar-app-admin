import Icon from '@ant-design/icons'
import { Menu } from 'antd'
import Application from 'lodestar-app-admin/src/Application'
import { StyledMenu } from 'lodestar-app-admin/src/components/admin/AdminMenu'
import { isEmpty } from 'ramda'
import React from 'react'
import './App.scss'
import { ReactComponent as UserCopyIcon } from './images/icons/user-copy.svg'
import MemberCollectionAdminPage from './pages/MemberCollectionAdminPage'
import MemberContractPage from './pages/MemberContractPage'
import MemberNoteAdminPage from './pages/MemberNoteAdminPage'
import TermsPtPage from './pages/TermsPtPage'

const App = () => {
  return (
    <Application
      appId="xuemi"
      customRender={{
        renderAdminMenu: ({ menuItems, handleClick: onClick }) => {
          return (
            <StyledMenu
              mode="inline"
              defaultOpenKeys={menuItems.filter(v => !isEmpty(v.subMenuItems)).map(v => v.key)}
              onClick={onClick}
            >
              {[
                ...menuItems.slice(0, 14),
                {
                  permissionIsAllowed: true,
                  key: 'member_contract_collection',
                  icon: () => <UserCopyIcon />,
                  name: '合約資料管理',
                  subMenuItems: undefined,
                },
                ...menuItems.slice(15),
              ]
                .filter(v => v.permissionIsAllowed)
                .map(v => {
                  if (v.subMenuItems) {
                    return (
                      <Menu.SubMenu
                        key={v.key}
                        title={
                          <span>
                            <Icon component={v.icon} />
                            <span>{v.name}</span>
                          </span>
                        }
                      >
                        {v.subMenuItems
                          .filter(w => w.permissionIsAllowed)
                          .map(w => (
                            <Menu.Item key={w.key}>{w.name}</Menu.Item>
                          ))}
                      </Menu.SubMenu>
                    )
                  }
                  return (
                    <Menu.Item key={v.key}>
                      <Icon component={v.icon} />
                      <span>{v.name}</span>
                    </Menu.Item>
                  )
                })}
            </StyledMenu>
          )
        },
      }}
      extraRouteProps={{
        owner_members: {
          path: '/admin/members',
          pageName: <MemberCollectionAdminPage />,
          authenticated: true,
        },
        owner_member_note: {
          path: '/admin/members/:memberId/note',
          pageName: <MemberNoteAdminPage />,
          authenticated: true,
        },
        member_contract_collection: {
          path: '/member-contracts',
          pageName: <MemberContractPage />,
          authenticated: true,
        },
        terms: {
          path: '/terms',
          pageName: <TermsPtPage />,
          authenticated: false,
        },
      }}
    />
  )
}

export default App
