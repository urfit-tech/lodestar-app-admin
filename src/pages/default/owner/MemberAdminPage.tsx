import Icon, { CloseOutlined } from '@ant-design/icons'
import { Button, Divider, Layout, message, Skeleton, Tabs } from 'antd'
import moment from 'moment'
import { isEmpty } from 'ramda'
import React from 'react'
import { useIntl } from 'react-intl'
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
import MemberContractAdminBlock from '../../../components/member/MemberContractAdminBlock'
import MemberCouponAdminBlock from '../../../components/member/MemberCouponAdminBlock'
import MemberNoteAdminItem from '../../../components/member/MemberNoteAdminItem'
import MemberNoteAdminModal from '../../../components/member/MemberNoteAdminModal'
import MemberPermissionForm from '../../../components/member/MemberPermissionForm'
import MemberProfileBasicForm from '../../../components/member/MemberProfileBasicForm'
import MemberPropertyAdminForm from '../../../components/member/MemberPropertyAdminForm'
import MemberTaskAdminBlock from '../../../components/member/MemberTaskAdminBlock'
import SaleCollectionAdminCard from '../../../components/sale/SaleCollectionAdminCard'
import { useApp } from '../../../contexts/AppContext'
import { useAuth } from '../../../contexts/AuthContext'
import { currencyFormatter, handleError } from '../../../helpers'
import { commonMessages, memberMessages, promotionMessages } from '../../../helpers/translation'
import { useUploadAttachments } from '../../../hooks/data'
import { useMemberAdmin, useMutateMemberNote } from '../../../hooks/member'
import DefaultAvatar from '../../../images/default/avatar.svg'
import { ReactComponent as EmailIcon } from '../../../images/icon/email.svg'
import { ReactComponent as FilePlusIcon } from '../../../images/icon/file-plus.svg'
import { ReactComponent as PhoneIcon } from '../../../images/icon/phone.svg'

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
const StyledEmptyBlock = styled.div`
  display: grid;
  place-items: center;
  min-height: 560px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: var(--gray-dark);
`

const MemberAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { memberId } = useParams<{ memberId: string }>()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const { currentMemberId, currentUserRole, permissions } = useAuth()
  const { enabledModules, settings } = useApp()
  const { loadingMemberAdmin, errorMemberAdmin, memberAdmin, refetchMemberAdmin } = useMemberAdmin(memberId)
  const { insertMemberNote } = useMutateMemberNote()
  const uploadAttachments = useUploadAttachments()

  if (!currentMemberId || loadingMemberAdmin || errorMemberAdmin || !memberAdmin) {
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
          <Button>{formatMessage(memberMessages.ui.memberPage)}</Button>
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
          {permissions['MEMBER_PHONE_ADMIN'] &&
            memberAdmin?.phones.map(phone => (
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
            <Tabs.TabPane key="profile" tab={formatMessage(memberMessages.label.profile)}>
              <div className="p-5">
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(memberMessages.label.basic)}</AdminBlockTitle>
                  <MemberProfileBasicForm memberAdmin={memberAdmin} onRefetch={refetchMemberAdmin} />
                </AdminBlock>
                {enabledModules.member_property && (
                  <AdminBlock>
                    <AdminBlockTitle>{formatMessage(memberMessages.label.property)}</AdminBlockTitle>
                    <MemberPropertyAdminForm memberId={memberId} />
                  </AdminBlock>
                )}
              </div>
            </Tabs.TabPane>
            {enabledModules.member_note && (
              <Tabs.TabPane key="note" tab={formatMessage(memberMessages.label.note)}>
                <div className="p-5">
                  <MemberNoteAdminModal
                    member={memberAdmin}
                    title={formatMessage(memberMessages.label.createMemberNote)}
                    renderTrigger={({ setVisible }) => (
                      <Button type="primary" icon={<FilePlusIcon />} onClick={() => setVisible(true)}>
                        {formatMessage(memberMessages.label.createMemberNote)}
                      </Button>
                    )}
                    onSubmit={({ type, status, duration, description, attachments }) =>
                      insertMemberNote({
                        variables: {
                          memberId: memberAdmin.id,
                          authorId: currentMemberId,
                          type,
                          status,
                          duration,
                          description,
                        },
                      })
                        .then(async ({ data }) => {
                          const memberNoteId = data?.insert_member_note_one?.id
                          if (memberNoteId && attachments.length) {
                            await uploadAttachments('MemberNote', memberNoteId, attachments)
                          }
                          message.success(formatMessage(commonMessages.event.successfullyCreated))
                          refetchMemberAdmin()
                        })
                        .catch(handleError)
                    }
                  />
                  <AdminBlock className="mt-4">
                    {isEmpty(memberAdmin.notes) ? (
                      <StyledEmptyBlock>
                        <span>{formatMessage(memberMessages.text.noMemberNote)}</span>
                      </StyledEmptyBlock>
                    ) : (
                      memberAdmin.notes.map(note => (
                        <MemberNoteAdminItem
                          key={note.id}
                          note={note}
                          memberAdmin={memberAdmin}
                          onRefetch={refetchMemberAdmin}
                        />
                      ))
                    )}
                  </AdminBlock>
                </div>
              </Tabs.TabPane>
            )}
            {enabledModules.member_task && permissions.TASK_ADMIN && (
              <Tabs.TabPane key="task" tab={formatMessage(memberMessages.label.task)}>
                <div className="p-5">
                  <MemberTaskAdminBlock memberId={memberId} />
                </div>
              </Tabs.TabPane>
            )}
            <Tabs.TabPane key="coupon" tab={formatMessage(promotionMessages.term.coupon)}>
              <div className="p-5">
                <MemberCouponAdminBlock coupons={memberAdmin.coupons} />
              </div>
            </Tabs.TabPane>
            {enabledModules.contract && (
              <Tabs.TabPane key="contract" tab={formatMessage(memberMessages.label.contract)}>
                <div className="p-5">
                  <MemberContractAdminBlock memberId={memberId} />
                </div>
              </Tabs.TabPane>
            )}
            {currentUserRole === 'app-owner' && (
              <Tabs.TabPane key="order" tab={formatMessage(memberMessages.label.order)}>
                <div className="p-5">
                  <SaleCollectionAdminCard memberId={memberId} />
                </div>
              </Tabs.TabPane>
            )}
            {currentUserRole === 'app-owner' && (
              <Tabs.TabPane key="permission" tab={formatMessage(memberMessages.label.permission)}>
                <div className="p-5">
                  <AdminBlock>
                    <MemberPermissionForm memberAdmin={memberAdmin} onRefetch={refetchMemberAdmin} />
                  </AdminBlock>
                </div>
              </Tabs.TabPane>
            )}
          </Tabs>
        </StyledLayoutContent>
      </Layout>
    </>
  )
}

export default MemberAdminPage
