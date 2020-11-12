import { Button, message } from 'antd'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import SocialLogin from 'react-social-login'
import styled from 'styled-components'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { codeMessages, commonMessages, errorMessages } from '../../helpers/translation'
import FacebookLogoImage from '../../images/default/FB-logo.png'
import GoogleLogoImage from '../../images/default/google-logo.png'
import { AuthModalContext } from './AuthModal'

const StyledButton = styled(Button)`
  span {
    vertical-align: middle;
  }

  &:hover,
  &:active,
  &:focus {
    border-color: transparent;
  }
`
const FacebookLogo = styled.span`
  margin-right: 0.5rem;
  height: 24px;
  width: 24px;
  background-image: url(${FacebookLogoImage});
  background-size: 13px 24px;
  background-repeat: no-repeat;
  background-position: center;
`

const GoogleLogo = styled.span`
  margin-right: 0.5rem;
  height: 24px;
  width: 24px;
  background-image: url(${GoogleLogoImage});
  background-size: 24px 24px;
  background-repeat: no-repeat;
  background-position: center;
`

class WrappedSocialLoginButton extends React.Component<{
  triggerLogin: () => void
}> {
  render = () => {
    const { triggerLogin, children, ...restProps } = this.props
    return (
      <StyledButton onClick={triggerLogin} {...restProps}>
        {children}
      </StyledButton>
    )
  }
}

const SocialLoginButton = SocialLogin(WrappedSocialLoginButton)

export const FacebookLoginButton: React.FC = () => {
  const app = useApp()
  const { formatMessage } = useIntl()
  const { socialLogin } = useAuth()
  const { setVisible } = useContext(AuthModalContext)
  const [loading, setLoading] = useState(false)

  return (
    <SocialLoginButton
      block
      loading={loading}
      style={{
        border: '1px solid #3b5998',
        height: '44px',
        width: '100%',
        background: '#3b5998',
        color: '#fff',
      }}
      provider="facebook"
      appId={process.env.REACT_APP_FACEBOOK_APP_ID}
      scope="public_profile,email"
      onLoginSuccess={({ _provider, _token }: any) => {
        setLoading(true)
        socialLogin &&
          socialLogin({ appId: app.id, provider: _provider, providerToken: _token.accessToken })
            .then(() => {
              setVisible && setVisible(false)
            })
            .catch((error: Error) => {
              const code = error.message as keyof typeof codeMessages
              message.error(formatMessage(codeMessages[code]))
            })
            .catch(handleError)
            .finally(() => setLoading(false))
      }}
      onLoginFailure={(err: any) => {
        message.error(formatMessage(errorMessages.event.failedFacebookLogin))
        console.error(err)
      }}
    >
      <FacebookLogo />
      <span>{formatMessage(commonMessages.ui.facebookLogin)}</span>
    </SocialLoginButton>
  )
}

export const GoogleLoginButton: React.FC = () => {
  const app = useApp()
  const { formatMessage } = useIntl()
  const { socialLogin } = useAuth()
  const { setVisible } = useContext(AuthModalContext)
  const [loading, setLoading] = useState(false)

  return (
    <SocialLoginButton
      style={{
        border: '1px solid #585858',
        height: '44px',
        width: '100%',
        background: '#fff',
        color: '#585858',
      }}
      block
      loading={loading}
      provider="google"
      appId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
      scope="profile email openid"
      onLoginSuccess={({ _provider, _token }: any) => {
        setLoading(true)
        socialLogin &&
          socialLogin({ appId: app.id, provider: _provider, providerToken: _token.idToken })
            .then(() => {
              setVisible && setVisible(false)
            })
            .catch((error: Error) => {
              const code = error.message as keyof typeof codeMessages
              message.error(formatMessage(codeMessages[code]))
            })
            .catch(handleError)
            .finally(() => setLoading(false))
      }}
      onLoginFailure={(err: any) => {
        message.error(formatMessage(errorMessages.event.failedGoogleLogin))
        console.error(err)
      }}
    >
      <GoogleLogo />
      <span>{formatMessage(commonMessages.ui.googleLogin)}</span>
    </SocialLoginButton>
  )
}
