import React, { Suspense } from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
import LoadingPage from './pages/default/LoadingPage'
import NotFoundPage from './pages/default/NotFoundPage'
import LoadablePage from './pages/LoadablePage'
import { UserRole } from './schemas/general'

type RouteProps = {
  path: string
  pageName: string
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
  settings_admin: {
    path: '/settings',
    pageName: 'SettingAdminPage',
    authenticated: true,
  },

  // program
  program_collection_admin: {
    path: '/programs',
    pageName: 'ProgramCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'content-creator',
  },
  program_admin: {
    path: '/programs/:programId',
    pageName: 'ProgramAdminPage',
    authenticated: true,
  },
  program_issue_collection_admin: {
    path: '/program-issues',
    pageName: 'ProgramIssueCollectionAdminPage',
    authenticated: true,
  },
  program_package_collection_admin: {
    path: '/program-packages',
    pageName: 'ProgramPackageCollectionAdminPage',
    authenticated: true,
  },
  program_package_admin: {
    path: '/program-packages/:programPackageId',
    pageName: 'ProgramPackageAdminPage',
    authenticated: true,
  },
  program_progress_admin: {
    path: '/program-progress',
    pageName: 'ProgramProgressCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'content-creator',
  },
  program_tempo_delivery: {
    path: '/program-tempo-delivery',
    pageName: 'ProgramTempoDeliveryAdminPage',
    authenticated: true,
  },
  program_category_admin: {
    path: '/program-category',
    pageName: 'ProgramCategoryPage',
    authenticated: true,
  },

  // podcast program
  podcast_program_collection_admin: {
    path: '/podcast-programs',
    pageName: 'PodcastProgramCollectionAdminPage',
    authenticated: true,
  },
  podcast_program_admin: {
    path: '/podcast-programs/:podcastProgramId',
    pageName: 'PodcastProgramAdminPage',
    authenticated: true,
  },
  podcast_plan_admin: {
    path: '/podcast-plan',
    pageName: 'PodcastPlanAdminPage',
    authenticated: true,
  },
  podcast_program_category_admin: {
    path: '/podcast-program-category',
    pageName: 'PodcastProgramCategoryPage',
    authenticated: true,
  },

  // appointment
  appointment_plan_collection_admin: {
    path: '/appointment-plans',
    pageName: 'AppointmentPlanCollectionAdminPage',
    authenticated: true,
  },
  appointment_plan_admin: {
    path: '/appointment-plans/:appointmentPlanId',
    pageName: 'AppointmentPlanAdminPage',
    authenticated: true,
  },
  appointment_period_collection_admin: {
    path: '/appointment-periods',
    pageName: 'AppointmentPeriodCollectionAdminPage',
    authenticated: true,
  },

  // activity
  activity_collection_admin: {
    path: '/activities',
    pageName: 'ActivityCollectionAdminPage',
    authenticated: true,
  },
  activity_admin: {
    path: '/activities/:activityId',
    pageName: 'ActivityAdminPage',
    authenticated: true,
  },
  activity_category_admin: {
    path: '/activity-category',
    pageName: 'ActivityCategoryPage',
    authenticated: true,
  },

  // merchandise
  merchandise_collection_admin: {
    path: '/merchandises',
    pageName: 'MerchandiseCollectionAdminPage',
    authenticated: true,
  },
  merchandise_admin: {
    path: '/merchandises/:merchandiseId',
    pageName: 'MerchandiseAdminPage',
    authenticated: true,
  },
  merchandise_shipping_admin: {
    path: '/merchandise-shipping',
    pageName: 'MerchandiseShippingPage',
    authenticated: true,
  },
  merchandise_category_admin: {
    path: '/merchandise-category',
    pageName: 'MerchandiseCategoryPage',
    authenticated: true,
  },

  // blog
  blog_collection_admin: {
    path: '/blog',
    pageName: 'BlogCollectionAdminPage',
    authenticated: true,
  },
  blog_admin: {
    path: '/blog/:postId',
    pageName: 'BlogAdminPage',
    authenticated: true,
  },
  blog_category_admin: {
    path: '/blog-post-category',
    pageName: 'BlogPostCategoryPage',
    authenticated: true,
  },

  // app owner admin
  owner_sales_admin: {
    path: '/admin/sales',
    pageName: 'owner/SalesAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_coupon_plans_admin: {
    path: '/admin/coupon_plans',
    pageName: 'owner/CouponPlanCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_voucher_plans_admin: {
    path: '/admin/voucher_plans',
    pageName: 'owner/VoucherPlanCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_members_admin: {
    path: '/admin/members',
    pageName: 'owner/MemberCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },

  // content creator admin
  creator_sales_admin: {
    path: '/studio/sales',
    pageName: 'creator/SalesAdminPage',
    authenticated: true,
    allowedUserRole: 'content-creator',
  },
}

export default () => (
  <Suspense fallback={<LoadingPage></LoadingPage>}>
    <Switch>
      {Object.keys(routesProps).map((routeKey) => {
        const routeProps = routesProps[routeKey as keyof typeof routesProps]
        return (
          <Route
            exact
            key={routeKey}
            path={routeProps.path}
            render={(props) => (
              <LoadablePage
                {...props}
                pageName={routeProps.pageName}
                authenticated={routeProps.authenticated}
                allowedUserRole={routeProps.allowedUserRole}
              />
            )}
          />
        )
      })}
      <Route
        exact
        path="/admin"
        render={(props) => (
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
        render={(props) => (
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
