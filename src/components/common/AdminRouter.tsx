import dayjs from 'dayjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { UserRole } from 'lodestar-app-element/src/types/data'
import { filter } from 'ramda'
import React, { Suspense } from 'react'
import { BrowserRouter, Redirect, Route, Switch, useRouteMatch } from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params'
import LoadingPage from '../../pages/LoadingPage'
import NotFoundPage from '../../pages/NotFoundPage'

export type RouteProps = {
  path: string
  pageName: string | JSX.Element
  authenticated: boolean
  allowedUserRole?: UserRole
}
export const routesProps = {
  // all users
  home: {
    path: '/',
    pageName: 'HomePage',
    authenticated: false,
  },
  forgot_password: {
    path: '/forgot-password',
    pageName: 'ForgotPasswordPage',
    authenticated: false,
  },
  check_email: {
    path: '/check-email',
    pageName: 'CheckEmailPage',
    authenticated: false,
  },
  reset_password: {
    path: '/reset-password',
    pageName: 'ResetPasswordPage',
    authenticated: false,
  },
  reset_password_success: {
    path: '/reset-password-success',
    pageName: 'ResetPasswordSuccessPage',
    authenticated: false,
  },
  loading: {
    path: '/loading',
    pageName: 'LoadingPage',
    authenticated: false,
  },
  terms: {
    path: '/terms',
    pageName: 'TermsPage',
    authenticated: false,
  },
  notification: {
    path: '/notifications',
    pageName: 'NotificationPage',
    authenticated: false,
  },
  shipping: {
    path: '/shipping',
    pageName: 'ShippingAdminPage',
    authenticated: true,
  },
  settings: {
    path: '/settings',
    pageName: 'SettingAdminPage',
    authenticated: true,
  },
  media_library: {
    path: '/media-library',
    pageName: 'MediaLibraryPage',
    authenticated: true,
  },

  // program
  program_collection: {
    path: '/programs',
    pageName: 'ProgramCollectionAdminPage',
    authenticated: true,
  },
  program: {
    path: '/programs/:programId',
    pageName: 'ProgramAdminPage',
    authenticated: true,
  },
  program_issue_collection: {
    path: '/program-issues',
    pageName: 'ProgramIssueCollectionAdminPage',
    authenticated: true,
  },
  practice_collection: {
    path: '/practices',
    pageName: 'PracticeCollectionAdminPage',
    authenticated: true,
  },
  exercise_result: {
    path: '/exercise-result',
    pageName: 'ExerciseResultPage',
    authenticated: true,
  },
  program_package_collection: {
    path: '/program-packages',
    pageName: 'ProgramPackageCollectionAdminPage',
    authenticated: true,
  },
  program_package: {
    path: '/program-packages/:programPackageId',
    pageName: 'ProgramPackageAdminPage',
    authenticated: true,
  },
  program_progress: {
    path: '/program-progress',
    pageName: 'ProgramProgressCollectionAdminPage',
    authenticated: true,
  },
  program_tempo_delivery: {
    path: '/program-tempo-delivery',
    pageName: 'ProgramTempoDeliveryAdminPage',
    authenticated: true,
  },
  program_category: {
    path: '/program-category',
    pageName: 'ProgramCategoryPage',
    authenticated: true,
  },
  program_package_category: {
    path: '/program-package-category',
    pageName: 'ProgramPackageCategoryPage',
    authenticated: true,
  },

  // question_library
  question_library_management: {
    path: '/question-libraries',
    pageName: 'QuestionLibraryCollectionPage',
    authenticated: true,
  },
  question_library: {
    path: '/question-libraries/:questionLibraryId',
    pageName: 'QuestionLibraryAdminPage',
    authenticated: true,
  },
  question_group_management: {
    path: '/question-groups',
    pageName: 'QuestionGroupCollectionPage',
    authenticated: true,
  },
  question_group: {
    path: '/question-groups/:questionGroupId',
    pageName: 'QuestionGroupAdminPage',
    authenticated: true,
  },
  //project
  project: {
    path: '/projects/:projectId',
    pageName: 'ProjectAdminPage',
    authenticated: true,
  },
  project_funding_collection: {
    path: '/project-funding',
    pageName: 'ProjectFundingPage',
    authenticated: true,
  },
  project_pre_order_collection: {
    path: '/project-pre-order',
    pageName: 'ProjectPreOrderPage',
    authenticated: true,
  },
  project_portfolio_collection: {
    path: '/project-portfolio',
    pageName: 'ProjectPortfolioPage',
    authenticated: true,
  },
  project_category: {
    path: '/project-category',
    pageName: 'ProjectCategoryPage',
    authenticated: true,
  },
  project_roles: {
    path: '/project-roles',
    pageName: 'ProjectRolePage',
    authenticated: true,
  },
  // podcast program
  podcast_program_collection: {
    path: '/podcast-programs',
    pageName: 'PodcastProgramCollectionAdminPage',
    authenticated: true,
  },
  podcast_program: {
    path: '/podcast-programs/:podcastProgramId',
    pageName: 'PodcastProgramAdminPage',
    authenticated: true,
  },
  recording: {
    path: '/podcast-programs/:podcastProgramId/recording',
    pageName: 'RecordingPage',
    authenticated: true,
  },
  podcast_plan: {
    path: '/podcast-plan',
    pageName: 'PodcastPlanAdminPage',
    authenticated: true,
  },
  podcast_program_category: {
    path: '/podcast-program-category',
    pageName: 'PodcastProgramCategoryPage',
    authenticated: true,
  },
  podcast_album_collection: {
    path: '/podcast-albums',
    pageName: 'PodcastAlbumCollectionAdminPage',
    authenticated: true,
  },
  podcast_album: {
    path: '/podcast-albums/:podcastAlbumId',
    pageName: 'PodcastAlbumAdminPage',
    authenticated: true,
  },
  podcast_album_category: {
    path: '/podcast-album-category',
    pageName: 'PodcastAlbumCategoryPage',
    authenticated: true,
  },

  // appointment
  appointment_plan_collection: {
    path: '/appointment-plans',
    pageName: 'AppointmentPlanCollectionAdminPage',
    authenticated: true,
  },
  appointment_plan: {
    path: '/appointment-plans/:appointmentPlanId',
    pageName: 'AppointmentPlanAdminPage',
    authenticated: true,
  },
  appointment_period_collection: {
    path: '/appointment-periods',
    pageName: 'AppointmentPeriodCollectionAdminPage',
    authenticated: true,
  },

  // activity
  activity_collection: {
    path: '/activities',
    pageName: 'ActivityCollectionAdminPage',
    authenticated: true,
  },
  activity: {
    path: '/activities/:activityId',
    pageName: 'ActivityAdminPage',
    authenticated: true,
  },
  activity_category: {
    path: '/activity-category',
    pageName: 'ActivityCategoryPage',
    authenticated: true,
  },
  venue_collection: {
    path: '/venue-management',
    pageName: 'VenueCollectionPage',
    authenticated: true,
  },
  venue_management: {
    path: '/venue-management/:venueId',
    pageName: 'VenueAdminPage',
    authenticated: true,
  },
  // blog
  blog_collection: {
    path: '/blog',
    pageName: 'BlogCollectionAdminPage',
    authenticated: true,
  },
  blog: {
    path: '/blog/:postId',
    pageName: 'BlogAdminPage',
    authenticated: true,
  },
  blog_category: {
    path: '/blog-post-category',
    pageName: 'BlogPostCategoryPage',
    authenticated: true,
  },

  // merchandise
  merchandise_shop_collection: {
    path: '/member-shops',
    pageName: 'MemberShopCollectionAdminPage',
    authenticated: true,
  },
  merchandise_shop: {
    path: '/member-shops/:shopId',
    pageName: 'MemberShopAdminPage',
    authenticated: true,
  },
  merchandise_shop_info: {
    path: '/member-shops/:shopId/info',
    pageName: 'MemberShopInfoAdminPage',
    authenticated: true,
  },
  merchandise_shop_shipping_methods: {
    path: '/member-shops/:shopId/shipping-methods',
    pageName: 'MemberShopShippingAdminPage',
    authenticated: true,
  },
  merchandise_shop_publish: {
    path: '/member-shops/:shopId/publish',
    pageName: 'MemberShopPublishAdminPage',
    authenticated: true,
  },
  merchandise: {
    path: '/merchandises/:merchandiseId',
    pageName: 'MerchandiseAdminPage',
    authenticated: true,
  },
  merchandise_inventory: {
    path: '/merchandise-inventory',
    pageName: 'MerchandiseInventoryPage',
    authenticated: true,
  },
  merchandise_category: {
    path: '/merchandise-category',
    pageName: 'MerchandiseCategoryPage',
    authenticated: true,
  },

  // note
  note_collection: {
    path: '/notes',
    pageName: 'NoteCollectionPage',
    authenticated: true,
  },

  // sales
  sales_performance: {
    path: '/sales/performance',
    pageName: 'SalesPerformancePage',
    authenticated: true,
  },
  sales_lead: {
    path: '/sales/lead',
    pageName: 'SalesLeadPage',
    authenticated: true,
  },
  sales_lead_delivery: {
    path: '/sales/lead-delivery',
    pageName: 'SalesLeadDeliveryPage',
    authenticated: true,
  },

  // task
  task_collection: {
    path: '/tasks',
    pageName: 'TaskCollectionPage',
    authenticated: true,
  },
  task_category_collection: {
    path: '/task-category',
    pageName: 'TaskCategoryCollectionPage',
    authenticated: true,
  },
  // certificate_collection
  certificate_collection: {
    path: '/certificates',
    pageName: 'CertificateCollectionPage',
    authenticated: true,
  },
  certificate: {
    path: '/certificates/:certificateId',
    pageName: 'CertificateAdminPage',
    authenticated: true,
  },
  // member
  member_admin: {
    path: '/members/:memberId',
    pageName: 'MemberAdminPage',
    authenticated: true,
  },
  member_profile_admin: {
    path: '/members/:memberId/profile',
    pageName: 'MemberAdminPage',
    authenticated: true,
  },
  member_note_admin: {
    path: '/members/:memberId/note',
    pageName: 'MemberAdminPage',
    authenticated: true,
  },
  member_task_admin: {
    path: '/members/:memberId/task',
    pageName: 'MemberAdminPage',
    authenticated: true,
  },
  member_timetable_admin: {
    path: '/members/:memberId/timetable',
    pageName: 'MemberAdminPage',
    authenticated: true,
  },
  member_coupon_admin: {
    path: '/members/:memberId/coupon',
    pageName: 'MemberAdminPage',
    authenticated: true,
  },
  member_voucher_admin: {
    path: '/members/:memberId/voucher',
    pageName: 'MemberAdminPage',
    authenticated: true,
  },
  member_coin_admin: {
    path: '/members/:memberId/coin',
    pageName: 'MemberAdminPage',
    authenticated: true,
  },
  member_contract_admin: {
    path: '/members/:memberId/contract',
    pageName: 'MemberAdminPage',
    authenticated: true,
  },
  member_order_admin: {
    path: '/members/:memberId/order',
    pageName: 'MemberAdminPage',
    authenticated: true,
  },
  member_history_admin: {
    path: '/members/:memberId/history',
    pageName: 'MemberAdminPage',
    authenticated: true,
  },
  member_permission_admin: {
    path: '/members/:memberId/permission',
    pageName: 'MemberAdminPage',
    authenticated: true,
  },
  // craft page
  craft_page_collection: {
    path: '/craft-page',
    pageName: 'CraftPageCollectionPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  craft_page_setup: {
    path: '/craft-page/:pageId',
    pageName: 'CraftPageAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  // app owner admin
  learning_overview: {
    path: '/learning-overview',
    pageName: 'LearningOverviewPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  sales: {
    path: '/sales',
    pageName: 'SalesPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  coupon_plans: {
    path: '/coupon-plans',
    pageName: 'CouponPlanCollectionAdminPage',
    authenticated: true,
  },
  voucher_plans: {
    path: '/voucher-plans',
    pageName: 'VoucherPlanCollectionAdminPage',
    authenticated: true,
  },
  voucher_category: {
    path: '/voucher-category',
    pageName: 'VoucherCategoryPage',
    authenticated: true,
  },
  gift_plans: {
    path: '/gift-plans',
    pageName: 'GiftPlanCollectionAdminPage',
    authenticated: true,
  },
  members: {
    path: '/members',
    pageName: 'MemberCollectionAdminPage',
    authenticated: true,
  },
  permission_group: {
    path: '/permission-group',
    pageName: 'PermissionGroupAdminPage',
    authenticated: true,
  },
  member_contract_creation: {
    path: '/members/:memberId/new-contract',
    pageName: 'MemberContractCreationPage',
    authenticated: true,
  },
  member_properties: {
    path: '/member-properties',
    pageName: 'MemberPropertyAdminPage',
    authenticated: true,
  },
  member_category: {
    path: '/member-category',
    pageName: 'MemberCategoryPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  coin_history: {
    path: '/coins',
    pageName: 'CoinHistoryAdminPage',
    authenticated: true,
  },
  point_history: {
    path: '/points',
    pageName: 'PointHistoryAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  creator_collection: {
    path: '/creators',
    pageName: 'CreatorCollectionAdminPage',
    authenticated: true,
  },
  creator_category: {
    path: '/creator-category',
    pageName: 'CreatorCategoryAdminPage',
    authenticated: true,
  },

  // app settings admin
  app_basic: {
    path: '/app/basic',
    pageName: 'AppBasicAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  app_setting: {
    path: '/app/setting',
    pageName: 'AppSettingAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  app_secret: {
    path: '/app/secret',
    pageName: 'AppSecretAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },

  report_collection: {
    path: '/report',
    pageName: 'ReportCollectionPage',
    authenticated: true,
  },
  report: {
    path: '/report/:reportId',
    pageName: 'ReportPage',
    authenticated: true,
  },
  deactivate: {
    path: '/deactivate',
    pageName: 'DeactivatePage',
    authenticated: true,
  },

  // xuemi extra router
  // member_contract_collection: {
  //   path: '/member-contracts',
  //   pageName: <MemberContractCollectionPage />,
  //   authenticated: true,
  // },
  // sales_status: {
  //   path: '/sales-status',
  //   pageName: <SalesStatusPage />,
  //   authenticated: true,
  // },
  // analytics_sales_materials: {
  //   path: '/analytics/sales-materials',
  //   pageName: <SalesMaterialsPage />,
  //   authenticated: true,
  // },
  // analytics_sales_member_categories: {
  //   path: '/analytics/sales-member-categories',
  //   pageName: <SalesMemberCategoryPage />,
  //   authenticated: true,
  // },
  // analytics_sales_activeness: {
  //   path: '/analytics/sales-activeness',
  //   pageName: <SalesActivenessPage />,
  //   authenticated: true,
  // },
  // analytics_advertising_audience: {
  //   path: '/analytics/advertising-audience',
  //   pageName: <AdvertisingAudiencePage />,
  //   authenticated: true,
  // },
  // member_contract_creation: {
  //   path: '/members/:memberId/new-contract',
  //   pageName: <MemberContractCreationPage />,
  //   authenticated: true,
  // },
  // chailease_lookup: {
  //   path: '/chailease-lookup',
  //   pageName: <ChaileaseLookupPage />,
  //   authenticated: true,
  // },
  // custom_scripts: {
  //   path: '/custom-scripts',
  //   pageName: <CustomScriptsPage />,
  //   authenticated: true,
  // },
}

export const useRouteKeys = () => {
  let match = useRouteMatch()
  return Object.keys(filter(routeProps => routeProps.path === match.path, routesProps))
}

export let routesMap = { ...routesProps }

const AdminRouter: React.VFC<{ extraRouteProps: { [routeKey: string]: RouteProps } }> = ({ extraRouteProps }) => {
  const { options: appOptions } = useApp()
  const { isAuthenticating, permissions } = useAuth()
  routesMap = { ...routesMap, ...extraRouteProps }
  const hasPassedCloseSiteTime = appOptions?.close_site_at
    ? dayjs(appOptions.close_site_at).diff(dayjs(), 'day') <= 0
    : false

  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <QueryParamProvider ReactRouterRoute={Route}>
        <Suspense fallback={<LoadingPage />}>
          <Switch>
            {Object.keys(routesMap).map(routeKey => {
              const routeProps = routesMap[routeKey as keyof typeof routesProps]
              return (
                <Route
                  exact
                  key={routeKey}
                  path={routeProps.path}
                  render={props =>
                    hasPassedCloseSiteTime && routeProps.path !== '/deactivate' ? (
                      <Redirect to="/deactivate" />
                    ) : !isAuthenticating && !permissions['BACKSTAGE_ENTER'] && routeProps.path !== '/' ? (
                      <Redirect to="/" />
                    ) : typeof routeProps.pageName === 'string' ? (
                      React.createElement(React.lazy(() => import(`../../pages/${routeProps.pageName}`)))
                    ) : (
                      routeProps.pageName
                    )
                  }
                />
              )
            })}
            <Route component={NotFoundPage} />
          </Switch>
        </Suspense>
      </QueryParamProvider>
    </BrowserRouter>
  )
}

export default AdminRouter
