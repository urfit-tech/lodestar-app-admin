import { Icon, Menu, Tag } from 'antd'
import { ClickParam, MenuProps } from 'antd/lib/menu'
import React, { useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
import useRouter from 'use-react-router'
import AppContext from '../../containers/common/AppContext'
import { ReactComponent as CalendarAltOIcon } from '../../images/icon/calendar-alt-o.svg'
import { ReactComponent as CalendarAltIcon } from '../../images/icon/calendar-alt.svg'
import { ReactComponent as MicrophoneIcon } from '../../images/icon/microphone.svg'
import { routesProps } from '../../Routes'
import settings from '../../settings'

const StyledMenu = styled(Menu)`
  && {
    border-right: none;
  }
`

const AdminMenu: React.FC<MenuProps> = ({ children, ...menuProps }) => {
  const { history } = useRouter()
  const handleClick = ({ key, item }: ClickParam) => {
    if (key.startsWith('_blank')) {
      window.open(item.props['data-href'])
    } else {
      const route = routesProps[key]
      route ? history.push(route.path) : alert('無此路徑')
    }
  }

  return (
    <StyledMenu {...menuProps} mode="inline" onClick={handleClick}>
      {children}
    </StyledMenu>
  )
}

export const OwnerAdminMenu = (props: MenuProps) => {
  const theme = useContext(ThemeContext)
  const { enabledModules } = useContext(AppContext)

  return (
    <div className="d-flex flex-column flex-grow-1">
      <div className="p-3">
        <Tag color={theme['@primary-color']} style={{ border: '0px' }}>
          管理者
        </Tag>
      </div>

      <AdminMenu
        {...props}
        defaultOpenKeys={['owner_promotion_admin', 'owner_podcast_admin', 'owner_appointment_admin']}
      >
        <Menu.Item key="owner_sales_admin">
          <Icon type="dollar" className="mr-2" />
          <span>銷售管理</span>
        </Menu.Item>

        <Menu.SubMenu
          key="owner_promotion_admin"
          title={
            <span>
              <Icon type="shopping" />
              <span>促銷管理</span>
            </span>
          }
        >
          <Menu.Item key="owner_coupon_plans_admin">
            <span>折價方案</span>
          </Menu.Item>
          {enabledModules.voucher && (
            <Menu.Item key="owner_voucher_plans_admin">
              <span>兌換方案</span>
            </Menu.Item>
          )}
        </Menu.SubMenu>

        {enabledModules.podcast && (
          <Menu.SubMenu
            key="owner_podcast_admin"
            title={
              <span>
                <Icon component={() => <MicrophoneIcon />} />
                <span>音頻廣播</span>
              </span>
            }
          >
            <Menu.Item key="owner_podcast_program_collection_admin">
              <span>廣播管理</span>
            </Menu.Item>
            <Menu.Item key="owner_podcast_plan_admin">
              <span>訂閱方案</span>
            </Menu.Item>
          </Menu.SubMenu>
        )}

        {enabledModules.appointment && (
          <Menu.SubMenu
            key="owner_appointment_admin"
            title={
              <span>
                <Icon component={() => <CalendarAltOIcon />} />
                <span>預約服務</span>
              </span>
            }
          >
            <Menu.Item key="owner_appointment_plan_collection_admin">
              <span>預約方案</span>
            </Menu.Item>
            <Menu.Item key="owner_appointment_period_collection_admin">
              <span>預約紀錄</span>
            </Menu.Item>
          </Menu.SubMenu>
        )}

        <Menu.Item key="owner_program_general_admin">
          <Icon type="book" className="mr-2" />
          <span>分類設定</span>
        </Menu.Item>
        <Menu.Item key="owner_members_admin">
          <Icon type="user" className="mr-2" />
          <span>會員管理</span>
        </Menu.Item>
      </AdminMenu>
    </div>
  )
}

export const CreatorAdminMenu = (props: MenuProps) => {
  const theme = useContext(ThemeContext)
  const { enabledModules } = useContext(AppContext)

  return (
    <div className="d-flex flex-column flex-grow-1">
      <div className="p-3">
        <Tag color={theme['@primary-color']} style={{ border: '0px' }}>
          創作者
        </Tag>
      </div>

      <AdminMenu {...props} defaultOpenKeys={['creator_programs_admin', 'creator_activities_admin']}>
        <Menu.Item key="creator_sales_admin">
          <Icon type="pay-circle" />
          <span>銷售管理</span>
        </Menu.Item>
        <Menu.SubMenu
          key="creator_programs_admin"
          title={
            <span>
              <Icon type="shopping" />
              <span>課程</span>
            </span>
          }
        >
          <Menu.Item key="creator_programs_admin">課程內容</Menu.Item>
          <Menu.Item key="creator_program_issues_admin">課程問題</Menu.Item>
        </Menu.SubMenu>

        {enabledModules.activity && (
          <Menu.SubMenu
            key="creator_activities_admin"
            title={
              <span>
                <Icon component={() => <CalendarAltIcon />} />
                <span>線下實體</span>
              </span>
            }
          >
            <Menu.Item key="creator_activities_admin">線下實體管理</Menu.Item>
          </Menu.SubMenu>
        )}
        <Menu.Item key="_blank" data-href={settings.customerSupportLink}>
          <div>
            <Icon type="message" />
            <span>客服留言</span>
          </div>
        </Menu.Item>
      </AdminMenu>
    </div>
  )
}
