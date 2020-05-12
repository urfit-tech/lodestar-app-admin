import { Icon, Menu } from 'antd'
import { ClickParam, MenuProps } from 'antd/lib/menu'
import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import AppContext from '../../contexts/AppContext'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { ReactComponent as BookIcon } from '../../images/icon/book.svg'
import { ReactComponent as CalendarAltIcon } from '../../images/icon/calendar-alt.svg'
import { ReactComponent as DiscountIcon } from '../../images/icon/discount.svg'
import { ReactComponent as MicrophoneIcon } from '../../images/icon/microphone.svg'
import { ReactComponent as MoneyCircleIcon } from '../../images/icon/money-circle.svg'
import { ReactComponent as ShopIcon } from '../../images/icon/shop.svg'
import { ReactComponent as UserIcon } from '../../images/icon/user.svg'
import { ReactComponent as UsersIcon } from '../../images/icon/users.svg'
import { routesProps } from '../../Routes'

const StyledMenu = styled(Menu)`
  && {
    border-right: none;
  }
`

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

export const OwnerAdminMenu: React.FC<MenuProps> = (props) => {
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
          'owner_merchandise_admin',
          'owner_blog_admin',
        ]}
      >
        <Menu.Item key="owner_sales_admin">
          <Icon component={() => <MoneyCircleIcon />} />
          <span>{formatMessage(commonMessages.menu.salesAdmin)}</span>
        </Menu.Item>

        <Menu.SubMenu
          key="owner_program_admin"
          title={
            <span>
              <Icon component={() => <BookIcon />} />
              <span>{formatMessage(commonMessages.menu.programAdmin)}</span>
            </span>
          }
        >
          <Menu.Item key="program_collection_admin">{formatMessage(commonMessages.menu.programs)}</Menu.Item>
          <Menu.Item key="program_issue_collection_admin">{formatMessage(commonMessages.menu.programIssues)}</Menu.Item>
          {enabledModules.program_package && (
            <Menu.Item key="program_package_collection_admin">
              {formatMessage(commonMessages.menu.programPackage)}
            </Menu.Item>
          )}
          {enabledModules.learning_statistics && (
            <Menu.Item key="program_progress_admin">{formatMessage(commonMessages.menu.programProgress)}</Menu.Item>
          )}
          {enabledModules.tempo_delivery && (
            <Menu.Item key="program_tempo_delivery">{formatMessage(commonMessages.menu.tempoDelivery)}</Menu.Item>
          )}
          <Menu.Item key="program_category_admin">{formatMessage(commonMessages.menu.programCategory)}</Menu.Item>
        </Menu.SubMenu>

        {enabledModules.podcast && (
          <Menu.SubMenu
            key="owner_podcast_admin"
            title={
              <span>
                <Icon component={() => <MicrophoneIcon />} />
                <span>{formatMessage(commonMessages.menu.podcastAdmin)}</span>
              </span>
            }
          >
            <Menu.Item key="podcast_program_collection_admin">
              {formatMessage(commonMessages.menu.podcastPrograms)}
            </Menu.Item>
            <Menu.Item key="podcast_plan_admin">{formatMessage(commonMessages.menu.podcastPlans)}</Menu.Item>
            <Menu.Item key="podcast_program_category_admin">
              {formatMessage(commonMessages.menu.podcastCategory)}
            </Menu.Item>
          </Menu.SubMenu>
        )}

        {enabledModules.appointment && (
          <Menu.SubMenu
            key="owner_appointment_admin"
            title={
              <span>
                <Icon component={() => <CalendarAltIcon />} />
                <span>{formatMessage(commonMessages.menu.appointmentAdmin)}</span>
              </span>
            }
          >
            <Menu.Item key="appointment_plan_collection_admin">
              {formatMessage(commonMessages.menu.appointmentPlans)}
            </Menu.Item>
            <Menu.Item key="appointment_period_collection_admin">
              {formatMessage(commonMessages.menu.appointments)}
            </Menu.Item>
          </Menu.SubMenu>
        )}

        {enabledModules.activity && (
          <Menu.SubMenu
            key="owner_activity_admin"
            title={
              <span>
                <Icon component={() => <CalendarAltIcon />} />
                <span>{formatMessage(commonMessages.menu.activityAdmin)}</span>
              </span>
            }
          >
            <Menu.Item key="activity_collection_admin">{formatMessage(commonMessages.menu.activities)}</Menu.Item>
            <Menu.Item key="activity_category_admin">{formatMessage(commonMessages.menu.activityCategory)}</Menu.Item>
          </Menu.SubMenu>
        )}

        {enabledModules.merchandise && (
          <Menu.SubMenu
            key="owner_merchandise_admin"
            title={
              <span>
                <Icon component={() => <ShopIcon />} />
                <span>{formatMessage(commonMessages.menu.merchandiseAdmin)}</span>
              </span>
            }
          >
            <Menu.Item key="merchandise_collection_admin">{formatMessage(commonMessages.menu.merchandises)}</Menu.Item>
            <Menu.Item key="merchandise_shipping_admin">
              {formatMessage(commonMessages.menu.merchandiseShipping)}
            </Menu.Item>
            <Menu.Item key="merchandise_category_admin">
              {formatMessage(commonMessages.menu.merchandiseCategory)}
            </Menu.Item>
          </Menu.SubMenu>
        )}

        {enabledModules.blog && (
          <Menu.SubMenu
            key="owner_blog_admin"
            title={
              <span>
                <Icon type="shopping" theme="filled" />
                <span>{formatMessage(commonMessages.menu.blogAdmin)}</span>
              </span>
            }
          >
            <Menu.Item key="blog_collection_admin">{formatMessage(commonMessages.menu.blogPosts)}</Menu.Item>
            <Menu.Item key="blog_category_admin">{formatMessage(commonMessages.menu.blogCategory)}</Menu.Item>
          </Menu.SubMenu>
        )}

        <Menu.SubMenu
          key="owner_promotion_admin"
          title={
            <span>
              <Icon component={() => <DiscountIcon />} />
              <span>{formatMessage(commonMessages.menu.promotionAdmin)}</span>
            </span>
          }
        >
          <Menu.Item key="owner_coupon_plans_admin">{formatMessage(commonMessages.menu.coupons)}</Menu.Item>
          {enabledModules.voucher && (
            <Menu.Item key="owner_voucher_plans_admin">{formatMessage(commonMessages.menu.vouchers)}</Menu.Item>
          )}
        </Menu.SubMenu>

        <Menu.Item key="owner_members_admin">
          <Icon component={() => <UsersIcon />} />
          <span>{formatMessage(commonMessages.menu.members)}</span>
        </Menu.Item>
        <Menu.Item key="settings_admin">
          <Icon component={() => <UserIcon />} />
          <span>{formatMessage(commonMessages.menu.ownerSettings)}</span>
        </Menu.Item>
      </AdminMenu>
    </div>
  )
}

