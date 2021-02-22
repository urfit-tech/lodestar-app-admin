import Icon from '@ant-design/icons'
import { Tabs } from 'antd'
import { AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import { useAuth } from 'lodestar-app-admin/src/contexts/AuthContext'
import { ReactComponent as PhoneIcon } from 'lodestar-app-admin/src/images/icon/phone.svg'
import React from 'react'
import { useIntl } from 'react-intl'
import { StringParam, useQueryParam } from 'use-query-params'
import { salesMessages } from '../../helpers/translation'
import { useSalesCallMember } from '../../hooks'
import CurrentLeadContactBlock from './CurrentLeadContactBlock'
import SalesCallContactedMemberBlock from './SalesCallContactedMemberBlock'
import SalesCallTransactedMemberBlock from './SalesCallTransactedMemberBlock'
import SalesSummaryBlock from './SalesSummaryBlock'

const SalesCallPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const {
    loadingMembers: loadingContactedMembers,
    members: contactedMembers,
    refetchMembers: refetchContactedMembers,
  } = useSalesCallMember({
    status: 'contacted',
    salesId: currentMemberId || '',
  })
  const {
    loadingMembers: loadingTransactedMembers,
    members: transactedMembers,
    refetchMembers: refetchTransactedMembers,
  } = useSalesCallMember({
    status: 'transacted',
    salesId: currentMemberId || '',
  })

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon className="mr-3" component={() => <PhoneIcon />} />
        <span>{formatMessage(salesMessages.label.salesCall)}</span>
      </AdminPageTitle>

      {currentMemberId && <SalesSummaryBlock salesId={currentMemberId} />}

      <Tabs activeKey={activeKey || 'potentials'} onChange={key => setActiveKey(key)}>
        <Tabs.TabPane key="potentials" tab={formatMessage(salesMessages.label.potentials)}>
          {currentMemberId && (
            <CurrentLeadContactBlock
              salesId={currentMemberId}
              onFinish={() => {
                refetchContactedMembers()
                refetchTransactedMembers()
              }}
            />
          )}
        </Tabs.TabPane>
        <Tabs.TabPane
          key="keep-in-touch"
          tab={`${formatMessage(salesMessages.label.keepInTouch)} (${contactedMembers.length})`}
        >
          {currentMemberId && !loadingContactedMembers && (
            <SalesCallContactedMemberBlock salesId={currentMemberId} members={contactedMembers} />
          )}
        </Tabs.TabPane>
        <Tabs.TabPane key="deals" tab={`${formatMessage(salesMessages.label.deals)} (${transactedMembers.length})`}>
          {currentMemberId && !loadingTransactedMembers && (
            <SalesCallTransactedMemberBlock salesId={currentMemberId} members={transactedMembers} />
          )}
        </Tabs.TabPane>
        <Tabs.TabPane key="revoked" tab={formatMessage(salesMessages.label.revoked)} disabled></Tabs.TabPane>
        <Tabs.TabPane key="rejected" tab={formatMessage(salesMessages.label.rejected)} disabled></Tabs.TabPane>
      </Tabs>
    </AdminLayout>
  )
}

export default SalesCallPage
