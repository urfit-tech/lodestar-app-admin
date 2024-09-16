import { Skeleton, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import { AdminBlock, AdminBlockTitle } from '../../components/admin'
import MemberCoinAdminBlock from '../../components/coin/MemberCoinAdminBlock'
import MemberContractAdminBlock from '../../components/contract/MemberContractAdminBlock'
import MemberCouponAdminBlock from '../../components/coupon/MemberCouponAdminBlock'
import MemberEventCalendarBlock from '../../components/event/MemberEventCalendarBlock'
import MemberPermissionForm from '../../components/member/MemberPermissionForm'
import MemberProfileAbstractForm from '../../components/member/MemberProfileAbstractForm'
import MemberProfileBasicForm from '../../components/member/MemberProfileBasicForm'
import MemberPropertyAdminForm from '../../components/member/MemberPropertyAdminForm'
import MemberNoteAdminBlock from '../../components/note/MemberNoteAdminBlock'
import SaleCollectionAdminCard from '../../components/sale/SaleCollectionAdminCard'
import MemberTaskCollectionBlock from '../../components/task/MemberTaskCollectionBlock'
import MemberVoucherAdminBlock from '../../components/voucher/MemberVoucherAdminBlock'
import {
  createEventAndInviteResourceFetcher,
  deleteEvent,
  getDefaultResourceEventsFethcer,
  updateEvent,
} from '../../helpers/eventHelper/eventFetchers'
import { commonMessages, memberMessages, promotionMessages } from '../../helpers/translation'
import { useMemberAdmin } from '../../hooks/member'
import MemberAdminLayout from './MemberAdminLayout'
import MemberHistoryAdminBlock from './MemberHistoryAdminBlock'

const MemberAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { permissions, currentUserRole, authToken } = useAuth()
  const { memberId } = useParams<{ memberId: string }>()
  const { enabledModules } = useApp()
  const { loadingMemberAdmin, errorMemberAdmin, memberAdmin, refetchMemberAdmin } = useMemberAdmin(memberId)

  if (loadingMemberAdmin || errorMemberAdmin || !memberAdmin) {
    return <Skeleton active />
  }
  return (
    <MemberAdminLayout
      member={memberAdmin}
      onRefetch={refetchMemberAdmin}
      tabPanes={[
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
            <AdminBlock>
              <AdminBlockTitle>{formatMessage(memberMessages.label.abstract)}</AdminBlockTitle>
              <MemberProfileAbstractForm memberAdmin={memberAdmin} onRefetch={refetchMemberAdmin} />
            </AdminBlock>
          </div>
        </Tabs.TabPane>,
        enabledModules.member_note && (permissions.MEMBER_NOTE_ADMIN || permissions.VIEW_ALL_MEMBER_NOTE) && (
          <Tabs.TabPane key="note" tab={formatMessage(memberMessages.label.note)}>
            <MemberNoteAdminBlock memberId={memberId} />
          </Tabs.TabPane>
        ),
        enabledModules.event_arrangement && (
          <Tabs.TabPane key="event" tab={formatMessage(memberMessages.label.event)}>
            <div className="p-5">
              <MemberEventCalendarBlock
                memberId={memberId}
                defaultResourceEventsFetcher={getDefaultResourceEventsFethcer(authToken as string)({
                  type: 'member',
                  targets: [memberId],
                })}
                createResourceEventFetcher={createEventAndInviteResourceFetcher(authToken as string)}
                updateResourceEventFetcher={updateEvent(authToken as string)}
                deleteResourceEventFetcher={deleteEvent(authToken as string)}
              />
            </div>
          </Tabs.TabPane>
        ),
        enabledModules.member_task && (
          <Tabs.TabPane key="task" tab={formatMessage(memberMessages.label.task)}>
            <div className="p-5">
              <MemberTaskCollectionBlock memberId={memberId} />
            </div>
          </Tabs.TabPane>
        ),
        Boolean(permissions.MEMBER_COUPON_PLAN_VIEW) && (
          <Tabs.TabPane key="coupon" tab={formatMessage(promotionMessages.label.coupon)}>
            <div className="p-5">
              <MemberCouponAdminBlock memberId={memberId} />
            </div>
          </Tabs.TabPane>
        ),
        enabledModules.voucher && Boolean(permissions.MEMBER_VOUCHER_PLAN_VIEW) && (
          <Tabs.TabPane key="voucher" tab={formatMessage(promotionMessages.label.voucher)}>
            <div className="p-5">
              <MemberVoucherAdminBlock memberId={memberId} />
            </div>
          </Tabs.TabPane>
        ),
        enabledModules.coin && (permissions.COIN_ADMIN || permissions.CHECK_MEMBER_COIN) && (
          <Tabs.TabPane key="coin" tab={formatMessage(commonMessages.menu.coinHistory)}>
            <div className="p-5">
              <MemberCoinAdminBlock memberId={memberId} withSendingModal={false} />
            </div>
          </Tabs.TabPane>
        ),
        enabledModules.contract && (
          <Tabs.TabPane key="contract" tab={formatMessage(memberMessages.label.contract)}>
            <div className="p-5">
              <MemberContractAdminBlock memberId={memberId} />
            </div>
          </Tabs.TabPane>
        ),
        (permissions.SALES_RECORDS_ADMIN || permissions.CHECK_MEMBER_ORDER) && (
          <Tabs.TabPane key="order" tab={formatMessage(memberMessages.label.order)}>
            <div className="p-5">
              <SaleCollectionAdminCard memberId={memberId} isShowRefetchButton />
            </div>
          </Tabs.TabPane>
        ),

        permissions.CHECK_MEMBER_HISTORY && (
          <Tabs.TabPane key="history" tab={formatMessage(memberMessages.label.history)}>
            <div className="p-5">
              <MemberHistoryAdminBlock memberId={memberId} />
            </div>
          </Tabs.TabPane>
        ),
        currentUserRole === 'app-owner' && (
          <Tabs.TabPane key="permission" tab={formatMessage(memberMessages.label.permission)}>
            <div className="p-5">
              <AdminBlock>
                <MemberPermissionForm memberAdmin={memberAdmin} onRefetch={refetchMemberAdmin} />
              </AdminBlock>
            </div>
          </Tabs.TabPane>
        ),
      ]}
    />
  )
}

export default MemberAdminPage
