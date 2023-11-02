import { Icon as LegacyIcon } from '@ant-design/compatible'
import { LogoutOutlined, MenuOutlined } from '@ant-design/icons'
import { Button, List, Popover } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import { useMember } from '../../hooks/member'
import settings from '../../settings'
import AdminMenu from '../admin/AdminMenu'
import { AuthModalContext } from '../auth/AuthModal'
import MemberAvatar from './MemberAvatar'
import Responsive from './Responsive'

const Wrapper = styled.div`
  padding: 12px 0;
  width: 100vw;
  max-width: 320px;
`
const StyledList = styled(List)`
  && {
    padding: 0 12px;
    max-height: 70vh;
    overflow-y: auto;
    overflow-x: hidden;
  }
`
const BlankIcon = styled.i`
  display: inline-block;
  width: 16px;
  height: 16px;
`
const BorderedItem = styled(List.Item)`
  border-bottom: 1px solid #e8e8e8;

  &.shift-left {
    margin-left: -24px;
    margin-right: -12px;
  }
`

const MenuButtonStyle = styled(Button)`
  @media screen and (max-width: 480px) {
    padding: 18px 5px;
    width: 24px;
  }
`

const MemberProfileButton: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { isAuthenticated, logout } = useAuth()
  const { setVisible } = useContext(AuthModalContext)
  const { member } = useMember(memberId)
  const navLinks = settings.navLinks

  const CustomNavLinks = navLinks.map((navLink, idx) => (
    <List.Item
      key={idx}
      onClick={() => (navLink.external ? window.location.assign(navLink.href) : history.push(navLink.href))}
      style={{ cursor: 'pointer' }}
    >
      {navLink.icon ? <LegacyIcon type={navLink.icon} className="mr-2" /> : <BlankIcon className="mr-2" />}
      {navLink.label}
    </List.Item>
  ))

  const content = (
    <Wrapper>
      <StyledList split={false}>
        <BorderedItem className="justify-content-between">
          <div>{member && member.name}</div>
          <Responsive.Default>
            <MemberAvatar size="36px" memberId={memberId} />
          </Responsive.Default>
        </BorderedItem>

        <Responsive.Default>
          <BorderedItem className="shift-left">
            <AdminMenu opened={true} />
          </BorderedItem>
        </Responsive.Default>

        <List.Item className="cursor-pointer" onClick={() => logout?.().then(() => history.push(`/`))}>
          <LogoutOutlined className="mr-2" />
          {formatMessage(commonMessages.ui.logout)}
        </List.Item>
      </StyledList>
    </Wrapper>
  )

  return isAuthenticated ? (
    <>
      <Responsive.Default>
        <Popover placement="bottomRight" trigger="click" content={content} className="ml-2">
          <MenuButtonStyle type="link" icon={<MenuOutlined />} />
        </Popover>
      </Responsive.Default>
      <Responsive.Desktop>
        <Popover placement="bottomRight" trigger="click" content={content} className="ml-2">
          <div className="cursor-pointer">
            <MemberAvatar size="36px" memberId={memberId} />
          </div>
        </Popover>
      </Responsive.Desktop>
    </>
  ) : (
    <>
      <Responsive.Default>
        <Button className="ml-2 mr-2" onClick={() => setVisible && setVisible(true)}>
          {formatMessage(commonMessages.ui.login)}
        </Button>
        <Popover
          placement="bottomRight"
          trigger="click"
          content={
            <Wrapper>
              <StyledList split={false}>{CustomNavLinks}</StyledList>
            </Wrapper>
          }
        >
          <MenuButtonStyle type="link" icon={<MenuOutlined />} />
        </Popover>
      </Responsive.Default>

      <Responsive.Desktop>
        <Button className="ml-2" onClick={() => setVisible && setVisible(true)}>
          {formatMessage(commonMessages.ui.loginAndRegister)}
        </Button>
      </Responsive.Desktop>
    </>
  )
}

export default MemberProfileButton
