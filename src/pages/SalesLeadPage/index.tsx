import Icon, { PhoneOutlined, RedoOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Skeleton, Tabs } from 'antd'
import gql from 'graphql-tag'
import { AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import { useAuth } from 'lodestar-app-admin/src/contexts/AuthContext'
import { notEmpty } from 'lodestar-app-admin/src/helpers'
import moment from 'moment'
import { prop, sortBy } from 'ramda'
import React, { useEffect } from 'react'
import { useIntl } from 'react-intl'
import { StringParam, useQueryParam } from 'use-query-params'
import hasura from '../../hasura'
import { salesMessages } from '../../helpers/translation'
import { Lead } from '../../types/sales'
import { useSales } from '../SalesCallPage/salesHooks'
import SalesLeadTable from './SalesLeadTable'

const SalesLeadPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon className="mr-3" component={() => <PhoneOutlined />} />
        <span>{formatMessage(salesMessages.label.salesLead)}</span>
      </AdminPageTitle>
      {currentMemberId ? (
        <SalesLeadTabs
          activeKey={activeKey || 'unhandled'}
          salesId={currentMemberId}
          onActiveKeyChanged={setActiveKey}
        />
      ) : (
        <Skeleton active />
      )}
    </AdminLayout>
  )
}

const SalesLeadTabs: React.VFC<{
  activeKey: string
  salesId: string
  onActiveKeyChanged?: (activeKey: string) => void
}> = ({ activeKey, salesId, onActiveKeyChanged }) => {
  const { formatMessage } = useIntl()
  const [resetLead] = useMutation(RESET_LEADS)
  const { sales } = useSales(salesId)
  const {
    loading,
    refetch,
    hotLeads,
    unhandledRecentLeads,
    unhandledLeads,
    currentLeads,
    priorLeads,
    closedLeads,
    paidLeads,
  } = useSalesLeads(salesId)

  // FIXME: this side effect is not so good
  useEffect(() => {
    resetLead({ variables: { memberIds: unhandledRecentLeads.map(lead => lead.id) } }).then(() => refetch?.())
  }, [refetch, JSON.stringify(unhandledRecentLeads)])

  if (loading) {
    return <Skeleton active />
  }
  return (
    <Tabs
      activeKey={activeKey}
      onChange={onActiveKeyChanged}
      tabBarExtraContent={
        <Button onClick={() => refetch()}>
          <RedoOutlined />
        </Button>
      }
    >
      <Tabs.TabPane
        key="unhandled"
        tab={`${formatMessage(salesMessages.label.unhandledLead)} (${unhandledLeads.length})`}
      >
        {sales && <SalesLeadTable sales={sales} leads={unhandledLeads} onRefetch={refetch} />}
      </Tabs.TabPane>
      {hotLeads.length > 0 && (
        <Tabs.TabPane key="hot" tab={`${formatMessage(salesMessages.label.hotLead)} (${hotLeads.length})`}>
          {sales && <SalesLeadTable sales={sales} leads={hotLeads} onRefetch={refetch} />}
        </Tabs.TabPane>
      )}
      <Tabs.TabPane key="current" tab={`${formatMessage(salesMessages.label.currentLead)} (${currentLeads.length})`}>
        {sales && <SalesLeadTable sales={sales} leads={currentLeads} onRefetch={refetch} />}
      </Tabs.TabPane>
      <Tabs.TabPane key="prior" tab={`${formatMessage(salesMessages.label.priorLead)} (${priorLeads.length})`}>
        {sales && <SalesLeadTable sales={sales} leads={priorLeads} onRefetch={refetch} />}
      </Tabs.TabPane>
      <Tabs.TabPane key="closed" tab={`${formatMessage(salesMessages.label.closedLead)} (${closedLeads.length})`}>
        {sales && <SalesLeadTable sales={sales} leads={closedLeads} onRefetch={refetch} />}
      </Tabs.TabPane>
      <Tabs.TabPane key="paid" tab={`${formatMessage(salesMessages.label.paidLead)} (${paidLeads.length})`}>
        {sales && <SalesLeadTable sales={sales} leads={paidLeads} onRefetch={refetch} />}
      </Tabs.TabPane>
    </Tabs>
  )
}

