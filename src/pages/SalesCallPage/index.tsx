import Icon from '@ant-design/icons'
import { Skeleton, Tabs } from 'antd'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import { errorMessages } from '../../helpers/translation'
import { ReactComponent as PhoneIcon } from '../../images/icon/phone.svg'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { StringParam, useQueryParam } from 'use-query-params'
import { salesMessages } from '../../helpers/translation'
import CurrentLeadContactBlock from './CurrentLeadContactBlock'
import SalesCallContactedMemberBlock from './SalesCallContactedMemberBlock'
import SalesCallTransactedMemberBlock from './SalesCallTransactedMemberBlock'
import { SalesCallMemberProps, useSales, useSalesCallMember } from './salesHooks'
import SalesSummaryBlock from './SalesSummaryBlock'

const SalesCallPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon className="mr-3" component={() => <PhoneIcon />} />
        <span>{formatMessage(salesMessages.salesCall)}</span>
      </AdminPageTitle>

      {currentMemberId ? <SalesCallBlock currentMemberId={currentMemberId} /> : <Skeleton active />}
    </AdminLayout>
  )
}

const SalesCallBlock: React.VFC<{
  currentMemberId: string
}> = ({ currentMemberId }) => {
  const { formatMessage } = useIntl()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)

  const { loadingSales, errorSales, sales } = useSales(currentMemberId)
  const {
    loadingMembers: loadingContactedMembers,
    members: contactedMembers,
    totalMembers: totalContactedMembers,
  } = useSalesCallMember(currentMemberId, 'contacted')
  const {
    loadingMembers: loadingTransactedMembers,
    members: transactedMembers,
    totalMembers: totalTransactedMembers,
  } = useSalesCallMember(currentMemberId, 'transacted')

  const [submittedPotentialMembers, setSubmittedPotentialMembers] = useState<SalesCallMemberProps[]>([])

  if (loadingSales) {
    return <Skeleton active />
  }

  if (errorSales || !sales) {
    return <>{formatMessage(errorMessages.data.fetch)}</>
  }

  return (
    <>
      <SalesSummaryBlock sales={sales} />

      <Tabs activeKey={activeKey || 'potentials'} onChange={key => setActiveKey(key)}>
        <Tabs.TabPane key="potentials" tab={formatMessage(salesMessages.potentials)}>
          <CurrentLeadContactBlock
            sales={sales}
            onSubmit={(status, member) => {
              status === 'willing' &&
                setSubmittedPotentialMembers(prev => [
                  {
                    id: member.id,
                    name: member.name,
                    email: member.email,
                    phones: member.phones,
                    categoryNames: member.categories.map(category => category.name),
                    lastContactAt: new Date(),
                    lastTask: null,
                    contracts: [],
                  },
                  ...prev,
                ])
            }}
          />
        </Tabs.TabPane>
        <Tabs.TabPane
          key="keep-in-touch"
          tab={`${formatMessage(salesMessages.keepInTouch)} (${
            totalContactedMembers + submittedPotentialMembers.length
          })`}
        >
          <SalesCallContactedMemberBlock
            sales={sales}
            members={[...submittedPotentialMembers, ...contactedMembers]}
            loadingMembers={loadingContactedMembers}
          />
        </Tabs.TabPane>
        <Tabs.TabPane key="deals" tab={`${formatMessage(salesMessages.deals)} (${totalTransactedMembers})`}>
          <SalesCallTransactedMemberBlock
            sales={sales}
            members={transactedMembers}
            loadingMembers={loadingTransactedMembers}
          />
        </Tabs.TabPane>
        <Tabs.TabPane key="revoked" tab={formatMessage(salesMessages.revoked)} disabled></Tabs.TabPane>
        <Tabs.TabPane key="rejected" tab={formatMessage(salesMessages.rejected)} disabled></Tabs.TabPane>
      </Tabs>
    </>
  )
}

export default SalesCallPage
