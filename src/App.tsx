import Icon, { BarChartOutlined } from '@ant-design/icons'
import { Menu } from 'antd'
import Application from 'lodestar-app-admin/src/Application'
import { StyledMenu } from 'lodestar-app-admin/src/components/admin/AdminMenu'
import { ReactComponent as PhoneIcon } from 'lodestar-app-admin/src/images/icon/phone.svg'
import { isEmpty } from 'ramda'
import React from 'react'
import './App.scss'
import { ReactComponent as UserCopyIcon } from './images/icons/user-copy.svg'
import ChaileaseLookupPage from './pages/ChaileaseLookupPage/index'
import CustomScriptsPage from './pages/CustomScriptsPage'
import MemberCollectionAdminPage from './pages/MemberCollectionAdminPage'
import MemberContractCollectionPage from './pages/MemberContractCollectionPage'
import MemberContractCreationPage from './pages/MemberContractCreationPage'
import NoteCollectionPage from './pages/NoteCollectionPage'
import SalesActivenessPage from './pages/SalesActivenessPage'
import SalesCallPage from './pages/SalesCallPage'
import SalesMaterialsPage from './pages/SalesMaterialsPage'
import SalesMemberCategoryPage from './pages/SalesMemberCategoryPage'
import SalesStatusPage from './pages/SalesStatusPage'
import TermsPtPage from './pages/TermsPtPage'

const App: React.FC = () => {
  return (
    <Application
      appId="xuemi"
      customRender={{
        renderAdminMenu: ({ settings, role, permissions, menuItems, onClick }) => {
          const customMenuItems: typeof menuItems = [
            ...menuItems.slice(0, 14),
            {
              permissionIsAllowed: role !== 'content-creator',
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
                {
                  permissionIsAllowed: true,
                  key: 'sales_status',
                  name: '業務狀況',
                },
                {
                  permissionIsAllowed: settings['feature.chailease_lookup'] === 'enabled',
                  key: 'chailease_lookup',
                  name: '資融查詢',
                },
              ],
            },
            {
              permissionIsAllowed: role === 'app-owner',
              key: 'analytics',
              icon: () => <BarChartOutlined style={{ margin: 0 }} />,
              name: '數據分析',
              subMenuItems: [
                {
                  permissionIsAllowed: true,
                  key: 'analytics_sales_materials',
                  name: '素材表現',
                },
                {
                  permissionIsAllowed: true,
                  key: 'analytics_sales_member_categories',
                  name: '業務表現',
                },
                {
                  permissionIsAllowed: true,
                  key: 'analytics_sales_activeness',
                  name: '活動量',
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
        member_contract_collection: {
          path: '/member-contracts',
          pageName: <MemberContractCollectionPage />,
          authenticated: true,
        },
        note_collection: {
          path: '/notes',
          pageName: <NoteCollectionPage />,
          authenticated: true,
        },
        sales_call: {
          path: '/sales-call',
          pageName: <SalesCallPage />,
          authenticated: true,
        },
        sales_status: {
          path: '/sales-status',
          pageName: <SalesStatusPage />,
          authenticated: true,
        },
        analytics_sales_materials: {
          path: '/analytics/sales-materials',
          pageName: <SalesMaterialsPage />,
          authenticated: true,
        },
        analytics_sales_member_categories: {
          path: '/analytics/sales-member-categories',
          pageName: <SalesMemberCategoryPage />,
          authenticated: true,
        },
        analytics_sales_activeness: {
          path: '/analytics/sales-activeness',
          pageName: <SalesActivenessPage />,
          authenticated: true,
        },
        member_contract_creation: {
          path: '/admin/members/:memberId/contracts/new',
          pageName: <MemberContractCreationPage />,
          authenticated: true,
        },
        terms: {
          path: '/terms',
          pageName: <TermsPtPage />,
          authenticated: false,
        },
        chailease_lookup: {
          path: '/chailease-lookup',
          pageName: <ChaileaseLookupPage />,
          authenticated: true,
        },
        custom_scripts: {
          path: '/custom-scripts',
          pageName: <CustomScriptsPage />,
          authenticated: true,
        },
      }}
    />
  )
}

export default App