const useSalesLeads = (salesId: string) => {
  const { data, error, loading, refetch } = useQuery<hasura.GET_SALES_LEADS, hasura.GET_SALES_LEADSVariables>(
    GET_SALES_LEADS,
    {
      variables: {
        salesId,
        startOfRecent: moment().subtract(3, 'week').startOf('day'),
        startOfToday: moment().startOf('day'),
        endOfToday: moment().endOf('day'),
      },
    },
  )
  const threshold = moment().startOf('day').subtract(1, 'month')
  const isClosed = (lead: Lead) => lead.star === -999
  const isCurrent = (lead: Lead) => moment(lead.createdAt) >= threshold
  const isPaid = (lead: Lead) => lead.paid > 0
  const convertToLead = (v: hasura.GET_SALES_LEADS_leads): Lead | null =>
    v.member && {
      id: v.member.id,
      star: v.member.star,
      name: v.member.name,
      email: v.member.email,
      createdAt: moment(v.member.created_at).toDate(),
      phones: v.member.member_phones.map(_v => _v.phone),
      categoryNames: v.member.member_categories.map(_v => _v.category.name),
      paid: v.paid,
    }
  const leads = sortBy(prop('id'))(data?.leads.map(convertToLead).filter(notEmpty) || [])
  const hotLeads: Lead[] = leads.filter(lead => lead.createdAt >= moment().startOf('day').toDate())
  const unhandledLeads: Lead[] = leads
    .filter(lead => !isPaid(lead))
    .filter(lead => !isClosed(lead))
    .filter(lead => !data?.handled_members_today.map(v => v.id).includes(lead.id))
  const currentLeads: Lead[] = leads
    .filter(lead => !isPaid(lead))
    .filter(lead => !isClosed(lead))
    .filter(isCurrent)
  const priorLeads: Lead[] = leads
    .filter(v => !isPaid(v))
    .filter(v => !isClosed(v))
    .filter(v => !isCurrent(v))
  const closedLeads: Lead[] = leads.filter(v => !isPaid(v)).filter(isClosed)
  const paidLeads: Lead[] = leads.filter(notEmpty).filter(isPaid)
  const unhandledRecentLeads: Lead[] = leads
    .filter(lead => !isPaid(lead))
    .filter(lead => !isClosed(lead))
    .filter(lead => !data?.handled_members_recent.map(v => v.id).includes(lead.id))

  return {
    loading,
    error,
    refetch,
    hotLeads,
    unhandledRecentLeads,
    unhandledLeads,
    currentLeads,
    priorLeads,
    closedLeads,
    paidLeads,
  }
}

const GET_SALES_LEADS = gql`
  query GET_SALES_LEADS(
    $salesId: String!
    $startOfRecent: timestamptz!
    $startOfToday: timestamptz!
    $endOfToday: timestamptz!
  ) {
    leads: xuemi_member_paid(where: { member: { manager_id: { _eq: $salesId } } }) {
      paid
      member {
        id
        name
        email
        star
        created_at
        member_phones {
          phone
        }
        member_categories {
          category {
            name
          }
        }
      }
    }
    handled_members_today: member(
      where: {
        manager_id: { _eq: $salesId }
        _or: [
          { member_notes: { author_id: { _eq: $salesId }, created_at: { _gte: $startOfToday, _lt: $endOfToday } } }
          { member_tasks: { executor_id: { _eq: $salesId }, created_at: { _gte: $startOfToday, _lt: $endOfToday } } }
        ]
      }
    ) {
      id
    }
    handled_members_recent: member(
      where: {
        manager_id: { _eq: $salesId }
        _or: [
          { member_notes: { author_id: { _eq: $salesId }, created_at: { _gte: $startOfRecent, _lt: $endOfToday } } }
          { member_tasks: { executor_id: { _eq: $salesId }, created_at: { _gte: $startOfRecent, _lt: $endOfToday } } }
        ]
      }
    ) {
      id
    }
  }
`

const RESET_LEADS = gql`
  mutation RESET_LEADS($memberIds: [String!]!) {
    update_member(_set: { manager_id: null }, where: { id: { _in: $memberIds } }) {
      affected_rows
    }
  }
`
export default SalesLeadPage
