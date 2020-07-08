import { Button, Icon, List, Popover } from 'antd'
import React, { useContext } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import MemberAvatar from '../../containers/common/MemberAvatar'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages } from '../../helpers/translation'
import { useMember } from '../../hooks/member'
import settings from '../../settings'
import { CreatorAdminMenu, OwnerAdminMenu } from '../admin/AdminMenu'
import { AuthModalContext } from '../auth/AuthModal'
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

const messages = defineMessages({
  memberPage: { id: 'common.label.memberPage', defaultMessage: '我的主頁' },
})

const MemberProfileButton: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { currentMemberId, isAuthenticated, currentUserRole, logout } = useAuth()
  const { setVisible } = useContext(AuthModalContext)
  const { member } = useMember(memberId)
  const navLinks = settings.navLinks

  const CustomNavLinks = navLinks.map((navLink, idx) => (
    <List.Item
      key={idx}
      onClick={() => (navLink.external ? window.location.assign(navLink.href) : history.push(navLink.href))}
      style={{ cursor: 'pointer' }}
    >
      {navLink.icon ? <Icon type={navLink.icon} className="mr-2" /> : <BlankIcon className="mr-2" />}
      {navLink.label}
    </List.Item>
  ))

  const content = (
    <Wrapper>
      <StyledList split={false}>
        <BorderedItem className="justify-content-between">
          <div>{member && member.name}</div>
          <Responsive.Default>
            <MemberAvatar memberId={currentMemberId || ''} size={36} />
          </Responsive.Default>
        </BorderedItem>

        <Responsive.Default>
          {CustomNavLinks}
          {isAuthenticated && (
            <BorderedItem onClick={() => history.push(`/members/${currentMemberId}`)} style={{ cursor: 'pointer' }}>
              <BlankIcon className="mr-2" />
              {formatMessage(messages.memberPage)}
            </BorderedItem>
          )}
          <BorderedItem className="shift-left">
            {currentUserRole === 'app-owner' ? (
              <OwnerAdminMenu style={{ border: 'none' }} />
            ) : currentUserRole === 'content-creator' ? (
              <CreatorAdminMenu style={{ border: 'none' }} />
            ) : null}
          </BorderedItem>
        </Responsive.Default>

        <List.Item
          style={{ cursor: 'pointer' }}
          onClick={() => {
            logout && logout()
            history.push('/')
          }}
        >
          <Icon type="logout" className="mr-2" />
          {formatMessage(commonMessages.ui.logout)}
        </List.Item>
      </StyledList>
    </Wrapper>
  )

  return isAuthenticated ? (
    <Popover placement="bottomRight" trigger="click" content={content} className="ml-2">
      <Responsive.Default>
        <Button type="link" icon="menu" />
      </Responsive.Default>

      <Responsive.Desktop>
        <div className="cursor-pointer">
          <MemberAvatar memberId={currentMemberId || ''} size={36} />
        </div>
      </Responsive.Desktop>
    </Popover>
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
          <Button type="link" icon="menu" />
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
