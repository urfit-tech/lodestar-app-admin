import { Icon, Menu } from 'antd'
import { ClickParam, MenuProps } from 'antd/lib/menu'
import React, { useContext } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import AppContext from '../../contexts/AppContext'
import { errorMessages } from '../../helpers/translation'
import { ReactComponent as BookIcon } from '../../images/icon/book.svg'
import { ReactComponent as CalendarAltIcon } from '../../images/icon/calendar-alt.svg'
import { ReactComponent as DiscountIcon } from '../../images/icon/discount.svg'
import { ReactComponent as MicrophoneIcon } from '../../images/icon/microphone.svg'
import { ReactComponent as MoneyCircleIcon } from '../../images/icon/money-circle.svg'
import { ReactComponent as UserIcon } from '../../images/icon/user.svg'
import { ReactComponent as UsersIcon } from '../../images/icon/users.svg'
import { routesProps } from '../../Routes'

const StyledMenu = styled(Menu)`
  && {
    border-right: none;
  }
`

const messages = defineMessages({
  salesAdmin: { id: 'common.menu.salesAdmin', defaultMessage: '銷售管理' },
  programAdmin: { id: 'common.menu.programAdmin', defaultMessage: '線上課程' },
  programs: { id: 'common.menu.programs', defaultMessage: '課程管理' },
  programIssues: { id: 'common.menu.programIssues', defaultMessage: '課程問題' },
  programProgress: { id: 'common.menu.programProgress', defaultMessage: '學習進度' },
  podcastAdmin: { id: 'common.menu.podcastAdmin', defaultMessage: '音頻廣播' },
  podcastPrograms: { id: 'common.menu.podcastPrograms', defaultMessage: '廣播管理' },
  podcastPlans: { id: 'common.menu.podcastPlans', defaultMessage: '訂閱方案' },
  appointmentAdmin: { id: 'common.menu.appointmentAdmin', defaultMessage: '預約服務' },
  appointmentPlans: { id: 'common.menu.appointmentPlans', defaultMessage: '預約方案' },
  appointments: { id: 'common.menu.appointments', defaultMessage: '預約記錄' },
  activityAdmin: { id: 'common.menu.activityAdmin', defaultMessage: '線下實體' },
  activities: { id: 'common.menu.activities', defaultMessage: '線下實體管理' },
  promotionAdmin: { id: 'common.menu.promotionAdmin', defaultMessage: '促銷管理' },
  coupons: { id: 'common.menu.coupons', defaultMessage: '折價券' },
  vouchers: { id: 'common.menu.vouchers', defaultMessage: '兌換券' },
  categories: { id: 'common.menu.categories', defaultMessage: '分類設定' },
  members: { id: 'common.menu.members', defaultMessage: '會員管理' },
  ownerSettings: { id: 'common.menu.ownerSettings', defaultMessage: '管理員設定' },
  creatorSettings: { id: 'common.menu.creatorSettings', defaultMessage: '創作者設定' },
})

const AdminMenu: React.FC<MenuProps> = ({ children, ...menuProps }) => {
  const { history } = useRouter()
  const { formatMessage } = useIntl()

  const handleClick = ({ key, item }: ClickParam) => {
    if (key.startsWith('_blank')) {
      window.open(item.props['data-href'])
    } else {
      const route = routesProps[key]
      route ? history.push(route.path) : alert(formatMessage(errorMessages.route.notFound))
    }
  }

  return (
    <StyledMenu {...menuProps} mode="inline" onClick={handleClick}>
      {children}
    </StyledMenu>
  )
}

