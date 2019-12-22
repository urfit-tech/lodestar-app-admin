import { Button, Layout } from 'antd'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { footerHeight } from '.'
import settings from '../../settings'
import { useAuth } from '../auth/AuthContext'
import AuthModal, { AuthModalContext } from '../auth/AuthModal'
import Footer from '../common/Footer'
import MemberProfileButton from '../common/MemberProfileButton'
import { BREAK_POINT } from '../common/Responsive'
import NotificationDropdown from '../notification/NotificationDropdown'

let Logo: string | undefined
try {
  Logo = require(`../../images/${localStorage.getItem('kolable.app.id')}/logo.svg`)
} catch {
  try {
    Logo = require(`../../images/${localStorage.getItem('kolable.app.id')}/logo.png`)
  } catch {
    try {
      Logo = require(`../../images/${localStorage.getItem('kolable.app.id')}/logo.jpg`)
    } catch {
      Logo = undefined
    }
  }
}

const StyledLayout = styled(Layout)`
  &.bg-white {
    background: white;
  }
`
const StyledLayoutHeader = styled(Layout.Header)`
  border-bottom: 1px solid #ececec;
`
export const StyledLayoutContent = styled(Layout.Content)`
  height: calc(100vh - 64px);
  overflow-y: auto;
`
const StyledContainer = styled.div<{ noFooter?: boolean; centeredBox?: boolean }>`
  min-height: calc(100vh - 64px - ${props => (props.noFooter ? '0' : footerHeight)}px);

  ${props =>
    props.centeredBox
      ? css`
          display: flex;
          align-items: center;
          justify-content: center;
        `
      : ''}
`
const CenteredBox = styled.div`
  margin: 1rem;
  width: 100%;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);

  @media (min-width: ${BREAK_POINT}px) {
    width: calc(100% / 3);
  }
`
const StyledNavLinkButton = styled(Button)`
  && {
    color: #585858;
    line-height: 1.5;
  }
`

type DefaultLayoutProps = {
  white?: boolean
  noFooter?: boolean
  noCart?: boolean
  centeredBox?: boolean
  renderTitle?: () => React.ReactNode
}
const DefaultLayout: React.FC<DefaultLayoutProps> = ({
  white,
  noFooter,
  noCart,
  centeredBox,
  renderTitle,
  children,
}) => {
  const [visible, setVisible] = useState(false)
  const { currentMemberId, isAuthenticated } = useAuth()

  return (
    <AuthModalContext.Provider value={{ visible, setVisible }}>
      <AuthModal />

      <StyledLayout className={white ? 'bg-white' : ''}>
        <StyledLayoutHeader className="d-flex align-items-center justify-content-between">
          {renderTitle ? (
            renderTitle()
          ) : (
            <Link to={`/`} className="d-flex align-items-center">
              {Logo ? <img src={Logo} alt="logo" className="header-logo" /> : settings.seo.name || '首頁'}
            </Link>
          )}

          <div className="d-flex align-items-center">
            {isAuthenticated && currentMemberId && <NotificationDropdown memberId={currentMemberId} />}
            {currentMemberId && <MemberProfileButton memberId={currentMemberId} />}
          </div>
        </StyledLayoutHeader>

        <StyledLayoutContent id="layout-content">
          <StyledContainer noFooter={noFooter} centeredBox={centeredBox}>
            {centeredBox ? <CenteredBox>{children}</CenteredBox> : children}
          </StyledContainer>

          {!noFooter && <Footer />}
        </StyledLayoutContent>
      </StyledLayout>
    </AuthModalContext.Provider>
  )
}

export default DefaultLayout
