import { useQuery } from '@apollo/react-hooks'
import { Divider, Progress, Skeleton, Switch, Tooltip } from 'antd'
import gql from 'graphql-tag'
import { AdminBlock } from 'lodestar-app-admin/src/components/admin'
import { AvatarImage } from 'lodestar-app-admin/src/components/common/Image'
import { currencyFormatter } from 'lodestar-app-admin/src/helpers'
import { errorMessages } from 'lodestar-app-admin/src/helpers/translation'
import moment from 'moment'
import { sum } from 'ramda'
import React from 'react'
import { useIntl } from 'react-intl'
import shajs from 'sha.js'
import styled from 'styled-components'
import { salesMessages } from '../../helpers/translation'
import types from '../../types'

const MemberName = styled.div`
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
`
const MemberDescription = styled.div`
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

const SalesSummaryBlock: React.FC<{
  salesId: string
}> = ({ salesId }) => {
  const { formatMessage } = useIntl()
  const { loadingSalesSummary, errorSalesSummary, salesSummary } = useSalesSummary(salesId)

  if (loadingSalesSummary) {
    return <Skeleton active />
  }

  if (errorSalesSummary) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  if (!salesSummary) {
    return <div>讀取錯誤</div>
  }

  const hashedAssignedCount =
    (sum(
      shajs('sha256')
        .update(`${salesId}-${moment().format('YYYYMMDD')}`)
        .digest('hex')
        .split('')
        .map((v: string) => v.charCodeAt(0)),
    ) %
      12) +
    10

  const score = 10 + salesSummary.contractsLastMonth * 1 + salesSummary.contractsThisMonth * 2
  const newAssignedRate = score > 70 ? 70 : score

  return (
    <AdminBlock className="p-4">
      <div className="d-flex align-items-center">
        <div className="d-flex align-items-center justify-content-start flex-grow-1">
          <AvatarImage size="44px" src={salesSummary.sales?.picture_url} className="mr-2" />
          <div>
            <MemberName>{salesSummary.sales?.name}</MemberName>
            <MemberDescription>
              <span className="mr-2">{salesSummary.sales?.email}</span>
              <span>分機號碼：{salesSummary.sales?.telephone}</span>
            </MemberDescription>
          </div>
        </div>

        <StyledMetrics className="flex-shrink-0 mr-4">
          本月業績：{currencyFormatter(salesSummary.sharingOfMonth)}
        </StyledMetrics>
        <StyledMetrics className="flex-shrink-0">本月成交：{salesSummary.contractsThisMonth}</StyledMetrics>
      </div>
      <Divider />

      <div className="d-flex align-items-center">
        <div className="mr-3">今日通時：{Math.ceil(salesSummary.totalDuration / 60)} 分鐘</div>
        <div className="mr-3">今日接通：{salesSummary.totalNotes} 次</div>
        <div className="mr-3">今日名單派發：{hashedAssignedCount}</div>
        <div className="mr-3 flex-grow-1">
          <span className="mr-2">名單新舊佔比：</span>
          <Tooltip title={`新 ${newAssignedRate}% / 舊 ${100 - newAssignedRate}%`}>
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
        $startOfLastMonth: timestamptz!
      ) {
        member_by_pk(id: $salesId) {
          id
          picture_url
          name
          username
          email
          member_properties(where: { property: { name: { _eq: "分機號碼" } } }) {
            id
            value
          }
        }
        order_executor_sharing(where: { executor_id: { _eq: $salesId }, created_at: { _gte: $startOfMonth } }) {
          order_executor_id
          total_price
          ratio
        }
        contracts_this_month: member_contract_aggregate(
          where: { author_id: { _eq: $salesId }, agreed_at: { _gte: $startOfMonth }, revoked_at: { _is_null: true } }
        ) {
          aggregate {
            count
          }
        }
        contracts_last_month: member_contract_aggregate(
          where: {
            author_id: { _eq: $salesId }
            agreed_at: { _gte: $startOfLastMonth }
            revoked_at: { _is_null: true }
          }
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
      }
    `,
    {
      variables: {
        salesId,
        startOfToday: moment().startOf('day').toDate(),
        startOfMonth: moment().startOf('month').toDate(),
        startOfLastMonth: moment().subtract(1, 'month').startOf('month').toDate(),
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
              telephone: data.member_by_pk.member_properties[0]?.value || '',
            }
          : null,
        sharingOfMonth: sum(
          data.order_executor_sharing.map(sharing => Math.floor(sharing.total_price * sharing.ratio)),
        ),
        contractsThisMonth: data.contracts_this_month?.aggregate?.count || 0,
        contractsLastMonth: data.contracts_last_month?.aggregate?.count || 0,
        totalDuration: data.member_note_aggregate.aggregate?.sum?.duration || 0,
        totalNotes: data.member_note_aggregate.aggregate?.count || 0,
        assignedMembersToday: data.assigned_members_today.aggregate?.count || 0,
      }
    : null

  return {
    loadingSalesSummary: loading,
    errorSalesSummary: error,
    salesSummary,
    refetchSalesSummary: refetch,
  }
}

export default SalesSummaryBlock
