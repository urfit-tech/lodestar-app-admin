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
  DiscountIcon,
  MicrophoneIcon,
  MoneyCircleIcon,
  PageIcon,
  PhoneIcon,
  PointIcon,
  ProjectIcon,
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
      permissionIsAllowed: permissions.BACKSTAGE_ENTER,
      icon: () => <MoneyCircleIcon />,
      key: 'sales',
      name: formatMessage(adminMessages.AdminMenu.salesAdmin),
    },
    {
      permissionIsAllowed: permissions.MEDIA_LIBRARY_ADMIN,
      key: 'media_library',
      icon: () => <DatabaseOutlined className="m-0" />,
      name: formatMessage(adminMessages.AdminMenu.mediaLibrary),
    },
    {
      permissionIsAllowed:
        permissions.PROGRAM_ADMIN ||
        permissions.PROGRAM_ISSUE_ADMIN ||
        permissions.PROGRAM_PACKAGE_ADMIN ||
        permissions.PROGRAM_PROGRESS_READ ||
        permissions.PROGRAM_PACKAGE_TEMPO_DELIVERY_ADMIN ||
        permissions.PROGRAM_CATEGORY_ADMIN ||
        permissions.PROGRAM_PACKAGE_CATEGORY_ADMIN ||
        permissions.PRACTICE_ADMIN ||
        permissions.PROGRAM_NORMAL ||
        permissions.PROGRAM_ISSUE_NORMAL,
      icon: () => <BookIcon />,
      key: 'program_admin',
      name: formatMessage(adminMessages.AdminMenu.programAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: permissions.PROGRAM_ADMIN,
          key: 'program_collection',
          name: formatMessage(adminMessages.AdminMenu.programs),
        },
        {
          permissionIsAllowed: permissions.PROGRAM_ISSUE_ADMIN || permissions.PROGRAM_ISSUE_NORMAL,
          key: 'program_issue_collection',
          name: formatMessage(adminMessages.AdminMenu.programIssues),
        },
        {
          permissionIsAllowed: !!enabledModules.practice && (permissions.PRACTICE_ADMIN || permissions.PRACTICE_NORMAL),
          key: 'practice_collection',
          name: formatMessage(adminMessages.AdminMenu.practice),
        },
        {
          permissionIsAllowed: !!enabledModules.exercise,
          key: 'exercise_result',
          name: formatMessage(adminMessages.AdminMenu.exerciseResult),
        },
        {
          permissionIsAllowed: !!enabledModules.program_package && permissions.PROGRAM_PACKAGE_ADMIN,
          key: 'program_package_collection',
          name: formatMessage(adminMessages.AdminMenu.programPackage),
        },
        {
          permissionIsAllowed: !!enabledModules.learning_statistics && permissions.PROGRAM_PROGRESS_READ,
          key: 'program_progress',
          name: formatMessage(adminMessages.AdminMenu.programProgress),
        },
        {
          permissionIsAllowed: !!enabledModules.learning_statistics_advanced,
          key: 'learning_overview',
          name: formatMessage(adminMessages.AdminMenu.learningOverviewAdmin),
        },
        {
          permissionIsAllowed: !!enabledModules.tempo_delivery && permissions.PROGRAM_PACKAGE_TEMPO_DELIVERY_ADMIN,
          key: 'program_tempo_delivery',
          name: formatMessage(adminMessages.AdminMenu.tempoDelivery),
        },
        {
          permissionIsAllowed: permissions.PROGRAM_CATEGORY_ADMIN,
          key: 'program_category',
          name: formatMessage(adminMessages.AdminMenu.programCategory),
        },
        {
          permissionIsAllowed: !!enabledModules.program_package && permissions.PROGRAM_PACKAGE_CATEGORY_ADMIN,
          key: 'program_package_category',
          name: formatMessage(adminMessages.AdminMenu.programPackageCategory),
        },
      ],
    },
    {
      permissionIsAllowed: !!enabledModules.project && permissions.PROJECT_ADMIN,
      key: 'project_admin',
      icon: () => <ProjectIcon />,
      name: formatMessage(adminMessages.AdminMenu.projectAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: true,
          key: 'project_funding_collection',
          name: formatMessage(adminMessages.AdminMenu.projectFunding),
        },
        {
          permissionIsAllowed: true,
          key: 'project_pre_order_collection',
          name: formatMessage(adminMessages.AdminMenu.projectPreOrder),
        },
        {
          permissionIsAllowed: false,
          key: 'project_on_sale_collection',
          name: formatMessage(adminMessages.AdminMenu.projectOnSale),
        },
      ],
    },
    {
      permissionIsAllowed: !!enabledModules.podcast && (permissions.PODCAST_ADMIN || permissions.PODCAST_NORMAL),
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
          permissionIsAllowed: permissions.PODCAST_ALBUM_ADMIN,
          key: 'podcast_album_collection',
          name: formatMessage(adminMessages.AdminMenu.podcastAlbum),
        },
        {
          permissionIsAllowed: permissions.PODCAST_ALBUM_CATEGORY_ADMIN,
          key: 'podcast_album_category',
          name: formatMessage(adminMessages.AdminMenu.podcastAlbumCategory),
        },
      ],
    },
    {
      permissionIsAllowed:
        !!enabledModules.appointment &&
        (permissions.APPOINTMENT_PLAN_ADMIN ||
          permissions.APPOINTMENT_PERIOD_ADMIN ||
          permissions.APPOINTMENT_PLAN_NORMAL ||
          permissions.APPOINTMENT_PERIOD_NORMAL),
      key: 'appointment_admin',
      icon: () => <CalendarAltIcon />,
      name: formatMessage(adminMessages.AdminMenu.appointmentAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: permissions.APPOINTMENT_PLAN_ADMIN || permissions.APPOINTMENT_PLAN_NORMAL,
          key: 'appointment_plan_collection',
          name: formatMessage(adminMessages.AdminMenu.appointmentPlans),
        },
        {
          permissionIsAllowed: permissions.APPOINTMENT_PERIOD_ADMIN || permissions.APPOINTMENT_PERIOD_NORMAL,
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
        !!enabledModules.activity && (permissions.ACTIVITY_ADMIN || permissions.ACTIVITY_CATEGORY_ADMIN),
      key: 'activity_admin',
      icon: () => <CalendarAltIcon />,
      name: formatMessage(adminMessages.AdminMenu.activityAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: permissions.ACTIVITY_ADMIN,
          key: 'activity_collection',
          name: formatMessage(adminMessages.AdminMenu.activities),
        },
        {
          permissionIsAllowed: permissions.ACTIVITY_CATEGORY_ADMIN,
          key: 'activity_category',
          name: formatMessage(adminMessages.AdminMenu.activityCategory),
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
      key: 'blog_admin',
      icon: () => <ShoppingFilled className="mr-0" />,
      name: formatMessage(adminMessages.AdminMenu.blogAdmin),
      subMenuItems: [
        {
          permissionIsAllowed:
            currentUserRole === 'app-owner' || currentUserRole === 'content-creator' || permissions.POST_ADMIN,
          key: 'blog_collection',
          name: formatMessage(adminMessages.AdminMenu.blogPosts),
        },
        {
          permissionIsAllowed: currentUserRole === 'app-owner' || permissions.POST_CATEGORY_ADMIN,
          key: 'blog_category',
          name: formatMessage(adminMessages.AdminMenu.blogCategory),
        },
      ],
    },
    {
      permissionIsAllowed:
        !!enabledModules.merchandise && (currentUserRole === 'app-owner' || currentUserRole === 'content-creator'),
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
          permissionIsAllowed: true,
          key: 'merchandise_category',
          name: formatMessage(adminMessages.AdminMenu.merchandiseCategory),
        },
      ],
    },
    {
      permissionIsAllowed:
        (!!enabledModules.merchandise || !!enabledModules.project) &&
        (currentUserRole === 'app-owner' || currentUserRole === 'content-creator'),
      key: 'shipping',
      icon: () => <GoldenFilled className="mr-0" />,
      name: formatMessage(adminMessages.AdminMenu.shipping),
    },
    {
      permissionIsAllowed: permissions.COUPON_PLAN_ADMIN || permissions.VOUCHER_PLAN_ADMIN,
      key: 'promotion_admin',
      icon: () => <DiscountIcon />,
      name: formatMessage(adminMessages.AdminMenu.promotionAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: permissions.COUPON_PLAN_ADMIN,
          key: 'coupon_plans',
          name: formatMessage(adminMessages.AdminMenu.coupons),
        },
        {
          permissionIsAllowed: !!enabledModules.voucher && permissions.VOUCHER_PLAN_ADMIN,
          key: 'voucher_plans',
          name: formatMessage(adminMessages.AdminMenu.vouchers),
        },
      ],
    },
    {
      permissionIsAllowed: !!enabledModules.coin && permissions.COIN_ADMIN,
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
      permissionIsAllowed: permissions.MEMBER_ADMIN || permissions.MEMBER_PROPERTY_ADMIN,
      key: 'member_admin',
      icon: () => <UsersIcon />,
      name: formatMessage(adminMessages.AdminMenu.memberAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: permissions.MEMBER_ADMIN,
          key: 'members',
          name: formatMessage(adminMessages.AdminMenu.members),
        },
        {
          permissionIsAllowed: !!enabledModules.permission_group && currentUserRole === 'app-owner',
          key: 'permission_group',
          name: formatMessage(adminMessages.AdminMenu.permissionGroup),
        },
        {
          permissionIsAllowed: permissions.MEMBER_CATEGORY_ADMIN,
          key: 'member_category',
          name: formatMessage(adminMessages.AdminMenu.memberCategory),
        },
        {
          permissionIsAllowed: !!enabledModules.member_property && permissions.MEMBER_PROPERTY_ADMIN,
          key: 'member_properties',
          name: formatMessage(adminMessages.AdminMenu.memberProperties),
        },
      ],
    },
    {
      permissionIsAllowed: !!enabledModules.member_note && currentUserRole === 'app-owner',
      key: 'note_collection',
      icon: () => <UsersIcon />,
      name: formatMessage(adminMessages.AdminMenu.noteAdmin),
    },
    {
      permissionIsAllowed: !!enabledModules.sales,
      key: 'sales_management',
      icon: () => <PhoneIcon />,
      name: formatMessage(adminMessages.AdminMenu.salesManagement),
      subMenuItems: [
        {
          permissionIsAllowed: !!enabledModules.sales,
          key: 'sales_performance',
          name: formatMessage(adminMessages.AdminMenu.salesPerformance),
        },
        {
          permissionIsAllowed: !!enabledModules.sales,
          key: 'sales_lead',
          name: formatMessage(adminMessages.AdminMenu.salesLead),
        },
        {
          permissionIsAllowed: currentUserRole === 'app-owner',
          key: 'sales_lead_delivery',
          name: formatMessage(adminMessages.AdminMenu.salesLeadDelivery),
        },
      ],
    },
    {
      permissionIsAllowed: !!enabledModules.member_task && (permissions.TASK_ADMIN || permissions.TASK_CATEGORY_ADMIN),
      key: 'task_admin',
      icon: () => <UsersIcon />,
      name: formatMessage(adminMessages.AdminMenu.taskAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: permissions.TASK_ADMIN,
          key: 'task_collection',
          name: formatMessage(adminMessages.AdminMenu.tasks),
        },
        {
          permissionIsAllowed: permissions.TASK_CATEGORY_ADMIN,
          key: 'task_category_collection',
          name: formatMessage(adminMessages.AdminMenu.taskCategory),
        },
      ],
    },
    {
      permissionIsAllowed:
        !!enabledModules.craft_page && (permissions.CRAFT_PAGE_ADMIN || permissions.CRAFT_MENU_ADMIN),
      key: 'craft_page_admin',
      icon: () => <PageIcon />,
      name: formatMessage(adminMessages.AdminMenu.pageAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: permissions.CRAFT_PAGE_ADMIN,
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
      permissionIsAllowed: permissions.APP_SETTING_ADMIN,
      key: 'app_admin',
      icon: () => <GlobalOutlined className="mr-0" />,
      name: formatMessage(adminMessages.AdminMenu.appAdmin),
      subMenuItems: [
        {
          permissionIsAllowed: permissions.APP_SETTING_ADMIN,
          key: 'app_basic',
          name: formatMessage(adminMessages.AdminMenu.appBasicAdmin),
        },
        {
          permissionIsAllowed: permissions.APP_SETTING_ADMIN,
          key: 'app_setting',
          name: formatMessage(adminMessages.AdminMenu.appSettingAdmin),
        },
        {
          permissionIsAllowed: permissions.APP_SETTING_ADMIN,
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
