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

  // program
  program_collection_admin: {
    path: '/programs',
    pageName: 'ProgramCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'content-creator',
  },
  program_issues_admin: {
    path: '/program-issues',
    pageName: 'ProgramIssueCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'content-creator',
  },
  program_progress_admin: {
    path: '/program-progress',
    pageName: 'ProgramProgressCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'content-creator',
  },
  program_admin: {
    path: '/programs/:programId',
    pageName: 'ProgramAdminPage',
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

  // app owner admin
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
  owner_category_admin: {
    path: '/admin/category',
    pageName: 'owner/CategoryAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_members_admin: {
    path: '/admin/members',
    pageName: 'owner/MemberCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_settings_admin: {
    path: '/admin/settings',
    pageName: 'owner/SettingAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_sales_admin: {
    path: '/admin/sales',
    pageName: 'owner/SalesAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_edm_admin: {
    path: '/admin/edm',
    pageName: 'owner/EdmAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_podcast_program_collection_admin: {
    path: '/admin/podcast-programs',
    pageName: 'owner/PodcastProgramCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_podcast_program_admin: {
    path: '/admin/podcast-programs/:podcastProgramId',
    pageName: 'owner/PodcastProgramAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_podcast_plan_admin: {
    path: '/admin/podcast-plan',
    pageName: 'owner/PodcastPlanAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_appointment_plan_collection_admin: {
    path: '/admin/appointment-plans',
    pageName: 'owner/AppointmentPlanCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_appointment_plan_admin: {
    path: '/admin/appointment-plans/:appointmentPlanId',
    pageName: 'owner/AppointmentPlanAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_appointment_period_collection_admin: {
    path: '/admin/appointment-periods',
    pageName: 'owner/AppointmentPeriodCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_activity_collection_admin: {
    path: '/admin/activities',
    pageName: 'creator/ActivityCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_activity_admin: {
    path: '/admin/activities/:activityId',
    pageName: 'creator/ActivityAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_blog_collection_admin: {
    path: '/admin/blog',
    pageName: 'owner/BlogCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_blog_admin: {
    path: '/admin/blog/:postId',
    pageName: 'owner/BlogAdminPage',
    authenticated: true,
  },

  // content creator admin
  creator_appointment_plan_collection_admin: {
    path: '/studio/appointment-plans',
    pageName: 'owner/AppointmentPlanCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'content-creator',
  },
  creator_appointment_plan_admin: {
    path: '/studio/appointment-plans/:appointmentPlanId',
    pageName: 'owner/AppointmentPlanAdminPage',
    authenticated: true,
    allowedUserRole: 'content-creator',
  },
  creator_appointment_period_collection_admin: {
    path: '/studio/appointment-periods',
    pageName: 'owner/AppointmentPeriodCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'content-creator',
  },
  creator_activity_collection_admin: {
    path: '/studio/activities',
    pageName: 'creator/ActivityCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'content-creator',
  },
  creator_activity_admin: {
    path: '/studio/activities/:activityId',
    pageName: 'creator/ActivityAdminPage',
    authenticated: true,
    allowedUserRole: 'content-creator',
  },
  creator_products_admin: {
    path: '/studio/products',
    pageName: 'creator/ProductCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'content-creator',
  },
  creator_product_issues_admin: {
    path: '/studio/product_issues',
    pageName: 'creator/ProductIssueCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'content-creator',
  },
  creator_sales_admin: {
    path: '/studio/sales',
    pageName: 'creator/SalesAdminPage',
    authenticated: true,
    allowedUserRole: 'content-creator',
  },
  creator_support_admin: {
    path: '/studio/support',
    pageName: 'creator/SupportAdminPage',
    authenticated: true,
    allowedUserRole: 'content-creator',
  },
  creator_settings_admin: {
    path: '/studio/settings',
    pageName: 'creator/SettingAdminPage',
    authenticated: true,
    allowedUserRole: 'content-creator',
  },
}

export default () => (
  <Suspense fallback={<LoadingPage></LoadingPage>}>
    <Switch>
      {Object.keys(routesProps).map(routeKey => {
        const routeProps = routesProps[routeKey as keyof typeof routesProps]
        return (
          <Route
            exact
            key={routeKey}
            path={routeProps.path}
            render={props => (
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
