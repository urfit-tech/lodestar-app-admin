import { Button, message } from 'antd'
import axios from 'axios'
import React, { useContext, useState } from 'react'
import SocialLogin from 'react-social-login'
import styled from 'styled-components'
import FacebookLogoImage from '../../images/default/FB-logo.png'
import GoogleLogoImage from '../../images/default/google-logo.png'
import { useAuth } from './AuthContext'
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
      localStorage.setItem(`${localStorage.getItem('kolable.app.id')}.auth.token`, authToken)
    } catch (error) {}
    return authToken
  } catch (err) {
    return await message.error(err.message)
  }
}

export const FacebookLoginButton = () => {
  const { setAuthToken } = useAuth()
  const { setVisible } = useContext(AuthModalContext)
  const [loading, setLoading] = useState()

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
            setAuthToken && setAuthToken(token)
            setVisible && setVisible(false)
          })
          .finally(() => setLoading(false))
      }}
      onLoginFailure={(err: any) => {
        message.error(`無法從 Facebook 登入/註冊`)
        console.error(err)
      }}
    >
      <FacebookLogo />
      <span>Facebook 登入/註冊</span>
    </SocialLoginButton>
  )
}

export const GoogleLoginButton = () => {
  const { setAuthToken } = useAuth()
  const { setVisible } = useContext(AuthModalContext)
  const [loading, setLoading] = useState()

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
            setAuthToken && setAuthToken(token)
            setVisible && setVisible(false)
          })
          .finally(() => setLoading(false))
      }}
      onLoginFailure={(err: any) => {
        message.error(`無法從 Google 登入/註冊`)
        console.error(err)
      }}
    >
      <GoogleLogo />
      <span>Google 登入/註冊</span>
    </SocialLoginButton>
  )
}
