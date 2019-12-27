import { Button, Icon, List, Popover } from 'antd'
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import { useMember, useMemberPoint } from '../../hooks/member'
import settings from '../../settings'
import { CreatorAdminMenu, OwnerAdminMenu } from '../admin/AdminMenu'
import { useAuth } from '../auth/AuthContext'
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

const MemberPointItem: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { numPoints } = useMemberPoint(memberId)
  return (
    <Link to="/settings/point_history">
      <div>{numPoints} 點</div>
    </Link>
  )
}

const MemberProfileButton: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { history } = useRouter()
  const { member } = useMember(memberId)
  const { currentMemberId, isAuthenticated, currentUserRole, setAuthToken } = useAuth()
  const { setVisible } = useContext(AuthModalContext)
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
          <div>
            {member && member.name}
            <br />
            {currentMemberId && isAuthenticated && <MemberPointItem memberId={currentMemberId} />}
          </div>
          <Responsive.Default>
            <MemberAvatar memberId={currentMemberId || ''} size={36} />
          </Responsive.Default>
        </BorderedItem>

        <Responsive.Default>
          {CustomNavLinks}
          {isAuthenticated && (
            <BorderedItem onClick={() => history.push(`/members/${currentMemberId}`)} style={{ cursor: 'pointer' }}>
              <BlankIcon className="mr-2" />
              我的主頁
            </BorderedItem>
          )}
        </Responsive.Default>

        <BorderedItem className="shift-left">
          {currentUserRole === 'app-owner' ? (
            <OwnerAdminMenu style={{ border: 'none' }} />
          ) : currentUserRole === 'content-creator' ? (
            <CreatorAdminMenu style={{ border: 'none' }} />
          ) : null}
        </BorderedItem>

        <List.Item
          style={{ cursor: 'pointer' }}
          onClick={() => {
            try {
              localStorage.removeItem(`kolable.auth.token`)
            } catch (error) {}
            setAuthToken && setAuthToken(null)
          }}
        >
          <Icon type="logout" className="mr-2" />
          登出
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
          登入
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
          登入 / 註冊
        </Button>
      </Responsive.Desktop>
    </>
  )
}

export default MemberProfileButton
