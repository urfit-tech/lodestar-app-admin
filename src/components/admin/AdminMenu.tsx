import Icon, { DatabaseOutlined, GlobalOutlined, GoldenFilled, ShoppingFilled } from '@ant-design/icons'
import { Menu } from 'antd'
import { MenuProps } from 'antd/lib/menu'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { MenuClickEventHandler } from 'rc-menu/lib/interface'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { useCustomRenderer } from '../../contexts/CustomRendererContext'
import {
  BookIcon,
  CalendarAltIcon,
  CertificateIcon,
  DiscountIcon,
  MicrophoneIcon,
  MoneyCircleIcon,
  PageIcon,
  PhoneIcon,
  PointIcon,
  ProjectIcon,
  QuestionLibraryIcon,
  ShopIcon,
  UserIcon,
  UsersIcon,
} from '../../images/icon'
import { routesMap, routesProps } from '../common/AdminRouter'
import adminMessages from './translation'

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
  const [openKeys, setOpenKeys] = useState<React.Key[]>([])

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
      permissionIsAllowed: Boolean(permissions.BACKSTAGE_ENTER),
      icon: () => <MoneyCircleIcon />,
      key: 'sales',
      name: formatMessage(adminMessages.AdminMenu.salesAdmin),
    },
    {
      permissionIsAllowed: Boolean(permissions.MEDIA_LIBRARY_ADMIN),
      key: 'media_library',
      icon: () => <DatabaseOutlined className="m-0" />,
      name: formatMessage(adminMessages.AdminMenu.mediaLibrary),
    },
    {
      permissionIsAllowed:
        Boolean(permissions.PROGRAM_ADMIN) ||
        Boolean(permissions.PROGRAM_ISSUE_ADMIN) ||
        Boolean(permissions.PROGRAM_PACKAGE_ADMIN) ||
        Boolean(permissions.PROGRAM_PROGRESS_READ) ||
        Boolean(permissions.PROGRAM_PACKAGE_TEMPO_DELIVERY_ADMIN) ||
        Boolean(permissions.PROGRAM_CATEGORY_ADMIN) ||
        Boolean(permissions.PROGRAM_PACKAGE_CATEGORY_ADMIN) ||
        Boolean(permissions.PRACTICE_ADMIN) ||
        Boolean(permissions.PROGRAM_NORMAL) ||
        Boolean(permissions.PROGRAM_ISSUE_NORMAL),
      icon: () => <BookIcon />,
      key: 'program_admin',
      name: formatMessage(adminMessages.AdminMenu.programAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: Boolean(permissions.PROGRAM_ADMIN) || Boolean(permissions.PROGRAM_NORMAL),
          key: 'program_collection',
          name: formatMessage(adminMessages.AdminMenu.programs),
        },
        {
          permissionIsAllowed: Boolean(permissions.PROGRAM_ISSUE_ADMIN) || Boolean(permissions.PROGRAM_ISSUE_NORMAL),
          key: 'program_issue_collection',
          name: formatMessage(adminMessages.AdminMenu.programIssues),
        },
        {
          permissionIsAllowed:
            !!enabledModules.practice && (Boolean(permissions.PRACTICE_ADMIN) || Boolean(permissions.PRACTICE_NORMAL)),
          key: 'practice_collection',
          name: formatMessage(adminMessages.AdminMenu.practice),
        },
        {
          permissionIsAllowed: !!enabledModules.exercise,
          key: 'exercise_result',
          name: formatMessage(adminMessages.AdminMenu.exerciseResult),
        },
        {
          permissionIsAllowed: !!enabledModules.program_package && Boolean(permissions.PROGRAM_PACKAGE_ADMIN),
          key: 'program_package_collection',
          name: formatMessage(adminMessages.AdminMenu.programPackage),
        },
        {
          permissionIsAllowed: !!enabledModules.learning_statistics && Boolean(permissions.PROGRAM_PROGRESS_READ),
          key: 'program_progress',
          name: formatMessage(adminMessages.AdminMenu.programProgress),
        },
        {
          permissionIsAllowed: !!enabledModules.learning_statistics_advanced,
          key: 'learning_overview',
          name: formatMessage(adminMessages.AdminMenu.learningOverviewAdmin),
        },
        {
          permissionIsAllowed:
            !!enabledModules.tempo_delivery && Boolean(permissions.PROGRAM_PACKAGE_TEMPO_DELIVERY_ADMIN),
          key: 'program_tempo_delivery',
          name: formatMessage(adminMessages.AdminMenu.tempoDelivery),
        },
        {
          permissionIsAllowed: Boolean(permissions.PROGRAM_CATEGORY_ADMIN),
          key: 'program_category',
          name: formatMessage(adminMessages.AdminMenu.programCategory),
        },
        {
          permissionIsAllowed: !!enabledModules.program_package && Boolean(permissions.PROGRAM_PACKAGE_CATEGORY_ADMIN),
          key: 'program_package_category',
          name: formatMessage(adminMessages.AdminMenu.programPackageCategory),
        },
      ],
    },
    {
      permissionIsAllowed: !!enabledModules.question_library,
      key: 'question_library',
      icon: () => <QuestionLibraryIcon className="mr-0" />,
      name: formatMessage(adminMessages.AdminMenu.questionLibraryAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: true,
          key: 'question_library_management',
          name: formatMessage(adminMessages.AdminMenu.questionLibraryManagement),
        },
        {
          permissionIsAllowed: true,
          key: 'question_group_management',
          name: formatMessage(adminMessages.AdminMenu.questionGroupManagement),
        },
      ],
    },
    {
      permissionIsAllowed: !!enabledModules.certificate,
      key: 'certificate',
      icon: () => <CertificateIcon className="mr-0" />,
      name: formatMessage(adminMessages.AdminMenu.certificateAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: true,
          key: 'certificate_collection',
          name: formatMessage(adminMessages.AdminMenu.certificateSetting),
        },
        // {
        //   permissionIsAllowed: true,
        //   key: 'certificateTemplate',
        //   name: formatMessage(adminMessages.AdminMenu.certificateTemplate),
        // },
      ],
    },
    {
      permissionIsAllowed:
        !!enabledModules.project &&
        (Boolean(permissions.PROJECT_ADMIN) ||
          Boolean(permissions.PROJECT_FUNDING_ADMIN) ||
          Boolean(permissions.PROJECT_PRE_ORDER_ADMIN) ||
          Boolean(permissions.PROJECT_NORMAL) ||
          Boolean(permissions.PROJECT_FUNDING_NORMAL) ||
          Boolean(permissions.PROJECT_PRE_ORDER_NORMAL)),
      key: 'project_admin',
      icon: () => <ProjectIcon />,
      name: formatMessage(adminMessages.AdminMenu.projectAdmin),
      subMenuItems: [
        {
          permissionIsAllowed:
            !!enabledModules.project &&
            (Boolean(permissions.PROJECT_ADMIN) ||
              Boolean(permissions.PROJECT_FUNDING_ADMIN) ||
              Boolean(permissions.PROJECT_NORMAL) ||
              Boolean(permissions.PROJECT_FUNDING_NORMAL)),
          key: 'project_funding_collection',
          name: formatMessage(adminMessages.AdminMenu.projectFunding),
        },
        {
          permissionIsAllowed:
            !!enabledModules.project &&
            (Boolean(permissions.PROJECT_ADMIN) ||
              Boolean(permissions.PROJECT_PRE_ORDER_ADMIN) ||
              Boolean(permissions.PROJECT_NORMAL) ||
              Boolean(permissions.PROJECT_PRE_ORDER_NORMAL)),
          key: 'project_pre_order_collection',
          name: formatMessage(adminMessages.AdminMenu.projectPreOrder),
        },
        {
          permissionIsAllowed:
            !!enabledModules.project &&
            (Boolean(permissions.PROJECT_ADMIN) ||
              Boolean(permissions.PROJECT_PORTFOLIO_ADMIN) ||
              Boolean(permissions.PROJECT_NORMAL) ||
              Boolean(permissions.PROJECT_PORTFOLIO_NORMAL)),
          key: 'project_portfolio_collection',
          name: formatMessage(adminMessages.AdminMenu.projectPortfolio),
        },
        {
          permissionIsAllowed: !!enabledModules.project && Boolean(permissions.PROJECT_CATEGORY_ADMIN),
          key: 'project_category',
          name: formatMessage(adminMessages.AdminMenu.projectCategory),
        },
        {
          permissionIsAllowed:
            !!enabledModules.project && !!enabledModules.project_role && Boolean(permissions.PROJECT_ROLE_ADMIN),
          key: 'project_roles',
          name: formatMessage(adminMessages.AdminMenu.projectRole),
        },
        {
          // Not yet applied
          permissionIsAllowed: false,
          key: 'project_on_sale_collection',
          name: formatMessage(adminMessages.AdminMenu.projectOnSale),
        },
      ],
    },
    {
      permissionIsAllowed:
        !!enabledModules.podcast && (Boolean(permissions.PODCAST_ADMIN) || Boolean(permissions.PODCAST_NORMAL)),
      key: 'podcast_admin',
      icon: () => <MicrophoneIcon />,
      name: formatMessage(adminMessages.AdminMenu.podcastAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: true,
          key: 'podcast_program_collection',
          name: formatMessage(adminMessages.AdminMenu.podcastPrograms),
        },
        {
          permissionIsAllowed: true,
          key: 'podcast_plan',
          name: formatMessage(adminMessages.AdminMenu.podcastPlans),
        },
        {
          permissionIsAllowed: true,
          key: 'podcast_program_category',
          name: formatMessage(adminMessages.AdminMenu.podcastCategory),
        },
        {
          permissionIsAllowed: Boolean(permissions.PODCAST_ALBUM_ADMIN),
          key: 'podcast_album_collection',
          name: formatMessage(adminMessages.AdminMenu.podcastAlbum),
        },
        {
          permissionIsAllowed: Boolean(permissions.PODCAST_ALBUM_CATEGORY_ADMIN),
          key: 'podcast_album_category',
          name: formatMessage(adminMessages.AdminMenu.podcastAlbumCategory),
        },
      ],
    },
    {
      permissionIsAllowed:
        !!enabledModules.appointment &&
        (Boolean(permissions.APPOINTMENT_PLAN_ADMIN) ||
          Boolean(permissions.APPOINTMENT_PERIOD_ADMIN) ||
          Boolean(permissions.APPOINTMENT_PLAN_NORMAL) ||
          Boolean(permissions.APPOINTMENT_PERIOD_NORMAL)),
      key: 'appointment_admin',
      icon: () => <CalendarAltIcon />,
      name: formatMessage(adminMessages.AdminMenu.appointmentAdmin),
      subMenuItems: [
        {
          permissionIsAllowed:
            Boolean(permissions.APPOINTMENT_PLAN_ADMIN) || Boolean(permissions.APPOINTMENT_PLAN_NORMAL),
          key: 'appointment_plan_collection',
          name: formatMessage(adminMessages.AdminMenu.appointmentPlans),
        },
        {
          permissionIsAllowed:
            Boolean(permissions.APPOINTMENT_PERIOD_ADMIN) || Boolean(permissions.APPOINTMENT_PERIOD_NORMAL),
          key: 'appointment_period_collection',
          name: formatMessage(adminMessages.AdminMenu.appointments),
        },
      ],
    },
    {
      permissionIsAllowed: !!enabledModules.creator_display && currentUserRole === 'app-owner',
      key: 'creator_display_admin',
      icon: () => <UsersIcon />,
      name: formatMessage(adminMessages.AdminMenu.creatorDisplayAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: true,
          key: 'creator_collection',
          name: formatMessage(adminMessages.AdminMenu.creatorDisplayManagement),
        },
        {
          permissionIsAllowed: true,
          key: 'creator_category',
          name: formatMessage(adminMessages.AdminMenu.creatorDisplayCategory),
        },
      ],
    },
    {
      permissionIsAllowed:
        !!enabledModules.activity &&
        (Boolean(permissions.ACTIVITY_ADMIN) ||
          Boolean(permissions.ACTIVITY_CATEGORY_ADMIN) ||
          Boolean(permissions.ACTIVITY_NORMAL)),
      key: 'activity_admin',
      icon: () => <CalendarAltIcon />,
      name: formatMessage(adminMessages.AdminMenu.activityAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: Boolean(permissions.ACTIVITY_ADMIN) || Boolean(permissions.ACTIVITY_NORMAL),
          key: 'activity_collection',
          name: formatMessage(adminMessages.AdminMenu.activities),
        },
        {
          permissionIsAllowed: Boolean(permissions.ACTIVITY_CATEGORY_ADMIN),
          key: 'activity_category',
          name: formatMessage(adminMessages.AdminMenu.activityCategory),
        },
        {
          permissionIsAllowed: !!enabledModules.venue,
          key: 'venue_collection',
          name: formatMessage(adminMessages.AdminMenu.venueManagement),
        },
      ],
    },
    {
      permissionIsAllowed:
        !!enabledModules.blog &&
        (Boolean(permissions.POST_ADMIN) ||
          Boolean(permissions.POST_CATEGORY_ADMIN) ||
          Boolean(permissions.POST_NORMAL)),
      key: 'blog_admin',
      icon: () => <ShoppingFilled className="mr-0" />,
      name: formatMessage(adminMessages.AdminMenu.blogAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: Boolean(permissions.POST_ADMIN) || Boolean(permissions.POST_NORMAL),
          key: 'blog_collection',
          name: formatMessage(adminMessages.AdminMenu.blogPosts),
        },
        {
          permissionIsAllowed: Boolean(permissions.POST_CATEGORY_ADMIN),
          key: 'blog_category',
          name: formatMessage(adminMessages.AdminMenu.blogCategory),
        },
      ],
    },
    {
      permissionIsAllowed:
        !!enabledModules.merchandise &&
        (Boolean(permissions.MERCHANDISE_ADMIN) || Boolean(permissions.MERCHANDISE_NORMAL)),
      key: 'merchandise_admin',
      icon: () => <ShopIcon />,
      name: formatMessage(adminMessages.AdminMenu.eCommerce),
      subMenuItems: [
        {
          permissionIsAllowed: true,
          key: 'merchandise_shop_collection',
          name: formatMessage(adminMessages.AdminMenu.merchandiseShop),
        },
        {
          permissionIsAllowed: true,
          key: 'merchandise_inventory',
          name: formatMessage(adminMessages.AdminMenu.merchandiseInventory),
        },
        {
          permissionIsAllowed: Boolean(permissions.MERCHANDISE_CATEGORY_ADMIN),
          key: 'merchandise_category',
          name: formatMessage(adminMessages.AdminMenu.merchandiseCategory),
        },
      ],
    },
    {
      permissionIsAllowed:
        (!!enabledModules.merchandise || !!enabledModules.project) &&
        (Boolean(permissions.SHIPPING_ADMIN) || Boolean(permissions.SHIPPING_NORMAL)),
      key: 'shipping',
      icon: () => <GoldenFilled className="mr-0" />,
      name: formatMessage(adminMessages.AdminMenu.shipping),
    },
    {
      permissionIsAllowed:
        Boolean(permissions.COUPON_PLAN_ADMIN) ||
        Boolean(permissions.COUPON_PLAN_NORMAL) ||
        Boolean(permissions.VOUCHER_PLAN_ADMIN) ||
        Boolean(permissions.VOUCHER_PLAN_NORMAL) ||
        Boolean(permissions.GIFT_PLAN_ADMIN) ||
        Boolean(permissions.GIFT_PLAN_NORMAL),
      key: 'promotion_admin',
      icon: () => <DiscountIcon />,
      name: formatMessage(adminMessages.AdminMenu.promotionAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: Boolean(permissions.COUPON_PLAN_ADMIN) || Boolean(permissions.COUPON_PLAN_NORMAL),
          key: 'coupon_plans',
          name: formatMessage(adminMessages.AdminMenu.coupons),
        },
        {
          permissionIsAllowed:
            !!enabledModules.voucher &&
            (Boolean(permissions.VOUCHER_PLAN_ADMIN) || Boolean(permissions.VOUCHER_PLAN_NORMAL)),
          key: 'voucher_plans',
          name: formatMessage(adminMessages.AdminMenu.vouchers),
        },
        {
          permissionIsAllowed:
            !!enabledModules.gift && (Boolean(permissions.GIFT_PLAN_ADMIN) || Boolean(permissions.GIFT_PLAN_NORMAL)),
          key: 'gift_plans',
          name: formatMessage(adminMessages.AdminMenu.gift),
        },
      ],
    },
    {
      permissionIsAllowed: !!enabledModules.coin && Boolean(permissions.COIN_ADMIN),
      key: 'credit_admin',
      icon: () => <PointIcon />,
      name: formatMessage(adminMessages.AdminMenu.creditAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: true,
          key: 'coin_history',
          name: formatMessage(adminMessages.AdminMenu.coinHistory),
        },
      ],
    },
    {
      permissionIsAllowed: Boolean(permissions.MEMBER_ADMIN) || Boolean(permissions.MEMBER_PROPERTY_ADMIN),
      key: 'member_admin',
      icon: () => <UsersIcon />,
      name: formatMessage(adminMessages.AdminMenu.memberAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: Boolean(permissions.MEMBER_ADMIN),
          key: 'members',
          name: formatMessage(adminMessages.AdminMenu.members),
        },
        {
          permissionIsAllowed: !!enabledModules.permission_group && Boolean(permissions.PERMISSION_GROUP_ADMIN),
          key: 'permission_group',
          name: formatMessage(adminMessages.AdminMenu.permissionGroup),
        },
        {
          permissionIsAllowed: Boolean(permissions.MEMBER_CATEGORY_ADMIN),
          key: 'member_category',
          name: formatMessage(adminMessages.AdminMenu.memberCategory),
        },
        {
          permissionIsAllowed: !!enabledModules.member_property && Boolean(permissions.MEMBER_PROPERTY_ADMIN),
          key: 'member_properties',
          name: formatMessage(adminMessages.AdminMenu.memberProperties),
        },
      ],
    },
    {
      permissionIsAllowed: !!enabledModules.member_note && Boolean(permissions.MEMBER_NOTE_ADMIN),
      key: 'note_collection',
      icon: () => <UsersIcon />,
      name: formatMessage(adminMessages.AdminMenu.noteAdmin),
    },
    {
      permissionIsAllowed:
        !!enabledModules.sales &&
        (Boolean(permissions.SALES_PERFORMANCE_ADMIN) ||
          Boolean(permissions.SALES_LEAD_ADMIN) ||
          Boolean(permissions.SALES_LEAD_DELIVERY_ADMIN)),
      key: 'sales_management',
      icon: () => <PhoneIcon />,
      name: formatMessage(adminMessages.AdminMenu.salesManagement),
      subMenuItems: [
        {
          permissionIsAllowed: !!enabledModules.sales && Boolean(permissions.SALES_PERFORMANCE_ADMIN),
          key: 'sales_performance',
          name: formatMessage(adminMessages.AdminMenu.salesPerformance),
        },
        {
          permissionIsAllowed: !!enabledModules.sales && Boolean(permissions.SALES_LEAD_ADMIN),
          key: 'sales_lead',
          name: formatMessage(adminMessages.AdminMenu.salesLead),
        },
        {
          permissionIsAllowed: Boolean(permissions.SALES_LEAD_DELIVERY_ADMIN),
          key: 'sales_lead_delivery',
          name: formatMessage(adminMessages.AdminMenu.salesLeadDelivery),
        },
      ],
    },
    {
      permissionIsAllowed:
        !!enabledModules.member_task && (Boolean(permissions.TASK_ADMIN) || Boolean(permissions.TASK_CATEGORY_ADMIN)),
      key: 'task_admin',
      icon: () => <UsersIcon />,
      name: formatMessage(adminMessages.AdminMenu.taskAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: Boolean(permissions.TASK_ADMIN),
          key: 'task_collection',
          name: formatMessage(adminMessages.AdminMenu.tasks),
        },
        {
          permissionIsAllowed: Boolean(permissions.TASK_CATEGORY_ADMIN),
          key: 'task_category_collection',
          name: formatMessage(adminMessages.AdminMenu.taskCategory),
        },
      ],
    },
    {
      permissionIsAllowed:
        !!enabledModules.craft_page &&
        (Boolean(permissions.CRAFT_PAGE_ADMIN) ||
          Boolean(permissions.CRAFT_PAGE_NORMAL) ||
          Boolean(permissions.CRAFT_MENU_ADMIN)),
      key: 'craft_page_admin',
      icon: () => <PageIcon />,
      name: formatMessage(adminMessages.AdminMenu.pageAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: Boolean(permissions.CRAFT_PAGE_ADMIN) || Boolean(permissions.CRAFT_PAGE_NORMAL),
          key: 'craft_page_collection',
          name: formatMessage(adminMessages.AdminMenu.pageSetup),
        },
        // {
        //   permissionIsAllowed: permissions.CRAFT_MENU_ADMIN,
        //   key: 'craft_menu',
        //   name: formatMessage(adminMessages.AdminMenu.menuSetup),
        // },
      ],
    },
    {
      permissionIsAllowed: true,
      key: 'settings',
      icon: () => <UserIcon />,
      name:
        currentUserRole === 'app-owner'
          ? formatMessage(adminMessages.AdminMenu.ownerSettings)
          : currentUserRole === 'content-creator'
          ? formatMessage(adminMessages.AdminMenu.creatorSettings)
          : formatMessage(adminMessages.AdminMenu.memberSettings),
    },
    {
      permissionIsAllowed: Boolean(permissions.APP_SETTING_ADMIN),
      key: 'app_admin',
      icon: () => <GlobalOutlined className="mr-0" />,
      name: formatMessage(adminMessages.AdminMenu.appAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: Boolean(permissions.APP_SETTING_ADMIN),
          key: 'app_basic',
          name: formatMessage(adminMessages.AdminMenu.appBasicAdmin),
        },
        {
          permissionIsAllowed: Boolean(permissions.APP_SETTING_ADMIN),
          key: 'app_setting',
          name: formatMessage(adminMessages.AdminMenu.appSettingAdmin),
        },
        {
          permissionIsAllowed: Boolean(permissions.APP_SETTING_ADMIN),
          key: 'app_secret',
          name: formatMessage(adminMessages.AdminMenu.appSecretAdmin),
        },
      ],
    },
  ]

  const handleClick: MenuClickEventHandler = ({ key, item }) => {
    if (typeof key === 'string' && key.startsWith('_blank')) {
    } else {
      const route = routesMap[key as keyof typeof routesProps]
      route ? history.push(route.path) : alert(formatMessage(adminMessages.AdminMenu.notFound))
    }
  }

  const handleOpenChange = (keys: React.Key[]) => {
    const latestOpenKey = keys.find(key => openKeys.indexOf(key) === -1)
    if (
      defaultMenuItems
        .filter(v => v.permissionIsAllowed && v.subMenuItems)
        .find(menuItem => menuItem.key === latestOpenKey)
    ) {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : [])
    } else {
      setOpenKeys(keys)
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
          openKeys={openKeys.map(key => key.toString())}
          onOpenChange={handleOpenChange}
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
                      <span className="d-flex">
                        <Icon component={v.icon} className="d-flex align-items-center" />
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
                <Menu.Item key={v.key} className="d-flex">
                  <Icon component={v.icon} className="d-flex align-items-center" />
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
