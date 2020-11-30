import Icon, { GlobalOutlined, GoldenFilled, ShoppingFilled } from '@ant-design/icons'
import { Menu } from 'antd'
import { MenuProps } from 'antd/lib/menu'
import { MenuClickEventHandler } from 'rc-menu/lib/interface'
import React from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { ReactComponent as BookIcon } from '../../images/icon/book.svg'
import { ReactComponent as CalendarAltIcon } from '../../images/icon/calendar-alt.svg'
import { ReactComponent as DiscountIcon } from '../../images/icon/discount.svg'
import { ReactComponent as MicrophoneIcon } from '../../images/icon/microphone.svg'
import { ReactComponent as MoneyCircleIcon } from '../../images/icon/money-circle.svg'
import { ReactComponent as PointIcon } from '../../images/icon/point.svg'
import { ReactComponent as ShopIcon } from '../../images/icon/shop.svg'
import { ReactComponent as UserIcon } from '../../images/icon/user.svg'
import { ReactComponent as UsersIcon } from '../../images/icon/users.svg'
import { routesProps } from '../../Routes'

export const StyledMenu = styled(Menu)`
  && {
    border-right: none;
  }
`

const AdminMenu: React.FC<MenuProps> = ({ children, ...menuProps }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { enabledModules } = useApp()
  const { permissions, currentUserRole } = useAuth()

  const handleClick: MenuClickEventHandler = ({ key, item }) => {
    if (typeof key === 'string' && key.startsWith('_blank')) {
    } else {
      const route = routesProps[key]
      route ? history.push(route.path) : alert(formatMessage(errorMessages.route.notFound))
    }
  }

  return (
    <StyledMenu
      {...menuProps}
      mode="inline"
      defaultOpenKeys={[
        'owner_program_admin',
        'owner_promotion_admin',
        'owner_podcast_admin',
        'owner_appointment_admin',
        'owner_creator_display_admin',
        'owner_activity_admin',
        'owner_merchandise_admin',
        'owner_blog_admin',
        'owner_credit_admin',
        'owner_member_admin',
        'owner_task_admin',
      ]}
      onClick={handleClick}
    >
      {permissions.SALES_ADMIN &&
        (currentUserRole === 'app-owner' ? (
          <Menu.Item key="owner_sales">
            <Icon component={() => <MoneyCircleIcon />} />
            <span>{formatMessage(commonMessages.menu.salesAdmin)}</span>
          </Menu.Item>
        ) : currentUserRole === 'content-creator' ? (
          <Menu.Item key="creator_sales">
            <Icon component={() => <MoneyCircleIcon />} />
            <span>{formatMessage(commonMessages.menu.salesAdmin)}</span>
          </Menu.Item>
        ) : null)}

      {(permissions.PROGRAM_ADMIN ||
        permissions.PROGRAM_ISSUE_ADMIN ||
        permissions.PROGRAM_PACKAGE_ADMIN ||
        permissions.PROGRAM_PROGRESS_READ ||
        permissions.PROGRAM_PACKAGE_TEMPO_DELIVERY_ADMIN ||
        permissions.PROGRAM_CATEGORY_ADMIN ||
        permissions.PROGRAM_PACKAGE_CATEGORY_ADMIN) && (
        <Menu.SubMenu
          key="owner_program_admin"
          title={
            <span>
              <Icon component={() => <BookIcon />} />
              <span>{formatMessage(commonMessages.menu.programAdmin)}</span>
            </span>
          }
        >
          {permissions.PROGRAM_ADMIN && (
            <Menu.Item key="program_collection">{formatMessage(commonMessages.menu.programs)}</Menu.Item>
          )}
          {permissions.PROGRAM_ISSUE_ADMIN && (
            <Menu.Item key="program_issue_collection">{formatMessage(commonMessages.menu.programIssues)}</Menu.Item>
          )}
          {enabledModules.program_package && permissions.PROGRAM_PACKAGE_ADMIN && (
            <Menu.Item key="program_package_collection">{formatMessage(commonMessages.menu.programPackage)}</Menu.Item>
          )}
          {enabledModules.learning_statistics && permissions.PROGRAM_PROGRESS_READ && (
            <Menu.Item key="program_progress">{formatMessage(commonMessages.menu.programProgress)}</Menu.Item>
          )}
          {enabledModules.tempo_delivery && permissions.PROGRAM_PACKAGE_TEMPO_DELIVERY_ADMIN && (
            <Menu.Item key="program_tempo_delivery">{formatMessage(commonMessages.menu.tempoDelivery)}</Menu.Item>
          )}
          {permissions.PROGRAM_CATEGORY_ADMIN && (
            <Menu.Item key="program_category">{formatMessage(commonMessages.menu.programCategory)}</Menu.Item>
          )}
          {permissions.PROGRAM_PACKAGE_CATEGORY_ADMIN && (
            <Menu.Item key="program_package_category">
              {formatMessage(commonMessages.menu.programPackageCategory)}
            </Menu.Item>
          )}
        </Menu.SubMenu>
      )}

      {enabledModules.podcast && (currentUserRole === 'app-owner' || currentUserRole === 'content-creator') && (
        <Menu.SubMenu
          key="owner_podcast_admin"
          title={
            <span>
              <Icon component={() => <MicrophoneIcon />} />
              <span>{formatMessage(commonMessages.menu.podcastAdmin)}</span>
            </span>
          }
        >
          <Menu.Item key="podcast_program_collection">{formatMessage(commonMessages.menu.podcastPrograms)}</Menu.Item>
          <Menu.Item key="podcast_plan">{formatMessage(commonMessages.menu.podcastPlans)}</Menu.Item>
          <Menu.Item key="podcast_program_category">{formatMessage(commonMessages.menu.podcastCategory)}</Menu.Item>
        </Menu.SubMenu>
      )}

      {enabledModules.appointment && (permissions.APPOINTMENT_PLAN_ADMIN || permissions.APPOINTMENT_PERIOD_ADMIN) && (
        <Menu.SubMenu
          key="owner_appointment_admin"
          title={
            <span>
              <Icon component={() => <CalendarAltIcon />} />
              <span>{formatMessage(commonMessages.menu.appointmentAdmin)}</span>
            </span>
          }
        >
          {permissions.APPOINTMENT_PLAN_ADMIN && (
            <Menu.Item key="appointment_plan_collection">
              {formatMessage(commonMessages.menu.appointmentPlans)}
            </Menu.Item>
          )}
          {permissions.APPOINTMENT_PERIOD_ADMIN && (
            <Menu.Item key="appointment_period_collection">{formatMessage(commonMessages.menu.appointments)}</Menu.Item>
          )}
        </Menu.SubMenu>
      )}

      {enabledModules.creator_display && currentUserRole === 'app-owner' && (
        <Menu.SubMenu
          key="owner_creator_display_admin"
          title={
            <span>
              <Icon component={() => <UsersIcon />} />
              <span>{formatMessage(commonMessages.menu.creatorDisplayAdmin)}</span>
            </span>
          }
        >
          <Menu.Item key="owner_creator_collection">
            {formatMessage(commonMessages.menu.creatorDisplayManagement)}
          </Menu.Item>
          <Menu.Item key="owner_creator_category">
            {formatMessage(commonMessages.menu.creatorDisplayCategory)}
          </Menu.Item>
        </Menu.SubMenu>
      )}

      {enabledModules.activity && (permissions.ACTIVITY_ADMIN || permissions.ACTIVITY_CATEGORY_ADMIN) && (
        <Menu.SubMenu
          key="owner_activity_admin"
          title={
            <span>
              <Icon component={() => <CalendarAltIcon />} />
              <span>{formatMessage(commonMessages.menu.activityAdmin)}</span>
            </span>
          }
        >
          {permissions.ACTIVITY_ADMIN && (
            <Menu.Item key="activity_collection">{formatMessage(commonMessages.menu.activities)}</Menu.Item>
          )}
          {permissions.ACTIVITY_CATEGORY_ADMIN && (
            <Menu.Item key="activity_category">{formatMessage(commonMessages.menu.activityCategory)}</Menu.Item>
          )}
        </Menu.SubMenu>
      )}

      {enabledModules.blog && (permissions.POST_ADMIN || permissions.POST_CATEGORY_ADMIN) && (
        <Menu.SubMenu
          key="owner_blog_admin"
          title={
            <span>
              <ShoppingFilled />
              <span>{formatMessage(commonMessages.menu.blogAdmin)}</span>
            </span>
          }
        >
          {permissions.POST_ADMIN && (
            <Menu.Item key="blog_collection">{formatMessage(commonMessages.menu.blogPosts)}</Menu.Item>
          )}
          {permissions.POST_CATEGORY_ADMIN && (
            <Menu.Item key="blog_category">{formatMessage(commonMessages.menu.blogCategory)}</Menu.Item>
          )}
        </Menu.SubMenu>
      )}

      {enabledModules.merchandise && (currentUserRole === 'app-owner' || currentUserRole === 'content-creator') && (
        <Menu.SubMenu
          key="owner_merchandise_admin"
          title={
            <span>
              <Icon component={() => <ShopIcon />} />
              <span>{formatMessage(commonMessages.menu.eCommerce)}</span>
            </span>
          }
        >
          <Menu.Item key="merchandise_shop_collection">{formatMessage(commonMessages.menu.merchandiseShop)}</Menu.Item>
          <Menu.Item key="merchandise_inventory">{formatMessage(commonMessages.menu.merchandiseInventory)}</Menu.Item>
          <Menu.Item key="merchandise_category">{formatMessage(commonMessages.menu.merchandiseCategory)}</Menu.Item>
        </Menu.SubMenu>
      )}

      {(enabledModules.merchandise || enabledModules.project) &&
        (currentUserRole === 'app-owner' || currentUserRole === 'content-creator') && (
          <Menu.Item key="shipping">
            <GoldenFilled />
            {formatMessage(commonMessages.menu.shipping)}
          </Menu.Item>
        )}

      {(permissions.COUPON_PLAN_ADMIN || permissions.VOUCHER_PLAN_ADMIN) && (
        <Menu.SubMenu
          key="owner_promotion_admin"
          title={
            <span>
              <Icon component={() => <DiscountIcon />} />
              <span>{formatMessage(commonMessages.menu.promotionAdmin)}</span>
            </span>
          }
        >
          {permissions.COUPON_PLAN_ADMIN && (
            <Menu.Item key="owner_coupon_plans">{formatMessage(commonMessages.menu.coupons)}</Menu.Item>
          )}
          {enabledModules.voucher && permissions.VOUCHER_PLAN_ADMIN && (
            <Menu.Item key="owner_voucher_plans">{formatMessage(commonMessages.menu.vouchers)}</Menu.Item>
          )}
        </Menu.SubMenu>
      )}

      {enabledModules.coin && permissions.COIN_ADMIN && (
        <Menu.SubMenu
          key="owner_credit_admin"
          title={
            <span>
              <Icon component={() => <PointIcon />} />
              <span>{formatMessage(commonMessages.menu.creditAdmin)}</span>
            </span>
          }
        >
          <Menu.Item key="owner_coin_history">{formatMessage(commonMessages.menu.coinHistory)}</Menu.Item>
        </Menu.SubMenu>
      )}

      {(permissions.MEMBER_ADMIN || permissions.MEMBER_PROPERTY_ADMIN) && (
        <Menu.SubMenu
          key="owner_member_admin"
          title={
            <span>
              <Icon component={() => <UsersIcon />} />
              <span>{formatMessage(commonMessages.menu.memberAdmin)}</span>
            </span>
          }
        >
          {permissions.MEMBER_ADMIN && (
            <Menu.Item key="owner_members">{formatMessage(commonMessages.menu.members)}</Menu.Item>
          )}
          {permissions.MEMBER_CATEGORY_ADMIN && (
            <Menu.Item key="owner_member_category">{formatMessage(commonMessages.menu.memberCategory)}</Menu.Item>
          )}
          {enabledModules.member_property && permissions.MEMBER_PROPERTY_ADMIN && (
            <Menu.Item key="owner_member_properties">{formatMessage(commonMessages.menu.memberProperties)}</Menu.Item>
          )}
        </Menu.SubMenu>
      )}

      {enabledModules.member_task && (permissions.TASK_ADMIN || permissions.TASK_CATEGORY_ADMIN) && (
        <Menu.SubMenu
          key="owner_task_admin"
          title={
            <span>
              <Icon component={() => <UsersIcon />} />
              <span>{formatMessage(commonMessages.menu.taskAdmin)}</span>
            </span>
          }
        >
          {permissions.TASK_ADMIN && (
            <Menu.Item key="task_collection">{formatMessage(commonMessages.menu.tasks)}</Menu.Item>
          )}
          {permissions.TASK_CATEGORY_ADMIN && (
            <Menu.Item key="task_category_collection">{formatMessage(commonMessages.menu.taskCategory)}</Menu.Item>
          )}
        </Menu.SubMenu>
      )}

      <Menu.Item key="settings">
        <Icon component={() => <UserIcon />} />
        {currentUserRole === 'app-owner' ? (
          <span>{formatMessage(commonMessages.menu.ownerSettings)}</span>
        ) : currentUserRole === 'content-creator' ? (
          <span>{formatMessage(commonMessages.menu.creatorSettings)}</span>
        ) : (
          <span>{formatMessage(commonMessages.menu.memberSettings)}</span>
        )}
      </Menu.Item>

      {permissions.APP_SETTING_ADMIN && (
        <Menu.Item key="app_admin">
          <GlobalOutlined />
          <span>{formatMessage(commonMessages.menu.appAdmin)}</span>
        </Menu.Item>
      )}
    </StyledMenu>
  )
}

export default AdminMenu
