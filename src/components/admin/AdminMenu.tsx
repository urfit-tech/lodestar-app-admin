import Icon, { GlobalOutlined, GoldenFilled, RadarChartOutlined, ShoppingFilled } from '@ant-design/icons'
import { Menu } from 'antd'
import { MenuProps } from 'antd/lib/menu'
import { isEmpty } from 'ramda'
import { MenuClickEventHandler } from 'rc-menu/lib/interface'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { useCustomRenderer } from '../../contexts/CustomRendererContext'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { ReactComponent as BookIcon } from '../../images/icon/book.svg'
import { ReactComponent as CalendarAltIcon } from '../../images/icon/calendar-alt.svg'
import { ReactComponent as DiscountIcon } from '../../images/icon/discount.svg'
import { ReactComponent as MicrophoneIcon } from '../../images/icon/microphone.svg'
import { ReactComponent as MoneyCircleIcon } from '../../images/icon/money-circle.svg'
import { ReactComponent as PageIcon } from '../../images/icon/page.svg'
import { ReactComponent as PhoneIcon } from '../../images/icon/phone.svg'
import { ReactComponent as PointIcon } from '../../images/icon/point.svg'
import { ReactComponent as ProjectIcon } from '../../images/icon/project.svg'
import { ReactComponent as ShopIcon } from '../../images/icon/shop.svg'
import { ReactComponent as UserIcon } from '../../images/icon/user.svg'
import { ReactComponent as UsersIcon } from '../../images/icon/users.svg'
import { routesMap } from '../../Routes'

export const StyledMenu = styled(Menu)`
  && {
    border-right: none;
  }
`

