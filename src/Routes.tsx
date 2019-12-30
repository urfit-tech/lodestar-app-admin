import React from 'react'
import { Redirect, Route, Switch } from 'react-router-dom'
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
  oauth2: {
    path: '/oauth2',
    pageName: 'OAuth2Page',
    authenticated: false,
  },
  terms: {
    path: '/terms',
    pageName: 'TermsPage',
    authenticated: false,
  },
  about: {
    path: '/about',
    pageName: 'AboutPage',
    authenticated: false,
  },
  manual: {
    path: '/manual',
    pageName: 'ManualPage',
    authenticated: false,
  },
  order: {
    path: '/orders/:orderId',
    pageName: 'OrderPage',
    authenticated: false,
  },
  order_product: {
    path: '/orders/:orderId/products/:orderProductId',
    pageName: 'OrderProductPage',
    authenticated: true,
  },
  notification: {
    path: '/notifications',
    pageName: 'NotificationPage',
    authenticated: false,
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
  owner_program_general_admin: {
    path: '/admin/program',
    pageName: 'owner/ProgramGeneralAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_members_admin: {
    path: '/admin/members',
    pageName: 'owner/MemberCollectionAdminPage',
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
  owner_program_collection_admin: {
    path: '/admin/programs',
    pageName: 'creator/ProgramCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_program_admin: {
    path: '/admin/programs/:programId',
    pageName: 'creator/ProgramAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_program_issues_admin: {
    path: '/admin/program_issues',
    pageName: 'creator/ProgramIssueCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },

  // content creator admin
  creator_programs_admin: {
    path: '/studio/programs',
    pageName: 'creator/ProgramCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'content-creator',
  },
  creator_program_admin: {
    path: '/studio/programs/:programId',
    pageName: 'creator/ProgramAdminPage',
    authenticated: true,
    allowedUserRole: 'content-creator',
  },
  creator_program_issues_admin: {
    path: '/studio/program_issues',
    pageName: 'creator/ProgramIssueCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'content-creator',
  },
  creator_activities_admin: {
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
}

export default () => (
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
      path="/settings"
      render={props => (
        <Redirect
          to={{
            pathname: '/settings/profile',
            state: { from: props.location },
          }}
        />
      )}
    />
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
    <Route
      exact
      path="/funding/:fundingId"
      render={props => (
        <Redirect
          to={{
            pathname: `/projects/${props.match.params.fundingId}`,
            state: { from: props.location },
          }}
        />
      )}
    />
    <Route component={NotFoundPage} />
  </Switch>
)