export const OwnerAdminMenu = (props: MenuProps) => {
  const { formatMessage } = useIntl()
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
          <span>{formatMessage(messages.salesAdmin)}</span>
        </Menu.Item>

        <Menu.SubMenu
          key="owner_program_admin"
          title={
            <span>
              <Icon component={() => <BookIcon />} />
              <span>{formatMessage(messages.programAdmin)}</span>
            </span>
          }
        >
          <Menu.Item key="program_collection_admin">{formatMessage(messages.programs)}</Menu.Item>
          <Menu.Item key="program_issues_admin">{formatMessage(messages.programIssues)}</Menu.Item>
          {enabledModules.learning_statistics && <Menu.Item key="program_progress_admin">{formatMessage(messages.programProgress)}</Menu.Item>}
        </Menu.SubMenu>

        {enabledModules.podcast && (
          <Menu.SubMenu
            key="owner_podcast_admin"
            title={
              <span>
                <Icon component={() => <MicrophoneIcon />} />
                <span>{formatMessage(messages.podcastAdmin)}</span>
              </span>
            }
          >
            <Menu.Item key="owner_podcast_program_collection_admin">
              {formatMessage(messages.podcastPrograms)}
            </Menu.Item>
            <Menu.Item key="owner_podcast_plan_admin">{formatMessage(messages.podcastPlans)}</Menu.Item>
          </Menu.SubMenu>
        )}

        {enabledModules.appointment && (
          <Menu.SubMenu
            key="owner_appointment_admin"
            title={
              <span>
                <Icon component={() => <CalendarAltIcon />} />
                <span>{formatMessage(messages.appointmentAdmin)}</span>
              </span>
            }
          >
            <Menu.Item key="owner_appointment_plan_collection_admin">
              {formatMessage(messages.appointmentPlans)}
            </Menu.Item>
            <Menu.Item key="owner_appointment_period_collection_admin">
              {formatMessage(messages.appointments)}
            </Menu.Item>
          </Menu.SubMenu>
        )}

        {enabledModules.activity && (
          <Menu.SubMenu
            key="owner_activity_admin"
            title={
              <span>
                <Icon component={() => <CalendarAltIcon />} />
                <span>{formatMessage(messages.activityAdmin)}</span>
              </span>
            }
          >
            <Menu.Item key="owner_activity_collection_admin">{formatMessage(messages.activities)}</Menu.Item>
          </Menu.SubMenu>
        )}

        <Menu.SubMenu
          key="owner_promotion_admin"
          title={
            <span>
              <Icon component={() => <DiscountIcon />} />
              <span>{formatMessage(messages.promotionAdmin)}</span>
            </span>
          }
        >
          <Menu.Item key="owner_coupon_plans_admin">{formatMessage(messages.coupons)}</Menu.Item>
          {enabledModules.voucher && (
            <Menu.Item key="owner_voucher_plans_admin">{formatMessage(messages.vouchers)}</Menu.Item>
          )}
        </Menu.SubMenu>

        <Menu.Item key="owner_category_admin">
          <Icon type="book" />
          <span>{formatMessage(messages.categories)}</span>
        </Menu.Item>

        <Menu.Item key="owner_members_admin">
          <Icon component={() => <UsersIcon />} />
          <span>{formatMessage(messages.members)}</span>
        </Menu.Item>
        <Menu.Item key="owner_settings_admin">
          <Icon component={() => <UserIcon />} />
          <span>{formatMessage(messages.ownerSettings)}</span>
        </Menu.Item>
      </AdminMenu>
    </div>
  )
}

export const CreatorAdminMenu = (props: MenuProps) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useContext(AppContext)

  return (
    <div className="d-flex flex-column flex-grow-1">
      <AdminMenu
        {...props}
        defaultOpenKeys={['creator_program_admin', 'creator_appointment_admin', 'creator_activity_admin']}
      >
        <Menu.Item key="creator_sales_admin">
          <Icon component={() => <MoneyCircleIcon />} />
          <span>{formatMessage(messages.salesAdmin)}</span>
        </Menu.Item>

        <Menu.SubMenu
          key="creator_program_admin"
          title={
            <span>
              <Icon component={() => <BookIcon />} />
              <span>{formatMessage(messages.programAdmin)}</span>
            </span>
          }
        >
          <Menu.Item key="program_collection_admin">{formatMessage(messages.programs)}</Menu.Item>
          <Menu.Item key="program_issues_admin">{formatMessage(messages.programIssues)}</Menu.Item>
        </Menu.SubMenu>

        {enabledModules.appointment && (
          <Menu.SubMenu
            key="creator_appointment_admin"
            title={
              <span>
                <Icon component={() => <CalendarAltIcon />} />
                <span>{formatMessage(messages.appointmentAdmin)}</span>
              </span>
            }
          >
            <Menu.Item key="creator_appointment_plan_collection_admin">
              {formatMessage(messages.appointmentPlans)}
            </Menu.Item>
            <Menu.Item key="creator_appointment_period_collection_admin">
              {formatMessage(messages.appointments)}
            </Menu.Item>
          </Menu.SubMenu>
        )}

        {enabledModules.activity && (
          <Menu.SubMenu
            key="creator_activity_admin"
            title={
              <span>
                <Icon component={() => <CalendarAltIcon />} />
                <span>{formatMessage(messages.activityAdmin)}</span>
              </span>
            }
          >
            <Menu.Item key="creator_activity_collection_admin">{formatMessage(messages.activities)}</Menu.Item>
          </Menu.SubMenu>
        )}
        <Menu.Item key="creator_settings_admin">
          <Icon component={() => <UserIcon />} />
          <span>{formatMessage(messages.creatorSettings)}</span>
        </Menu.Item>
      </AdminMenu>
    </div>
  )
}
