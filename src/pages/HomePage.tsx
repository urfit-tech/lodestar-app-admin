import { message } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { parsePayload } from 'lodestar-app-element/src/hooks/util'
import React, { useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import AuthModal, { AuthModalContext } from '../components/auth/AuthModal'
import LoginSection from '../components/auth/LoginSection'

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
    display: inline;
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
  const { currentMemberId, currentUserRole, permissions, logout, authToken } = useAuth()
  const payload = authToken ? parsePayload(authToken) : null
  const isBusiness = payload && payload.isBusiness
  const { loading, id: appId, settings } = useApp()
  const [visible, setVisible] = useState(false)
  const [back] = useQueryParam('back', StringParam)

  useEffect(() => {
    if (loading || !currentMemberId) {
      return
    }

    if (back) {
      history.push(back)
    } else if (isBusiness) {
      history.push(`/sales`)
    } else if (currentUserRole === 'app-owner') {
      history.push(settings['admin.app_owner.redirect'] || `/sales`)
    } else if (currentUserRole === 'content-creator') {
      history.push(settings['admin.content_creator.redirect'] || `/programs`)
    } else if (!permissions.BACKSTAGE_ENTER) {
      message.error(formatMessage(messages.deniedRolePermission))
      logout?.()
    } else {
      history.push(settings['admin.general_member.redirect'] || `/settings`)
    }
  }, [
    currentMemberId,
    currentUserRole,
    formatMessage,
    history,
    loading,
    logout,
    permissions.BACKSTAGE_ENTER,
    settings,
    isBusiness,
  ])

  return (
    <AuthModalContext.Provider value={{ visible, setVisible }}>
      <AuthModal />

      <StyledWrapper>
        <div className="container">
          <StyledLogoBlock>
            <img src={`https://${process.env.REACT_APP_S3_BUCKET}/images/${appId}/logo.png`} alt="logo" />
          </StyledLogoBlock>
          <StyledTitle>{formatMessage(messages.adminBackstage)}</StyledTitle>
          <div className="row justify-content-center">
            <div className="col-12 col-lg-4">
              <LoginSection renderTitle={() => null} />
            </div>
          </div>
        </div>
      </StyledWrapper>
    </AuthModalContext.Provider>
  )
}

export default HomePage
