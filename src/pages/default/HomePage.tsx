import { message } from 'antd'
import React, { useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import AuthModal, { AuthModalContext } from '../../components/auth/AuthModal'
import LoginSection from '../../components/auth/LoginSection'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  overflow: auto;
  background-color: white;
`
const StyledLogoBlock = styled.div`
  margin: 0 auto 2.5rem;
  text-align: center;

  img {
    height: 36px;
  }
`
const StyledTitle = styled.h1`
  margin-bottom: 2.5rem;
  color: var(--gray-darker);
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  letter-spacing: 0.23px;
`

const messages = defineMessages({
  deniedRolePermission: { id: 'error.text.deniedRolePermission', defaultMessage: '此帳號沒有權限' },
  adminBackstage: { id: 'common.label.adminBackstage', defaultMessage: '管理後台' },
  isAppOwner: { id: 'common.label.isAppOwner', defaultMessage: '我是管理者' },
  isContentCreator: { id: 'common.isContentCreator', defaultMessage: '我是創作者' },
})

const HomePage: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { currentMemberId, currentUserRole, permissions, logout } = useAuth()
  const { loading, id: appId, settings } = useApp()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (loading || !currentMemberId) {
      return
    }

    if (currentUserRole === 'app-owner') {
      history.push(settings['admin.app_owner.redirect'] || '/admin')
    } else if (currentUserRole === 'content-creator') {
      history.push(settings['admin.content_creator.redirect'] || '/programs')
    } else if (!permissions.BACKSTAGE_ENTER) {
      message.error(formatMessage(messages.deniedRolePermission))
      logout?.()
    } else {
      history.push('/settings')
    }
  }, [currentMemberId, currentUserRole, formatMessage, history, loading, logout, permissions.BACKSTAGE_ENTER, settings])

  return (
    <AuthModalContext.Provider value={{ visible, setVisible }}>
      <AuthModal />

      <StyledWrapper>
        <div className="container">
          <StyledLogoBlock>
            <img src={`https://static.kolable.com/images/${appId}/logo.png`} alt="logo" />
          </StyledLogoBlock>
          <StyledTitle>{formatMessage(messages.adminBackstage)}</StyledTitle>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-4">
              <LoginSection noTitle />
            </div>
          </div>
        </div>
      </StyledWrapper>
    </AuthModalContext.Provider>
  )
}

export default HomePage
