import Icon, { CloseOutlined } from '@ant-design/icons'
import { Button, Divider, Layout, Tabs } from 'antd'
import moment from 'moment'
import React from 'react'
import { useIntl } from 'react-intl'
import { Link, useHistory, useLocation, useRouteMatch } from 'react-router-dom'
import styled from 'styled-components'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { useCustomRenderer } from '../../contexts/CustomRendererContext'
import { currencyFormatter } from '../../helpers'
import { commonMessages, memberMessages, promotionMessages } from '../../helpers/translation'
import DefaultAvatar from '../../images/default/avatar.svg'
import { ReactComponent as EmailIcon } from '../../images/icon/email.svg'
import { ReactComponent as PhoneIcon } from '../../images/icon/phone.svg'
import { routesProps } from '../../Routes'
import { AppProps } from '../../types/app'
import { CouponPlanProps } from '../../types/checkout'
import { MemberAdminProps, UserRole } from '../../types/member'
import { AdminHeader, AdminHeaderTitle, AdminTabBarWrapper } from '../admin'
import { CustomRatioImage } from '../common/Image'
import { StyledLayoutContent } from './DefaultLayout'

export type renderMemberAdminLayoutProps = {
  activeKey?: string
  enabledModules?: AppProps['enabledModules']
  permissions?: { [key: string]: boolean }
  currentUserRole?: UserRole
  defaultTabPanes: (React.ReactElement | boolean | undefined)[]
  children?: React.ReactNode
}

const StyledSider = styled(Layout.Sider)`
  padding: 2.5rem 2rem;
`
const StyledName = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
`
const StyledDescription = styled.div`
  margin-bottom: 0.75rem;
  color: var(--gray-darker);
`
const StyledDescriptionLabel = styled.span`
  color: var(--gray-dark);
  font-size: 14px;
`
export const StyledEmptyBlock = styled.div`
  display: grid;
  place-items: center;
  min-height: 560px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: var(--gray-dark);
`

const MemberAdminLayout: React.FC<{
  member: MemberAdminProps & {
    coupons: {
      status: {
        outdated: boolean
        used: boolean
      }
      couponPlan: CouponPlanProps & {
        productIds: string[]
      }
    }[]
  }
}> = ({ member, children }) => {
  const history = useHistory()
  const location = useLocation()
  const match = useRouteMatch(routesProps.owner_member.path)
  const { currentUserRole, permissions } = useAuth()
  const { enabledModules, settings } = useApp()
  const { formatMessage } = useIntl()
  const { renderMemberAdminLayout } = useCustomRenderer()

  const activeKey = match?.isExact ? 'profile' : location.pathname.replace(match?.url || '', '').substring(1)

  const defaultTabPanes: renderMemberAdminLayoutProps['defaultTabPanes'] = [
    <Tabs.TabPane key="profile" tab={formatMessage(memberMessages.label.profile)}>
      {activeKey === 'profile' && children}
    </Tabs.TabPane>,
    enabledModules.member_note && (
      <Tabs.TabPane key="note" tab={formatMessage(memberMessages.label.note)}>
        {activeKey === 'note' && children}
      </Tabs.TabPane>
    ),
    enabledModules.member_task && permissions.TASK_ADMIN && (
      <Tabs.TabPane key="task" tab={formatMessage(memberMessages.label.task)}>
        {activeKey === 'task' && children}
      </Tabs.TabPane>
    ),
    <Tabs.TabPane key="coupon" tab={formatMessage(promotionMessages.term.coupon)}>
      {activeKey === 'coupon' && children}
    </Tabs.TabPane>,
    enabledModules.contract && (
      <Tabs.TabPane key="contract" tab={formatMessage(memberMessages.label.contract)}>
        {activeKey === 'contract' && children}
      </Tabs.TabPane>
    ),
    currentUserRole === 'app-owner' && (
      <Tabs.TabPane key="order" tab={formatMessage(memberMessages.label.order)}>
        {activeKey === 'order' && children}
      </Tabs.TabPane>
    ),
    currentUserRole === 'app-owner' && (
      <Tabs.TabPane key="permission" tab={formatMessage(memberMessages.label.permission)}>
        {activeKey === 'permission' && children}
      </Tabs.TabPane>
    ),
  ]

  return (
    <>
      <AdminHeader>
        <Link to="/admin/members">
          <Button type="link" className="mr-3">
            <CloseOutlined />
          </Button>
        </Link>

        <AdminHeaderTitle>{member?.name || member?.username || member.id}</AdminHeaderTitle>

        <a href={`//${settings['host']}/members/${member.id}`} target="_blank" rel="noopener noreferrer">
          <Button>{formatMessage(memberMessages.ui.memberPage)}</Button>
        </a>
      </AdminHeader>

      <Layout>
        <StyledSider width="320">
          <div className="text-center">
            <CustomRatioImage
              ratio={1}
              width="120px"
              src={member?.avatarUrl || DefaultAvatar}
              shape="circle"
              className="mx-auto mb-3"
            />
            <StyledName className="mb-4">{member?.name || member?.username}</StyledName>
          </div>
          <StyledDescription>
            <Icon className="mr-2" component={() => <EmailIcon />} />
            <span>{member?.email}</span>
          </StyledDescription>
          {permissions['MEMBER_PHONE_ADMIN'] &&
            member?.phones.map(phone => (
              <StyledDescription key={phone}>
                <Icon className="mr-2" component={() => <PhoneIcon />} />
                <span>{phone}</span>
              </StyledDescription>
            ))}

          <Divider className="my-4" />

          <StyledDescription>
            <StyledDescriptionLabel className="mr-3">
              {formatMessage(commonMessages.label.consumption)}
            </StyledDescriptionLabel>
            <span>{currencyFormatter(member?.consumption || 0)}</span>
          </StyledDescription>
          {enabledModules.coin && (
            <StyledDescription>
              <StyledDescriptionLabel className="mr-3">
                {formatMessage(commonMessages.label.ownedCoins)}
              </StyledDescriptionLabel>
              <span>
                {member?.coins || 0} {settings['coin.unit']}
              </span>
            </StyledDescription>
          )}
          <StyledDescription>
            <StyledDescriptionLabel className="mr-3">
              {formatMessage(commonMessages.label.lastLogin)}
            </StyledDescriptionLabel>
            <span>{member?.loginedAt && moment(member.loginedAt).format('YYYY-MM-DD')}</span>
          </StyledDescription>
          <StyledDescription>
            <StyledDescriptionLabel className="mr-3">
              {formatMessage(commonMessages.label.createdDate)}
            </StyledDescriptionLabel>
            <span>{member?.createdAt && moment(member.createdAt).format('YYYY-MM-DD')}</span>
          </StyledDescription>

          <Divider className="my-4" />

          {renderMemberAdminLayout?.sider?.()}
        </StyledSider>

        <StyledLayoutContent variant="gray">
          <Tabs
            activeKey={activeKey}
            onChange={key => {
              history.push(`/admin/members/${member.id}/${key}`)
            }}
            renderTabBar={(props, DefaultTabBar) => (
              <AdminTabBarWrapper>
                <DefaultTabBar {...props} className="mb-0" />
              </AdminTabBarWrapper>
            )}
          >
            {renderMemberAdminLayout?.content?.({
              enabledModules,
              permissions,
              currentUserRole,
              defaultTabPanes,
              children,
              activeKey,
            }) || defaultTabPanes}
          </Tabs>
        </StyledLayoutContent>
      </Layout>
    </>
  )
}

export default MemberAdminLayout
