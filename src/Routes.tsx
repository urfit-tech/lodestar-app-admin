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
  project: {
    path: '/projects/:projectId',
    pageName: 'ProjectPage',
    authenticated: false,
  },
  activity_collection: {
    path: '/activities',
    pageName: 'ActivityCollectionPage',
    authenticated: false,
  },
  activity: {
    path: '/activities/:activityId',
    pageName: 'ActivityPage',
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
  member: {
    path: '/members/:memberId',
    pageName: 'MemberPage',
    authenticated: false,
  },
  cart: {
    path: '/cart',
    pageName: 'CartPage',
    authenticated: false,
  },
  program_collection: {
    path: '/programs',
    pageName: 'ProgramCollectionPage',
    authenticated: false,
  },
  program: {
    path: '/programs/:programId',
    pageName: 'ProgramPage',
    authenticated: false,
  },
  notification: {
    path: '/notifications',
    pageName: 'NotificationPage',
    authenticated: false,
  },
  program_content_collection: {
    path: '/programs/:programId/contents',
    pageName: 'ProgramContentCollectionPage',
    authenticated: true,
    allowedUserRole: 'general-member',
  },
  program_content: {
    path: '/programs/:programId/contents/:programContentId',
    pageName: 'ProgramContentPage',
    authenticated: true,
    allowedUserRole: 'general-member',
  },
  program_package_content: {
    path: '/program-packages/:programPackageId/content',
    pageName: 'ProgramPackageContentPage',
    authenticated: false,
  },
  // general member admin
  member_profile_admin: {
    path: '/settings/profile',
    pageName: 'member/ProfileAdminPage',
    authenticated: true,
    allowedUserRole: 'general-member',
  },
  member_point_history_admin: {
    path: '/settings/point_history',
    pageName: 'member/PointHistoryAdminPage',
    authenticated: true,
    allowedUserRole: 'general-member',
  },
  member_orders_admin: {
    path: '/settings/orders',
    pageName: 'member/OrderCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'general-member',
  },
  member_program_issues_admin: {
    path: '/settings/program_issues',
    pageName: 'member/ProgramIssueCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'general-member',
  },
  member_product_issues_admin: {
    path: '/settings/product_issues',
    pageName: 'member/ProductIssueCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'general-member',
  },
  member_coupons_admin: {
    path: '/settings/coupons',
    pageName: 'member/CouponCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'general-member',
  },
  member_voucher_admin: {
    path: '/settings/voucher',
    pageName: 'member/VoucherCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'general-member',
  },
  member_account_admin: {
    path: '/settings/account',
    pageName: 'member/AccountAdminPage',
    authenticated: true,
    allowedUserRole: 'general-member',
  },
  member_cards_admin: {
    path: '/settings/cards',
    pageName: 'member/CardCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'general-member',
  },
  // app owner admin
  owner_point_admin: {
    path: '/admin/point',
    pageName: 'owner/PointAdminPage',
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
  owner_podcast_collection_admin: {
    path: '/admin/podcasts',
    pageName: 'owner/PodcastCollectionAdminPage',
    authenticated: true,
    allowedUserRole: 'app-owner',
  },
  owner_podcast_admin: {
    path: '/admin/podcasts/:podcastId',
    pageName: 'owner/PodcastAdminPage',
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
