import Icon from '@ant-design/icons'
import { Menu } from 'antd'
import Application from 'lodestar-app-admin/src/Application'
import { StyledMenu } from 'lodestar-app-admin/src/components/admin/AdminMenu'
import { ReactComponent as PhoneIcon } from 'lodestar-app-admin/src/images/icon/phone.svg'
import { isEmpty } from 'ramda'
import React from 'react'
import './App.scss'
import { ReactComponent as UserCopyIcon } from './images/icons/user-copy.svg'
import MemberCollectionAdminPage from './pages/MemberCollectionAdminPage'
import MemberContractPage from './pages/MemberContractPage'
import MemberNoteAdminPage from './pages/MemberNoteAdminPage'
import SalesCallPage from './pages/SalesCallPage'
import TermsPtPage from './pages/TermsPtPage'

const App: React.FC = () => {
  return (
    <Application
      appId="xuemi"
      customRender={{
        renderAdminMenu: ({ permissions, menuItems, onClick }) => {
          const customMenuItems = [
            ...menuItems.slice(0, 14),
            {
              permissionIsAllowed: true,
              key: 'member_contract_collection',
              icon: () => <UserCopyIcon />,
              name: '合約資料管理',
            },
            {
              permissionIsAllowed: !!permissions.SALES_CALL_ADMIN,
              key: 'sales_call_admin',
              icon: () => <PhoneIcon />,
              name: '業務專區',
              subMenuItems: [
                {
                  permissionIsAllowed: true,
                  key: 'sales_call',
                  name: '業務撥打',
                },
              ],
            },
            ...menuItems.slice(14),
          ]
          return (
            <StyledMenu
              mode="inline"
              defaultOpenKeys={customMenuItems.filter(v => !isEmpty(v.subMenuItems)).map(v => v.key)}
              onClick={onClick}
            >
              {customMenuItems
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
        sales_call: {
          path: '/sales-call',
          pageName: <SalesCallPage />,
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
