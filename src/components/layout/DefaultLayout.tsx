import { DownOutlined } from '@ant-design/icons'
import { Button, Divider, Dropdown, Layout, Menu } from 'antd'
import React, { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { footerHeight } from '.'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import LanguageContext from '../../contexts/LanguageContext'
import settings from '../../settings'
import AuthModal, { AuthModalContext } from '../auth/AuthModal'
import Footer from '../common/Footer'
import MemberProfileButton from '../common/MemberProfileButton'
import { BREAK_POINT } from '../common/Responsive'
import NotificationDropdown from '../notification/NotificationDropdown'

const StyledLayout = styled(Layout)`
  &.bg-white {
    background: white;
  }
`
const StyledLayoutHeader = styled(Layout.Header)`
  border-bottom: 1px solid #ececec;
`
export const StyledLayoutContent = styled(Layout.Content)<{ variant?: 'default' | 'gray' }>`
  height: calc(100vh - 64px);
  overflow-y: auto;
  ${props => (props.variant === 'gray' ? 'background: var(--gray-lighter);' : '')}
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
const StyledButton = styled(Button)`
  && {
    color: var(--gray-dark);
    font-size: 14px;
  }
`

type DefaultLayoutProps = {
  white?: boolean
  noFooter?: boolean
  centeredBox?: boolean
  renderTitle?: () => React.ReactNode
}
const DefaultLayout: React.FC<DefaultLayoutProps> = ({ white, noFooter, centeredBox, renderTitle, children }) => {
  const [visible, setVisible] = useState(false)

  return (
    <AuthModalContext.Provider value={{ visible, setVisible }}>
      <AuthModal />
      <DefaultLayoutHeader renderTitle={renderTitle} />
      <StyledLayout className={white ? 'bg-white' : ''}>
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

export const DefaultLayoutHeader: React.FC<{ renderTitle?: () => React.ReactNode }> = ({ renderTitle }) => {
  const { currentMemberId } = useAuth()
  const { enabledModules, id: appId } = useContext(AppContext)
  const { currentLanguage, setCurrentLanguage } = useContext(LanguageContext)

  let Logo: string | undefined
  try {
    Logo = require(`../../images/${appId}/logo.svg`)
  } catch {
    try {
      Logo = require(`../../images/${appId}/logo.png`)
    } catch {
      try {
        Logo = require(`../../images/${appId}/logo.jpg`)
      } catch {
        Logo = undefined
      }
    }
  }

  return (
    <StyledLayoutHeader className="d-flex align-items-center justify-content-between">
      {renderTitle ? (
        renderTitle()
      ) : (
        <Link to={`/`} className="d-flex align-items-center">
          {Logo ? <img src={Logo} alt="logo" className="header-logo" /> : settings.seo.name || 'Home'}
        </Link>
      )}

      <div className="d-flex align-items-center">
        {enabledModules.locale && (
          <>
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  <Menu.Item key="zh">
                    <StyledButton
                      type="link"
                      size="small"
                      onClick={() => setCurrentLanguage && setCurrentLanguage('zh')}
                    >
                      繁體中文
                    </StyledButton>
                  </Menu.Item>
                  <Menu.Item key="en">
                    <StyledButton
                      type="link"
                      size="small"
                      onClick={() => setCurrentLanguage && setCurrentLanguage('en')}
                    >
                      English
                    </StyledButton>
                  </Menu.Item>
                  <Menu.Item key="vi">
                    <StyledButton
                      type="link"
                      size="small"
                      onClick={() => setCurrentLanguage && setCurrentLanguage('vi')}
                    >
                      Tiếng việt
                    </StyledButton>
                  </Menu.Item>
                </Menu>
              }
            >
              <StyledButton type="link" size="small">
                {currentLanguage === 'en' ? 'EN' : currentLanguage === 'vi' ? 'Tiếng việt' : '繁中'}
                <DownOutlined />
              </StyledButton>
            </Dropdown>
            <Divider type="vertical" />
          </>
        )}
        {currentMemberId && <NotificationDropdown memberId={currentMemberId} />}
        {currentMemberId && <MemberProfileButton memberId={currentMemberId} />}
      </div>
    </StyledLayoutHeader>
  )
}

export default DefaultLayout