export const CreatorAdminMenu: React.FC<MenuProps> = (props: MenuProps) => {
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
          <span>{formatMessage(commonMessages.menu.salesAdmin)}</span>
        </Menu.Item>

        <Menu.SubMenu
          key="creator_program_admin"
          title={
            <span>
              <Icon component={() => <BookIcon />} />
              <span>{formatMessage(commonMessages.menu.programAdmin)}</span>
            </span>
          }
        >
          <Menu.Item key="program_collection_admin">{formatMessage(commonMessages.menu.programs)}</Menu.Item>
          <Menu.Item key="program_issue_collection_admin">{formatMessage(commonMessages.menu.programIssues)}</Menu.Item>
        </Menu.SubMenu>

        {enabledModules.appointment && (
          <Menu.SubMenu
            key="creator_appointment_admin"
            title={
              <span>
                <Icon component={() => <CalendarAltIcon />} />
                <span>{formatMessage(commonMessages.menu.appointmentAdmin)}</span>
              </span>
            }
          >
            <Menu.Item key="appointment_plan_collection_admin">
              {formatMessage(commonMessages.menu.appointmentPlans)}
            </Menu.Item>
            <Menu.Item key="appointment_period_collection_admin">
              {formatMessage(commonMessages.menu.appointments)}
            </Menu.Item>
          </Menu.SubMenu>
        )}

        {enabledModules.activity && (
          <Menu.SubMenu
            key="creator_activity_admin"
            title={
              <span>
                <Icon component={() => <CalendarAltIcon />} />
                <span>{formatMessage(commonMessages.menu.activityAdmin)}</span>
              </span>
            }
          >
            <Menu.Item key="activity_collection_admin">
              {formatMessage(commonMessages.menu.activities)}
            </Menu.Item>
          </Menu.SubMenu>
        )}
        <Menu.Item key="settings_admin">
          <Icon component={() => <UserIcon />} />
          <span>{formatMessage(commonMessages.menu.creatorSettings)}</span>
        </Menu.Item>
      </AdminMenu>
    </div>
  )
}
