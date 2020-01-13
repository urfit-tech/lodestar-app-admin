import { Icon, Menu } from 'antd'
import { ClickParam, MenuProps } from 'antd/lib/menu'
import React, { useContext } from 'react'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import AppContext from '../../contexts/AppContext'
import { ReactComponent as BookIcon } from '../../images/icon/book.svg'
import { ReactComponent as CalendarAltIcon } from '../../images/icon/calendar-alt.svg'
import { ReactComponent as DiscountIcon } from '../../images/icon/discount.svg'
import { ReactComponent as MicrophoneIcon } from '../../images/icon/microphone.svg'
import { ReactComponent as MoneyCircleIcon } from '../../images/icon/money-circle.svg'
import { ReactComponent as UsersIcon } from '../../images/icon/users.svg'
import { routesProps } from '../../Routes'

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
  const { enabledModules } = useContext(AppContext)

  return (
    <div className="d-flex flex-column flex-grow-1">
      <AdminMenu
        {...props}
        defaultOpenKeys={[
          'owner_program_admin',
          'owner_promotion_admin',
          'owner_podcast_admin',
          'owner_appointment_admin',
          'owner_activity_admin',
        ]}
      >
        <Menu.Item key="owner_sales_admin">
          <Icon component={() => <MoneyCircleIcon />} />
          <span>銷售管理</span>
        </Menu.Item>

        <Menu.SubMenu
          key="owner_program_admin"
          title={
            <span>
              <Icon component={() => <BookIcon />} />
              <span>課程設定</span>
            </span>
          }
        >
          <Menu.Item key="program_collection_admin">課程管理</Menu.Item>
          <Menu.Item key="program_issues_admin">課程問題</Menu.Item>
          <Menu.Item key="program_progress_admin">學習進度</Menu.Item>
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
            <Menu.Item key="owner_podcast_program_collection_admin">廣播管理</Menu.Item>
            <Menu.Item key="owner_podcast_plan_admin">訂閱方案</Menu.Item>
          </Menu.SubMenu>
        )}

        {enabledModules.appointment && (
          <Menu.SubMenu
            key="owner_appointment_admin"
            title={
              <span>
                <Icon component={() => <CalendarAltIcon />} />
                <span>預約服務</span>
              </span>
            }
          >
            <Menu.Item key="owner_appointment_plan_collection_admin">預約方案</Menu.Item>
            <Menu.Item key="owner_appointment_period_collection_admin">預約紀錄</Menu.Item>
          </Menu.SubMenu>
        )}

        {enabledModules.activity && (
          <Menu.SubMenu
            key="owner_activity_admin"
            title={
              <span>
                <Icon component={() => <CalendarAltIcon />} />
                <span>線下實體</span>
              </span>
            }
          >
            <Menu.Item key="owner_activity_collection_admin">線下實體管理</Menu.Item>
          </Menu.SubMenu>
        )}

        <Menu.SubMenu
          key="owner_promotion_admin"
          title={
            <span>
              <Icon component={() => <DiscountIcon />} />
              <span>促銷管理</span>
            </span>
          }
        >
          <Menu.Item key="owner_coupon_plans_admin">折價券</Menu.Item>
          {enabledModules.voucher && <Menu.Item key="owner_voucher_plans_admin">兌換券</Menu.Item>}
        </Menu.SubMenu>

        <Menu.Item key="owner_category_admin">
          <Icon type="book" />
          <span>分類設定</span>
        </Menu.Item>

        <Menu.Item key="owner_members_admin">
          <Icon component={() => <UsersIcon />} />
          <span>會員管理</span>
        </Menu.Item>
      </AdminMenu>
    </div>
  )
}

export const CreatorAdminMenu = (props: MenuProps) => {
  const { enabledModules } = useContext(AppContext)

  return (
    <div className="d-flex flex-column flex-grow-1">
      <AdminMenu
        {...props}
        defaultOpenKeys={['creator_program_admin', 'creator_appointment_admin', 'creator_activity_admin']}
      >
        <Menu.Item key="creator_sales_admin">
          <Icon component={() => <MoneyCircleIcon />} />
          <span>銷售管理</span>
        </Menu.Item>

        <Menu.SubMenu
          key="creator_program_admin"
          title={
            <span>
              <Icon component={() => <BookIcon />} />
              <span>課程</span>
            </span>
          }
        >
          <Menu.Item key="program_collection_admin">課程內容</Menu.Item>
          <Menu.Item key="program_issues_admin">課程問題</Menu.Item>
        </Menu.SubMenu>

        {enabledModules.appointment && (
          <Menu.SubMenu
            key="creator_appointment_admin"
            title={
              <span>
                <Icon component={() => <CalendarAltIcon />} />
                <span>預約服務</span>
              </span>
            }
          >
            <Menu.Item key="creator_appointment_plan_collection_admin">預約方案</Menu.Item>
            <Menu.Item key="creator_appointment_period_collection_admin">預約紀錄</Menu.Item>
          </Menu.SubMenu>
        )}

        {enabledModules.activity && (
          <Menu.SubMenu
            key="creator_activity_admin"
            title={
              <span>
                <Icon component={() => <CalendarAltIcon />} />
                <span>線下實體</span>
              </span>
            }
          >
            <Menu.Item key="creator_activity_collection_admin">線下實體管理</Menu.Item>
          </Menu.SubMenu>
        )}
      </AdminMenu>
    </div>
  )
}
