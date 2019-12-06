import React, { useCallback, useContext, useState } from 'react'
import { Redirect } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth } from '../../components/auth/AuthContext'
import AuthModal, { AuthModalContext } from '../../components/auth/AuthModal'
import { BREAK_POINT } from '../../components/common/Responsive'
import { useApp } from '../../hooks/data'
import { ReactComponent as AdminIcon } from '../../images/default/icon-admin.svg'
import { ReactComponent as CreatorIcon } from '../../images/default/icon-creator.svg'

const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  overflow: auto;
  background-color: var(--gray-lighter);
`
const CenteredBox = styled.div``
const StyledLogo = styled.div<{ appId: string }>`
  margin: 0 auto 2.5rem;
  width: 100%;
  height: 100%;
  max-width: 24rem;
  height: 4rem;
  background-image: url(https://files.kolable.com/images/${props => props.appId}/logo.svg),
    url(https://files.kolable.com/images/${props => props.appId}/logo.png),
    url(https://files.kolable.com/images/${props => props.appId}/logo.jpg);
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
`
const StyledTitle = styled.h1`
  margin-bottom: 2.5rem;
  color: var(--gray-darker);
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  letter-spacing: 0.23px;

  @media (min-width: ${BREAK_POINT}px) {
    margin-bottom: 5rem;
  }
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

const HomePage = () => {
  const { app } = useApp()
  const { isAuthenticated, currentUserRole } = useAuth()
  const [visible, setVisible] = useState(false)

  if (isAuthenticated) {
    switch (currentUserRole) {
      case 'app-owner':
        return <Redirect to="/admin"></Redirect>
      case 'content-creator':
        return <Redirect to="/studio"></Redirect>
    }
  }

  return (
    <AuthModalContext.Provider value={{ visible, setVisible }}>
      <AuthModal></AuthModal>

      <StyledWrapper>
        <CenteredBox>
          <div className="container">
            <StyledLogo appId={app.id} />
            <StyledTitle>請問您是...</StyledTitle>

            <div className="d-flex align-items-center justify-content-between">
              <RoleButton role="app-owner" title="我是管理員" icon={<AdminIcon />} />
              <RoleButton role="content-creator" title="我是創作者" icon={<CreatorIcon />} />
            </div>
          </div>
        </CenteredBox>
      </StyledWrapper>
    </AuthModalContext.Provider>
  )
}

const RoleButton: React.FC<{
  role: 'app-owner' | 'content-creator'
  title: string
  icon: React.ReactNode
}> = ({ role, title, icon }) => {
  const { setCurrentUserRole } = useAuth()
  const { setVisible: setAuthModalVisible } = useContext(AuthModalContext)
  const handleClick = useCallback(() => {
    setCurrentUserRole && setCurrentUserRole(role)
    setAuthModalVisible && setAuthModalVisible(true)
  }, [])

  return (
    <StyledRoleBlock className="d-flex flex-column align-items-center justify-content-between" onClick={handleClick}>
      <div>{icon}</div>
      <div>{title}</div>
    </StyledRoleBlock>
  )
}

export default HomePage
