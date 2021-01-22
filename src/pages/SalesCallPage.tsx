import Icon from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Divider, Progress, Skeleton, Switch, Tabs, Tooltip } from 'antd'
import gql from 'graphql-tag'
import { AdminBlock, AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import { AvatarImage } from 'lodestar-app-admin/src/components/common/Image'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import { useAuth } from 'lodestar-app-admin/src/contexts/AuthContext'
import { currencyFormatter } from 'lodestar-app-admin/src/helpers'
import { ReactComponent as PhoneIcon } from 'lodestar-app-admin/src/images/icon/phone.svg'
import moment from 'moment'
import { sum } from 'ramda'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { StringParam, useQueryParam } from 'use-query-params'
import { salesMessages } from '../helpers/translation'
import types from '../types'

const MemberName = styled.div`
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
`
const MemberEmail = styled.div`
  color: var(--gray-dark);
  font-size: 12px;
  letter-spacing: 0.6px;
`
const StyledMetrics = styled.div`
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
`
const StyledProgress = styled(Progress)`
  display: inline-block;
  width: 12rem;
`

const SalesCallPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon className="mr-3" component={() => <PhoneIcon />} />
        <span>{formatMessage(salesMessages.label.salesCall)}</span>
      </AdminPageTitle>

      {currentMemberId && <SalesSummary salesId={currentMemberId} />}

      <Tabs activeKey={activeKey || 'potentials'} onChange={key => setActiveKey(key)}>
        <Tabs.TabPane key="potentials" tab={formatMessage(salesMessages.label.potentials)}></Tabs.TabPane>
        <Tabs.TabPane key="keep-in-touch" tab={formatMessage(salesMessages.label.keepInTouch)}></Tabs.TabPane>
        <Tabs.TabPane key="deals" tab={formatMessage(salesMessages.label.deals)}></Tabs.TabPane>
        <Tabs.TabPane key="revoked" tab={formatMessage(salesMessages.label.revoked)} disabled></Tabs.TabPane>
        <Tabs.TabPane key="rejected" tab={formatMessage(salesMessages.label.rejected)} disabled></Tabs.TabPane>
      </Tabs>
    </AdminLayout>
  )
}

const SalesSummary: React.FC<{
  salesId: string
}> = ({ salesId }) => {
  const { formatMessage } = useIntl()
  const { loadingSalesSummary, salesSummary } = useSalesSummary(salesId)

  if (loadingSalesSummary) {
    return <Skeleton active />
  }

  if (!salesSummary) {
    return null
  }

  const newAssignedRate =
    salesSummary && salesSummary.assignedMembersAll
      ? Math.round((salesSummary.assignedMembersNew * 100) / salesSummary.assignedMembersAll)
      : 0
  const oldAssignedRate = salesSummary && salesSummary.assignedMembersAll ? 100 - newAssignedRate : 0

  return (
    <AdminBlock>
      <div className="d-flex align-items-center">
        <div className="d-flex align-items-center flex-grow-1">
          <AvatarImage size="44px" src={salesSummary.sales?.picture_url} className="mr-2" />
          <div>
            <MemberName>{salesSummary.sales?.name}</MemberName>
            <MemberEmail>{salesSummary.sales?.email}</MemberEmail>
          </div>
        </div>

        <StyledMetrics className="flex-shrink-0 mr-4">
          {formatMessage(salesMessages.text.totalSharingOfThisMonth, {
            amount: currencyFormatter(salesSummary.sharingOfMonth),
          })}
        </StyledMetrics>
        <StyledMetrics className="flex-shrink-0">
          {formatMessage(salesMessages.text.totalContractsOfThisMonth, {
            amount: salesSummary.contractsOfMonth,
          })}
        </StyledMetrics>
      </div>
      <Divider />

      <div className="d-flex align-items-center">
        <div className="mr-3">
          {formatMessage(salesMessages.text.totalDurationToday, { minutes: salesSummary.totalDuration })}
        </div>
        <div className="mr-3">
          {formatMessage(salesMessages.text.totalCallsToday, { amount: salesSummary.totalNotes })}
        </div>
        <div className="mr-3">
          {formatMessage(salesMessages.text.assignedMembersToday, { amount: salesSummary.assignedMembersToday })}
        </div>
        <div className="mr-3 flex-grow-1">
          <span className="mr-2">{formatMessage(salesMessages.text.assignedMembersNewRate)}</span>
          <Tooltip
            title={formatMessage(salesMessages.text.assignedMembersDetail, {
              new: newAssignedRate,
              old: oldAssignedRate,
            })}
          >
            <StyledProgress percent={100} showInfo={false} success={{ percent: newAssignedRate }} />
          </Tooltip>
        </div>
        <div>
          <span className="mr-2">{formatMessage(salesMessages.label.autoStartCalls)}</span>
          <Switch disabled />
        </div>
      </div>
    </AdminBlock>
  )
}

