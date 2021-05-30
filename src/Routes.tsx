import React, { Suspense } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import LoadingPage from './pages/default/LoadingPage'
import NotFoundPage from './pages/default/NotFoundPage'
import LoadablePage from './pages/LoadablePage'
import { UserRole } from './types/member'

export type RouteProps = {
  path: string
  pageName: string | JSX.Element
  authenticated: boolean
  allowedUserRole?: UserRole
}
export const routesProps: { [routeKey: string]: RouteProps } = {
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
  member_contract: {
    path: '/members/:memberId/contracts/:memberContractId',
    pageName: 'ContractPage',
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
  // member
  owner_member: {
    path: '/admin/members/:memberId',
    pageName: 'MemberProfileAdminPage',
    authenticated: true,
  },
  owner_member_profile: {
    path: '/admin/members/:memberId/profile',
    pageName: 'MemberProfileAdminPage',
    authenticated: true,
  },
  owner_member_note: {
    path: '/admin/members/:memberId/note',
    pageName: 'MemberNoteAdminPage',
    authenticated: true,
  },
  owner_member_task: {
    path: '/admin/members/:memberId/task',
    pageName: 'MemberTaskAdminPage',
    authenticated: true,
  },
  owner_member_coupon: {
    path: '/admin/members/:memberId/coupon',
    pageName: 'MemberCouponAdminPage',
    authenticated: true,
  },
  owner_member_contract: {
    path: '/admin/members/:memberId/contract',
    pageName: 'MemberContractAdminPage',
    authenticated: true,
  },
  owner_member_order: {
    path: '/admin/members/:memberId/order',
    pageName: 'MemberOrderAdminPage',
    authenticated: true,
  },
  owner_member_permission: {
    path: '/admin/members/:memberId/permission',
    pageName: 'MemberPermissionAdminPage',
    authenticated: true,
  },

  // app owner admin
  owner_craft_setup: {
    path: '/admin/craft_setup',
    pageName: 'owner/CraftPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_learning_overview: {
    path: '/admin/learning_overview',
    pageName: 'owner/LearningOverviewPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_sales: {
    path: '/admin/sales',
    pageName: 'owner/SalesAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_coupon_plans: {
    path: '/admin/coupon_plans',
    pageName: 'owner/CouponPlanCollectionAdminPage',
    authenticated: true,
  },
  owner_voucher_plans: {
    path: '/admin/voucher_plans',
    pageName: 'owner/VoucherPlanCollectionAdminPage',
    authenticated: true,
  },
  owner_members: {
    path: '/admin/members',
    pageName: 'owner/MemberCollectionAdminPage',
    authenticated: true,
  },
  member_contract_creation: {
    path: '/admin/members/:memberId/contracts/new',
    pageName: 'owner/MemberContractCreationPage',
    authenticated: true,
  },
  owner_member_properties: {
    path: '/admin/member-properties',
    pageName: 'owner/MemberPropertyAdminPage',
    authenticated: true,
  },
  owner_member_category: {
    path: '/admin/member-category',
    pageName: 'owner/MemberCategoryPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_coin_history: {
    path: '/admin/coins',
    pageName: 'owner/CoinHistoryAdminPage',
    authenticated: true,
  },
  owner_point_history: {
    path: '/admin/points',
    pageName: 'owner/PointHistoryAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_creator_collection: {
    path: '/admin/creators',
    pageName: 'owner/CreatorCollectionAdminPage',
    authenticated: true,
  },
  owner_creator_category: {
    path: '/admin/creator-category',
    pageName: 'owner/CreatorCategoryAdminPage',
    authenticated: true,
  },

  // content creator admin
  creator_sales: {
    path: '/studio/sales',
    pageName: 'creator/SalesAdminPage',
    authenticated: true,
    allowedUserRole: 'content-creator',
  },

  // app settings admin
  app_admin: {
    path: '/app',
    pageName: 'AppAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
}

export let routesMap = { ...routesProps }

const Routes: React.FC<{ extra?: { [routeKey: string]: RouteProps } }> = ({ extra }) => {
  routesMap = { ...routesMap, ...extra }
  return (
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
                typeof routeProps.pageName === 'string' ? (
                  <LoadablePage
                    {...props}
                    pageName={routeProps.pageName}
                    authenticated={routeProps.authenticated}
                    allowedUserRole={routeProps.allowedUserRole}
                  />
                ) : (
                  routeProps.pageName
                )
              }
            />
          )
        })}
        <Route
          exact
          path="/admin"
          render={props => (
            <Redirect
              to={{
                pathname: '/admin/sales',
                state: { from: props.location },
              }}
            />
          )}
        />
        <Route
          exact
          path="/studio"
          render={props => (
            <Redirect
              to={{
                pathname: '/studio/sales',
                state: { from: props.location },
              }}
            />
          )}
        />
        <Route component={NotFoundPage} />
      </Switch>
    </Suspense>
  )
}

export default Routes
