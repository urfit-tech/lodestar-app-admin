import { message } from 'antd'
import React, { useContext, useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import AuthModal, { AuthModalContext } from '../../components/auth/AuthModal'
import { BREAK_POINT } from '../../components/common/Responsive'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { ReactComponent as AdminIcon } from '../../images/default/icon-admin.svg'
import { ReactComponent as CreatorIcon } from '../../images/default/icon-creator.svg'

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  overflow: auto;
  background-color: white;
`
const CenteredBox = styled.div``
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
const StyledRoleBlock = styled.div`
  padding: 2rem;
  width: 10rem;
  height: 10rem;
  background-color: white;
  color: var(--gray-darker);
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
  border-radius: 8px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
  cursor: pointer;

  :first-child {
    margin-right: 1rem;
  }

  @media (min-width: ${BREAK_POINT}px) {
    width: 12.5rem;
    height: 12.5rem;

    :first-child {
      margin-right: 5rem;
    }
  }
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
  const { isAuthenticated, currentUserRole, permissions, logout } = useAuth()
  const app = useContext(AppContext)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (currentUserRole === 'app-owner') {
      history.push('/admin')
    } else if (currentUserRole === 'content-creator') {
      history.push('/studio')
    } else if (isAuthenticated) {
      if (!permissions.BACKSTAGE_ENTER) {
        message.error(formatMessage(messages.deniedRolePermission))
        logout && logout()
      } else {
        history.push('/settings')
      }
    }
  }, [isAuthenticated, currentUserRole, history, logout, formatMessage, permissions.BACKSTAGE_ENTER])

  return (
    <AuthModalContext.Provider value={{ visible, setVisible }}>
      <AuthModal />

      <StyledWrapper>
        <CenteredBox>
          <div className="container">
            <StyledLogoBlock>
              <img src={`https://static.kolable.com/images/${app.id}/logo.png`} alt="logo" />
            </StyledLogoBlock>
            <StyledTitle>{formatMessage(messages.adminBackstage)}</StyledTitle>

            <div className="d-flex align-items-center justify-content-between">
              <RoleButton
                title={formatMessage(messages.isAppOwner)}
                icon={<AdminIcon />}
                onAuthenticated={() => history.push('/admin')}
              />
              <RoleButton
                title={formatMessage(messages.isContentCreator)}
                icon={<CreatorIcon />}
                onAuthenticated={() => history.push('/studio')}
              />
            </div>
          </div>
        </CenteredBox>
      </StyledWrapper>
    </AuthModalContext.Provider>
  )
}

const RoleButton: React.FC<{
  title: string
  icon: React.ReactNode
  onAuthenticated?: () => void
}> = ({ title, icon, onAuthenticated }) => {
  const { setVisible: setAuthModalVisible } = useContext(AuthModalContext)

  return (
    <StyledRoleBlock
      className="d-flex flex-column align-items-center justify-content-between"
      onClick={() => setAuthModalVisible?.(true)}
    >
      <div>{icon}</div>
      <div>{title}</div>
    </StyledRoleBlock>
  )
}

export default HomePage
