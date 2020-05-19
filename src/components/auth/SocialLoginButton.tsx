import { Button, message } from 'antd'
import axios from 'axios'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import SocialLogin from 'react-social-login'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
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

const socialLogin = async (provider: string, providerToken: any) => {
  try {
    const { data } = await axios.post(`${process.env.REACT_APP_BACKEND_ENDPOINT}/socialLogin`, {
      appId: localStorage.getItem('kolable.app.id'),
      provider,
      providerToken,
    })
    const authToken = data.token
    try {
      localStorage.setItem(`kolable.auth.token`, authToken)
    } catch (error) {}
    return authToken
  } catch (err) {
    return await message.error(err.message)
  }
}

export const FacebookLoginButton: React.FC = () => {
  const { formatMessage } = useIntl()
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
        socialLogin(_provider, _token)
          .then(token => {
            setVisible && setVisible(false)
          })
          .finally(() => setLoading(false))
      }}
      onLoginFailure={(error: any) => {
        message.error(formatMessage(errorMessages.event.failedFacebookLogin))
        handleError(error)
      }}
    >
      <FacebookLogo />
      <span>{formatMessage(commonMessages.ui.facebookLogin)}</span>
    </SocialLoginButton>
  )
}

export const GoogleLoginButton: React.FC = () => {
  const { formatMessage } = useIntl()
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
        socialLogin(_provider, _token)
          .then(token => {
            setVisible && setVisible(false)
          })
          .finally(() => setLoading(false))
      }}
      onLoginFailure={(error: any) => {
        message.error(formatMessage(errorMessages.event.failedGoogleLogin))
        handleError(error)
      }}
    >
      <GoogleLogo />
      <span>{formatMessage(commonMessages.ui.googleLogin)}</span>
    </SocialLoginButton>
  )
}
