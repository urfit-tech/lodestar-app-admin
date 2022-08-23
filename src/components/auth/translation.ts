import { defineMessages } from 'react-intl'

const authMessages = {
  '*': defineMessages({
    or: { id: 'auth.*.or', defaultMessage: 'Or' },
  }),
  LoginSection: defineMessages({
    login: { id: 'auth.LoginSection.login', defaultMessage: 'Login' },
    usernameOrEmail: { id: 'auth.LoginSection.usernameOrEmail', defaultMessage: 'Username or email' },
    password: { id: 'auth.LoginSection.password', defaultMessage: 'Password' },
    forgotPassword: { id: 'auth.LoginSection.forgotPassword', defaultMessage: 'Forgot password' },
  }),
  SocialLoginButton: defineMessages({
    facebookLogin: { id: 'auth.SocialLoginButton.facebookLogin', defaultMessage: 'Facebook Login' },
    googleLogin: { id: 'auth.SocialLoginButton.googleLogin', defaultMessage: 'Google Login' },
    lineLogin: { id: 'auth.SocialLoginButton.lineLogin', defaultMessage: 'Line Login' },
    parentingLogin: { id: 'auth.SocialLoginButton.parentingLogin', defaultMessage: 'Parenting Login' },
  }),
}
export default authMessages