const useSalesSummary = (salesId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_SALES_SUMMARY, types.GET_SALES_SUMMARYVariables>(
    gql`
      query GET_SALES_SUMMARY(
        $salesId: String!
        $startOfToday: timestamptz!
        $startOfMonth: timestamptz!
        $startOfTwoWeeks: timestamptz!
        $startOfThreeMonths: timestamptz!
      ) {
        member_by_pk(id: $salesId) {
          id
          picture_url
          name
          username
          email
        }
        order_executor_sharing(where: { executor_id: { _eq: $salesId }, created_at: { _gte: $startOfMonth } }) {
          order_executor_id
          total_price
          ratio
        }
        member_contract_aggregate(
          where: { author_id: { _eq: $salesId }, agreed_at: { _gte: $startOfMonth }, revoked_at: { _is_null: true } }
        ) {
          aggregate {
            count
          }
        }
        member_note_aggregate(
          where: {
            author_id: { _eq: $salesId }
            type: { _eq: "outbound" }
            status: { _eq: "answered" }
            duration: { _gt: 0 }
            created_at: { _gte: $startOfToday }
          }
        ) {
          aggregate {
            count
            sum {
              duration
            }
          }
        }
        assigned_members_today: member_aggregate(
          where: { manager_id: { _eq: $salesId }, assigned_at: { _gte: $startOfToday } }
        ) {
          aggregate {
            count
          }
        }
        assigned_members_last_two_weeks: member_aggregate(
          where: { manager_id: { _eq: $salesId }, assigned_at: { _gte: $startOfTwoWeeks } }
        ) {
          aggregate {
            count
          }
        }
        assigned_members_last_three_months: member_aggregate(
          where: { manager_id: { _eq: $salesId }, assigned_at: { _gte: $startOfThreeMonths } }
        ) {
          aggregate {
            count
          }
        }
      }
    `,
    {
      variables: {
        salesId,
        startOfToday: moment().startOf('day').toDate(),
        startOfMonth: moment().startOf('month').toDate(),
        startOfTwoWeeks: moment().subtract(2, 'weeks').startOf('day').toDate(),
        startOfThreeMonths: moment().subtract(3, 'months').startOf('day').toDate(),
      },
    },
  )

  const salesSummary = data
    ? {
        sales: data.member_by_pk
          ? {
              id: data.member_by_pk.id,
              picture_url: data.member_by_pk.picture_url,
              name: data.member_by_pk.name || data.member_by_pk.username,
              email: data.member_by_pk.email,
            }
          : null,
        sharingOfMonth: sum(
          data.order_executor_sharing.map(sharing => Math.floor(sharing.total_price * sharing.ratio)),
        ),
        contractsOfMonth: data.member_contract_aggregate.aggregate?.count || 0,
        totalDuration: data.member_note_aggregate.aggregate?.sum?.duration || 0,
        totalNotes: data.member_note_aggregate.aggregate?.count || 0,
        assignedMembersToday: data.assigned_members_today.aggregate?.count || 0,
        assignedMembersNew: data.assigned_members_last_two_weeks.aggregate?.count || 0,
        assignedMembersAll: data.assigned_members_last_three_months.aggregate?.count || 0,
      }
    : null

  return {
    loadingSalesSummary: loading,
    errorSalesSummary: error,
    salesSummary,
    refetchSalesSummary: refetch,
  }
}

const useFirstAssignedMember = (salesId: string) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_FIRST_ASSIGNED_MEMBER,
    types.GET_FIRST_ASSIGNED_MEMBERVariables
  >(
    gql`
      query GET_FIRST_ASSIGNED_MEMBER($salesId: String!) {
        member(
          where: {
            manager_id: { _eq: $salesId }
            assigned_at: { _is_null: false }
            _not: { member_notes: { author_id: { _eq: $salesId } } }
          }
          order_by: [{ assigned_at: asc }]
        ) {
          id
          email
          name
          username
          member_phones {
            id
            phone
          }
          member_categories {
            id
            category {
              id
              name
            }
          }
          member_properties {
            id
            property {
              id
              name
            }
            value
          }
        }
      }
    `,
    { variables: { salesId } },
  )

  const assignedMember = data?.member[0]
    ? {
        id: data.member[0].id,
        email: data.member[0].email,
        name: data.member[0].name || data.member[0].username,
        phones: data.member[0].member_phones.map(v => v.phone),
        categories: data.member[0].member_categories.map(v => ({
          id: v.category.id,
          name: v.category.name,
        })),
        properties: data.member[0].member_properties.map(v => ({
          id: v.property.id,
          name: v.property.name,
          value: v.value,
        })),
      }
    : null

  return {
    loadingAssignedMember: loading,
    errorAssignedMember: error,
    assignedMember,
    refetchAssignedMember: refetch,
  }
}

export default SalesCallPage
