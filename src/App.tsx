import Icon, { BarChartOutlined } from '@ant-design/icons'
import { Menu } from 'antd'
import { isEmpty } from 'ramda'
import React from 'react'
import './App.scss'
import Application from './Application'
import { StyledMenu } from './components/admin/AdminMenu'
import { ReactComponent as PhoneIcon } from './images/icon/phone.svg'
import { ReactComponent as UserCopyIcon } from './images/icon/user-copy.svg'
import AdvertisingAudiencePage from './pages/AdvertisingAudiencePage'
import ChaileaseLookupPage from './pages/ChaileaseLookupPage/index'
import CustomScriptsPage from './pages/CustomScriptsPage'
import MemberCollectionAdminPage from './pages/MemberCollectionAdminPage'
import MemberContractCollectionPage from './pages/MemberContractCollectionPage'
import MemberContractCreationPage from './pages/MemberContractCreationPage'
import NoteCollectionPage from './pages/NoteCollectionPage'
import SalesActivenessPage from './pages/SalesActivenessPage'
import SalesMaterialsPage from './pages/SalesMaterialsPage'
import SalesMemberCategoryPage from './pages/SalesMemberCategoryPage'
import SalesStatusPage from './pages/SalesStatusPage'

const App: React.FC<{
  appId: string
}> = ({ appId }) => {
  return (
    <Application
      appId={appId}
      customRender={{
        renderAdminMenu: ({ settings, role, permissions, menuItems, onClick, enabledModules }) => {
          const customMenuItems: typeof menuItems = [
            ...menuItems.slice(0, 14),
            {
              permissionIsAllowed:
                !!enabledModules.member_contract_manager &&
                (permissions.CONTRACT_VALUE_VIEW_ADMIN || permissions.CONTRACT_VALUE_VIEW_NORMAL),
              key: 'member_contract_collection',
              icon: () => <UserCopyIcon />,
              name: '合約資料管理',
            },
            {
              permissionIsAllowed: !!enabledModules.sales_call && !!permissions.SALES_CALL_ADMIN,
              key: 'sales_call_admin',
              icon: () => <PhoneIcon />,
              name: '業務查詢',
              subMenuItems: [
                {
                  permissionIsAllowed: true,
                  key: 'sales_status',
                  name: '即時戰況查詢',
                },
                {
                  permissionIsAllowed: true,
                  key: 'chailease_lookup',
                  name: `${settings['name']}報名表查詢`,
                },
              ],
            },
            {
              permissionIsAllowed: !!enabledModules.analytics && !!permissions.ANALYSIS_ADMIN,
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
                {
                  permissionIsAllowed: true,
                  key: 'analytics_advertising_audience',
                  name: '廣告受眾',
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
          path: '/members',
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
        analytics_advertising_audience: {
          path: '/analytics/advertising-audience',
          pageName: <AdvertisingAudiencePage />,
          authenticated: true,
        },
        member_contract_creation: {
          path: '/members/:memberId/new-contract',
          pageName: <MemberContractCreationPage />,
          authenticated: true,
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
