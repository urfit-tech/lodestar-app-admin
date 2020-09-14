import Icon, { CloseOutlined } from '@ant-design/icons'
import { Button, Divider, Layout, Skeleton, Tabs } from 'antd'
import moment from 'moment'
import React, { useContext } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import {
  AdminBlock,
  AdminBlockTitle,
  AdminHeader,
  AdminHeaderTitle,
  AdminTabBarWrapper,
} from '../../../components/admin'
import { CustomRatioImage } from '../../../components/common/Image'
import { StyledLayoutContent } from '../../../components/layout/DefaultLayout'
import MemberPermissionForm from '../../../components/profile/MemberPermissionForm'
import MemberNoteAdminModal from '../../../components/profile/MemberNoteAdminModal'
import MemberProfileBasicForm from '../../../components/profile/MemberProfileBasicForm'
import MemberPropertyAdminForm from '../../../components/profile/MemberPropertyAdminForm'
import AppContext from '../../../contexts/AppContext'
import { currencyFormatter } from '../../../helpers'
import { commonMessages } from '../../../helpers/translation'
import { useMemberAdmin } from '../../../hooks/member'
import DefaultAvatar from '../../../images/default/avatar.svg'
import { ReactComponent as EmailIcon } from '../../../images/icon/email.svg'
import { ReactComponent as FilePlusIcon } from '../../../images/icon/file-plus.svg'
import { ReactComponent as PhoneIcon } from '../../../images/icon/phone.svg'

const messages = defineMessages({
  profile: { id: 'profile.label.profile', defaultMessage: '個人' },
  note: { id: 'profile.label.note', defaultMessage: '備註' },
  basic: { id: 'profile.label.basic', defaultMessage: '基本資料' },
  property: { id: 'profile.label.property', defaultMessage: '自訂欄位' },
  permission: { id: 'profile.label.property', defaultMessage: '權限' },
  memberPage: { id: 'profile.ui.memberPage', defaultMessage: '學員主頁' },
  // translation naming convention
  createNote: { id: 'commonMessages.ui.createNote', defaultMessage: '新增備註' },
})

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

const MemberAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { memberId } = useParams<{ memberId: string }>()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const { enabledModules, settings } = useContext(AppContext)
  const { loadingMemberAdmin, errorMemberAdmin, memberAdmin, refetchMemberAdmin } = useMemberAdmin(memberId)

  if (loadingMemberAdmin || errorMemberAdmin || !memberAdmin) {
    return <Skeleton active />
  }

  return (
    <>
      <AdminHeader>
        <Link to="/admin/members">
          <Button type="link" className="mr-3">
            <CloseOutlined />
          </Button>
        </Link>

        <AdminHeaderTitle>{memberAdmin?.name || memberAdmin?.username || memberId}</AdminHeaderTitle>

        <a href={`//${settings['host']}/members/${memberId}`} target="_blank" rel="noopener noreferrer">
          <Button>{formatMessage(messages.memberPage)}</Button>
        </a>
      </AdminHeader>

      <Layout>
        <StyledSider width="320">
          <div className="text-center">
            <CustomRatioImage
              ratio={1}
              width="120px"
              src={memberAdmin?.avatarUrl || DefaultAvatar}
              shape="circle"
              className="mx-auto mb-3"
            />
            <StyledName className="mb-4">{memberAdmin?.name || memberAdmin?.username}</StyledName>
          </div>
          <StyledDescription>
            <Icon className="mr-2" component={() => <EmailIcon />} />
            <span>{memberAdmin?.email}</span>
          </StyledDescription>
          {memberAdmin?.phones.map(phone => (
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
            <span>{currencyFormatter(memberAdmin?.consumption || 0)}</span>
          </StyledDescription>
          {enabledModules.coin && (
            <StyledDescription>
              <StyledDescriptionLabel className="mr-3">
                {formatMessage(commonMessages.label.ownedCoins)}
              </StyledDescriptionLabel>
              <span>
                {memberAdmin?.coins || 0} {settings['coin.unit']}
              </span>
            </StyledDescription>
          )}
          <StyledDescription>
            <StyledDescriptionLabel className="mr-3">
              {formatMessage(commonMessages.label.lastLogin)}
            </StyledDescriptionLabel>
            <span>{memberAdmin?.loginedAt && moment(memberAdmin.loginedAt).format('YYYY-MM-DD')}</span>
          </StyledDescription>
          <StyledDescription>
            <StyledDescriptionLabel className="mr-3">
              {formatMessage(commonMessages.label.createdDate)}
            </StyledDescriptionLabel>
            <span>{memberAdmin?.createdAt && moment(memberAdmin.createdAt).format('YYYY-MM-DD')}</span>
          </StyledDescription>

          <Divider className="my-4" />
        </StyledSider>

        <StyledLayoutContent variant="gray">
          <Tabs
            activeKey={activeKey || 'profile'}
            onChange={key => setActiveKey(key)}
            renderTabBar={(props, DefaultTabBar) => (
              <AdminTabBarWrapper>
                <DefaultTabBar {...props} className="mb-0" />
              </AdminTabBarWrapper>
            )}
          >
            <Tabs.TabPane key="profile" tab={formatMessage(messages.profile)}>
              <div className="p-5">
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(messages.basic)}</AdminBlockTitle>
                  <MemberProfileBasicForm memberAdmin={memberAdmin} onRefetch={refetchMemberAdmin} />
                </AdminBlock>
                {enabledModules.member_property && (
                  <AdminBlock>
                    <AdminBlockTitle>{formatMessage(messages.property)}</AdminBlockTitle>
                    <MemberPropertyAdminForm memberAdmin={memberAdmin} onRefetch={refetchMemberAdmin} />
                  </AdminBlock>
                )}
              </div>
            </Tabs.TabPane>
            {enabledModules.member_note && (
              <Tabs.TabPane key="note" tab={formatMessage(messages.note)}>
                <div className="p-5">
                  <MemberNoteAdminModal
                    member={memberAdmin}
                    title={formatMessage(messages.createNote)}
                    renderTrigger={({ setVisible }) => (
                      <Button type="primary" onClick={() => setVisible(true)}>
                        <Icon component={() => <FilePlusIcon />} className="mr-1" />
                        <span>{formatMessage(messages.createNote)}</span>
                      </Button>
                    )}
                    onSubmit={() => alert('submit')}
                  />
                  <AdminBlock className="mt-4"></AdminBlock>
                </div>
              </Tabs.TabPane>
            )}
            <Tabs.TabPane key="permission" tab={formatMessage(messages.permission)}>
              <div className="p-5">
                <AdminBlock>
                  <MemberPermissionForm memberAdmin={memberAdmin} onRefetch={refetchMemberAdmin} />
                </AdminBlock>
              </div>
            </Tabs.TabPane>
            
          </Tabs>
        </StyledLayoutContent>
      </Layout>
    </>
  )
}

export default MemberAdminPage