const AdminMenu: React.FC<MenuProps> = ({ children, ...menuProps }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { enabledModules, settings } = useApp()
  const { permissions, currentUserRole } = useAuth()
  const { renderAdminMenu } = useCustomRenderer()

  const defaultMenuItems: {
    permissionIsAllowed: boolean
    icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
    key: string
    name: string
    subMenuItems?: {
      permissionIsAllowed: boolean
      key: string
      name: string
    }[]
  }[] = [
    {
      permissionIsAllowed: !!enabledModules.learning_statistics_advanced,
      icon: () => <RadarChartOutlined className="m-0" />,
      key: 'owner_learning_overview',
      name: formatMessage(commonMessages.menu.learningOverviewAdmin),
    },
    {
      permissionIsAllowed: permissions.SALES_ADMIN && currentUserRole === 'app-owner',
      icon: () => <MoneyCircleIcon />,
      key: 'owner_sales',
      name: formatMessage(commonMessages.menu.salesAdmin),
    },
    {
      permissionIsAllowed:
        currentUserRole === 'content-creator' && (!enabledModules.permission || permissions.SALES_CREATOR_VIEW),
      icon: () => <MoneyCircleIcon />,
      key: 'creator_sales',
      name: formatMessage(commonMessages.menu.salesAdmin),
    },
    {
      permissionIsAllowed:
        permissions.PROGRAM_ADMIN ||
        permissions.PROGRAM_ISSUE_ADMIN ||
        permissions.PROGRAM_PACKAGE_ADMIN ||
        permissions.PROGRAM_PROGRESS_READ ||
        permissions.PROGRAM_PACKAGE_TEMPO_DELIVERY_ADMIN ||
        permissions.PROGRAM_CATEGORY_ADMIN ||
        permissions.PROGRAM_PACKAGE_CATEGORY_ADMIN,
      icon: () => <BookIcon />,
      key: 'owner_program_admin',
      name: formatMessage(commonMessages.menu.programAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: permissions.PROGRAM_ADMIN,
          key: 'program_collection',
          name: formatMessage(commonMessages.menu.programs),
        },
        {
          permissionIsAllowed: permissions.PROGRAM_ISSUE_ADMIN,
          key: 'program_issue_collection',
          name: formatMessage(commonMessages.menu.programIssues),
        },
        {
          permissionIsAllowed: !!enabledModules.practice && permissions.PRACTICE_ADMIN,
          key: 'practice_collection',
          name: formatMessage(commonMessages.menu.practice),
        },
        {
          permissionIsAllowed: !!enabledModules.exercise,
          key: 'exercise_result',
          name: formatMessage(commonMessages.menu.exerciseResult),
        },
        {
          permissionIsAllowed: !!enabledModules.program_package && permissions.PROGRAM_PACKAGE_ADMIN,
          key: 'program_package_collection',
          name: formatMessage(commonMessages.menu.programPackage),
        },
        {
          permissionIsAllowed: !!enabledModules.learning_statistics && permissions.PROGRAM_PROGRESS_READ,
          key: 'program_progress',
          name: formatMessage(commonMessages.menu.programProgress),
        },
        {
          permissionIsAllowed: !!enabledModules.tempo_delivery && permissions.PROGRAM_PACKAGE_TEMPO_DELIVERY_ADMIN,
          key: 'program_tempo_delivery',
          name: formatMessage(commonMessages.menu.tempoDelivery),
        },
        {
          permissionIsAllowed: permissions.PROGRAM_CATEGORY_ADMIN,
          key: 'program_category',
          name: formatMessage(commonMessages.menu.programCategory),
        },
        {
          permissionIsAllowed: !!enabledModules.program_package && permissions.PROGRAM_PACKAGE_CATEGORY_ADMIN,
          key: 'program_package_category',
          name: formatMessage(commonMessages.menu.programPackageCategory),
        },
      ],
    },
    {
      permissionIsAllowed: !!enabledModules.project && currentUserRole === 'app-owner',
      key: 'owner_project_admin',
      icon: () => <ProjectIcon />,
      name: formatMessage(commonMessages.menu.projectAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: true,
          key: 'project_funding_collection',
          name: formatMessage(commonMessages.menu.projectFunding),
        },
        {
          permissionIsAllowed: true,
          key: 'project_pre_order_collection',
          name: formatMessage(commonMessages.menu.projectPreOrder),
        },
        {
          permissionIsAllowed: false,
          key: 'project_on_sale_collection',
          name: formatMessage(commonMessages.menu.projectOnSale),
        },
      ],
    },
    {
      permissionIsAllowed:
        !!enabledModules.podcast && (currentUserRole === 'app-owner' || currentUserRole === 'content-creator'),
      key: 'owner_podcast_admin',
      icon: () => <MicrophoneIcon />,
      name: formatMessage(commonMessages.menu.podcastAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: true,
          key: 'podcast_program_collection',
          name: formatMessage(commonMessages.menu.podcastPrograms),
        },
        {
          permissionIsAllowed: true,
          key: 'podcast_plan',
          name: formatMessage(commonMessages.menu.podcastPlans),
        },
        {
          permissionIsAllowed: true,
          key: 'podcast_program_category',
          name: formatMessage(commonMessages.menu.podcastCategory),
        },
      ],
    },
    {
      permissionIsAllowed:
        !!enabledModules.appointment && (permissions.APPOINTMENT_PLAN_ADMIN || permissions.APPOINTMENT_PERIOD_ADMIN),
      key: 'owner_appointment_admin',
      icon: () => <CalendarAltIcon />,
      name: formatMessage(commonMessages.menu.appointmentAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: permissions.APPOINTMENT_PLAN_ADMIN,
          key: 'appointment_plan_collection',
          name: formatMessage(commonMessages.menu.appointmentPlans),
        },
        {
          permissionIsAllowed: permissions.APPOINTMENT_PERIOD_ADMIN,
          key: 'appointment_period_collection',
          name: formatMessage(commonMessages.menu.appointments),
        },
      ],
    },
    {
      permissionIsAllowed: !!enabledModules.creator_display && currentUserRole === 'app-owner',
      key: 'owner_creator_display_admin',
      icon: () => <UsersIcon />,
      name: formatMessage(commonMessages.menu.creatorDisplayAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: true,
          key: 'owner_creator_collection',
          name: formatMessage(commonMessages.menu.creatorDisplayManagement),
        },
        {
          permissionIsAllowed: true,
          key: 'owner_creator_category',
          name: formatMessage(commonMessages.menu.creatorDisplayCategory),
        },
      ],
    },
    {
      permissionIsAllowed:
        !!enabledModules.activity && (permissions.ACTIVITY_ADMIN || permissions.ACTIVITY_CATEGORY_ADMIN),
      key: 'owner_activity_admin',
      icon: () => <CalendarAltIcon />,
      name: formatMessage(commonMessages.menu.activityAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: permissions.ACTIVITY_ADMIN,
          key: 'activity_collection',
          name: formatMessage(commonMessages.menu.activities),
        },
        {
          permissionIsAllowed: permissions.ACTIVITY_CATEGORY_ADMIN,
          key: 'activity_category',
          name: formatMessage(commonMessages.menu.activityCategory),
        },
      ],
    },
    {
      permissionIsAllowed:
        !!enabledModules.blog &&
        (currentUserRole === 'app-owner' ||
          currentUserRole === 'content-creator' ||
          permissions.POST_ADMIN ||
          permissions.POST_CATEGORY_ADMIN),
      key: 'owner_blog_admin',
      icon: () => <ShoppingFilled className="mr-0" />,
      name: formatMessage(commonMessages.menu.blogAdmin),
      subMenuItems: [
        {
          permissionIsAllowed:
            currentUserRole === 'app-owner' || currentUserRole === 'content-creator' || permissions.POST_ADMIN,
          key: 'blog_collection',
          name: formatMessage(commonMessages.menu.blogPosts),
        },
        {
          permissionIsAllowed:
            currentUserRole === 'app-owner' || currentUserRole === 'content-creator' || permissions.POST_CATEGORY_ADMIN,
          key: 'blog_category',
          name: formatMessage(commonMessages.menu.blogCategory),
        },
      ],
    },
    {
      permissionIsAllowed:
        !!enabledModules.merchandise && (currentUserRole === 'app-owner' || currentUserRole === 'content-creator'),
      key: 'owner_merchandise_admin',
      icon: () => <ShopIcon />,
      name: formatMessage(commonMessages.menu.eCommerce),
      subMenuItems: [
        {
          permissionIsAllowed: true,
          key: 'merchandise_shop_collection',
          name: formatMessage(commonMessages.menu.merchandiseShop),
        },
        {
          permissionIsAllowed: true,
          key: 'merchandise_inventory',
          name: formatMessage(commonMessages.menu.merchandiseInventory),
        },
        {
          permissionIsAllowed: true,
          key: 'merchandise_category',
          name: formatMessage(commonMessages.menu.merchandiseCategory),
        },
      ],
    },
    {
      permissionIsAllowed:
        (!!enabledModules.merchandise || !!enabledModules.project) &&
        (currentUserRole === 'app-owner' || currentUserRole === 'content-creator'),
      key: 'shipping',
      icon: () => <GoldenFilled className="mr-0" />,
      name: formatMessage(commonMessages.menu.shipping),
    },
    {
      permissionIsAllowed: permissions.COUPON_PLAN_ADMIN || permissions.VOUCHER_PLAN_ADMIN,
      key: 'owner_promotion_admin',
      icon: () => <DiscountIcon />,
      name: formatMessage(commonMessages.menu.promotionAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: permissions.COUPON_PLAN_ADMIN,
          key: 'owner_coupon_plans',
          name: formatMessage(commonMessages.menu.coupons),
        },
        {
          permissionIsAllowed: !!enabledModules.voucher && permissions.VOUCHER_PLAN_ADMIN,
          key: 'owner_voucher_plans',
          name: formatMessage(commonMessages.menu.vouchers),
        },
      ],
    },
    {
      permissionIsAllowed: !!enabledModules.coin && permissions.COIN_ADMIN,
      key: 'owner_credit_admin',
      icon: () => <PointIcon />,
      name: formatMessage(commonMessages.menu.creditAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: true,
          key: 'owner_coin_history',
          name: formatMessage(commonMessages.menu.coinHistory),
        },
      ],
    },
    {
      permissionIsAllowed: permissions.MEMBER_ADMIN || permissions.MEMBER_PROPERTY_ADMIN,
      key: 'owner_member_admin',
      icon: () => <UsersIcon />,
      name: formatMessage(commonMessages.menu.memberAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: permissions.MEMBER_ADMIN,
          key: 'owner_members',
          name: formatMessage(commonMessages.menu.members),
        },
        {
          permissionIsAllowed: !!enabledModules.permission_group && currentUserRole === 'app-owner',
          key: 'owner_permission_group',
          name: formatMessage(commonMessages.menu.permissionGroup),
        },
        {
          permissionIsAllowed: permissions.MEMBER_CATEGORY_ADMIN,
          key: 'owner_member_category',
          name: formatMessage(commonMessages.menu.memberCategory),
        },
        {
          permissionIsAllowed: !!enabledModules.member_property && permissions.MEMBER_PROPERTY_ADMIN,
          key: 'owner_member_properties',
          name: formatMessage(commonMessages.menu.memberProperties),
        },
      ],
    },
    {
      permissionIsAllowed: !!enabledModules.member_note && currentUserRole === 'app-owner',
      key: 'note_collection',
      icon: () => <UsersIcon />,
      name: formatMessage(commonMessages.menu.noteAdmin),
    },
    {
      permissionIsAllowed: !!enabledModules.sales,
      key: 'sales_management',
      icon: () => <PhoneIcon />,
      name: formatMessage(commonMessages.menu.salesManagement),
      subMenuItems: [
        {
          permissionIsAllowed: !!enabledModules.sales,
          key: 'sales_performance',
          name: formatMessage(commonMessages.menu.salesPerformance),
        },
        {
          permissionIsAllowed: !!enabledModules.sales,
          key: 'sales_lead',
          name: formatMessage(commonMessages.menu.salesLead),
        },
        {
          permissionIsAllowed: currentUserRole === 'app-owner',
          key: 'sales_lead_delivery',
          name: formatMessage(commonMessages.menu.salesLeadDelivery),
        },
      ],
    },
    {
      permissionIsAllowed: !!enabledModules.member_task && (permissions.TASK_ADMIN || permissions.TASK_CATEGORY_ADMIN),
      key: 'owner_task_admin',
      icon: () => <UsersIcon />,
      name: formatMessage(commonMessages.menu.taskAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: permissions.TASK_ADMIN,
          key: 'task_collection',
          name: formatMessage(commonMessages.menu.tasks),
        },
        {
          permissionIsAllowed: permissions.TASK_CATEGORY_ADMIN,
          key: 'task_category_collection',
          name: formatMessage(commonMessages.menu.taskCategory),
        },
      ],
    },
    {
      permissionIsAllowed:
        !!enabledModules.craft_page && (permissions.CRAFT_PAGE_ADMIN || permissions.CRAFT_MENU_ADMIN),
      key: 'craft_page_admin',
      icon: () => <PageIcon />,
      name: formatMessage(commonMessages.menu.pageAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: permissions.CRAFT_PAGE_ADMIN,
          key: 'craft_page_collection',
          name: formatMessage(commonMessages.menu.pageSetup),
        },
        {
          permissionIsAllowed: permissions.CRAFT_MENU_ADMIN,
          key: 'craft_menu',
          name: formatMessage(commonMessages.menu.menuSetup),
        },
      ],
    },
    {
      permissionIsAllowed: true,
      key: 'settings',
      icon: () => <UserIcon />,
      name:
        currentUserRole === 'app-owner'
          ? formatMessage(commonMessages.menu.ownerSettings)
          : currentUserRole === 'content-creator'
          ? formatMessage(commonMessages.menu.creatorSettings)
          : formatMessage(commonMessages.menu.memberSettings),
    },
    {
      permissionIsAllowed: permissions.APP_SETTING_ADMIN,
      key: 'app_admin',
      icon: () => <GlobalOutlined className="mr-0" />,
      name: formatMessage(commonMessages.menu.appAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: permissions.APP_SETTING_ADMIN,
          key: 'app_basic',
          name: formatMessage(commonMessages.menu.appBasicAdmin),
        },
        {
          permissionIsAllowed: permissions.APP_SETTING_ADMIN,
          key: 'app_setting',
          name: formatMessage(commonMessages.menu.appSettingAdmin),
        },
        {
          permissionIsAllowed: permissions.APP_SETTING_ADMIN,
          key: 'app_secret',
          name: formatMessage(commonMessages.menu.appSecretAdmin),
        },
      ],
    },
  ]

  const handleClick: MenuClickEventHandler = ({ key, item }) => {
    if (typeof key === 'string' && key.startsWith('_blank')) {
    } else {
      const route = routesMap[key]
      route ? history.push(route.path) : alert(formatMessage(errorMessages.route.notFound))
    }
  }

  return (
    <>
      {renderAdminMenu?.({
        settings,
        role: currentUserRole,
        permissions,
        menuItems: defaultMenuItems,
        onClick: handleClick,
      }) || (
        <StyledMenu
          {...menuProps}
          mode="inline"
          defaultOpenKeys={defaultMenuItems.filter(v => !isEmpty(v.subMenuItems)).map(v => v.key)}
          onClick={handleClick}
        >
          {defaultMenuItems
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
      )}
    </>
  )
}

export default AdminMenu
