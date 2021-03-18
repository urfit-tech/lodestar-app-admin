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
import styled from 'styled-components'
import hasura from '../../hasura'
import { salesMessages } from '../../helpers/translation'

const MemberNameLabel = styled.div`
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

  if (!salesSummary || !salesSummary.sales) {
    return <div>讀取錯誤</div>
  }

  return (
    <AdminBlock className="p-4">
      <div className="d-flex align-items-center">
        <div className="d-flex align-items-center justify-content-start flex-grow-1">
          <AvatarImage size="44px" src={salesSummary.sales.picture_url} className="mr-2" />
          <div>
            <MemberNameLabel>{salesSummary.sales.name}</MemberNameLabel>
            <MemberDescription>
              <span className="mr-2">{salesSummary.sales.email}</span>
              <span>分機號碼：{salesSummary.sales.telephone}</span>
            </MemberDescription>
          </div>
        </div>

        <StyledMetrics className="flex-shrink-0 mr-4">
          本月業績：{currencyFormatter(salesSummary.sharingOfMonth)}
        </StyledMetrics>
        <StyledMetrics className="flex-shrink-0">本月總件數：{salesSummary.sharingOrdersOfMonth}</StyledMetrics>
      </div>
      <Divider />

      <div className="d-flex align-items-center">
        <div className="mr-3">今日通時：{Math.ceil(salesSummary.totalDuration / 60)} 分鐘</div>
        <div className="mr-3">今日接通：{salesSummary.totalNotes} 次</div>
        {/* <div className="mr-3">今日名單派發：{hashedAssignedCount}</div> */}
        <div className="mr-3 flex-grow-1">
          <span className="mr-2">名單新舊佔比：</span>
          <AssignmentRateBar
            salesId={salesId}
            baseOdds={salesSummary.sales.odds}
            lastAttend={salesSummary.sales.lastAttend}
          />
        </div>
        <div>
          <span className="mr-2">{formatMessage(salesMessages.label.autoStartCalls)}</span>
          <Switch disabled />
        </div>
      </div>
    </AdminBlock>
  )
}

const AssignmentRateBar: React.FC<{
  salesId: string
  baseOdds: number
  lastAttend: {
    startedAt: Date
    endedAt: Date
  } | null
}> = ({ salesId, baseOdds, lastAttend }) => {
  const { loadingOddsAddition, errorOddsAddition, oddsAdditions } = useSalesOddsAddition(salesId, lastAttend)

  if (loadingOddsAddition || errorOddsAddition) {
    return null
  }

  const score =
    baseOdds + (oddsAdditions.lastAttendMemberNotesCount > 40 ? 5 : 0) + oddsAdditions.lastWeekAgreedContractsCount * 5
  const newAssignmentRate = score > 100 ? 100 : Math.floor(score)

  return (
    <Tooltip title={`新 ${newAssignmentRate}% / 舊 ${100 - newAssignmentRate}%`}>
      <StyledProgress percent={100} showInfo={false} success={{ percent: newAssignmentRate }} />
    </Tooltip>
  )
}

const useSalesSummary = (salesId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_SALES_SUMMARY, hasura.GET_SALES_SUMMARYVariables>(
    gql`
      query GET_SALES_SUMMARY($salesId: String!, $startOfToday: timestamptz!, $startOfMonth: timestamptz!) {
        member_by_pk(id: $salesId) {
          id
          picture_url
          name
          username
          email
          metadata
          member_properties(where: { property: { name: { _eq: "分機號碼" } } }) {
            id
            value
          }
          attends(where: { ended_at: { _is_null: false } }, order_by: [{ started_at: desc }], limit: 1) {
            id
            started_at
            ended_at
          }
        }
        order_executor_sharing(where: { executor_id: { _eq: $salesId }, created_at: { _gte: $startOfMonth } }) {
          order_executor_id
          total_price
          ratio
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
      }
    `,
    {
      variables: {
        salesId,
        startOfToday: moment().startOf('day').toDate(),
        startOfMonth: moment().startOf('month').toDate(),
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
              odds: parseFloat(data.member_by_pk.metadata?.assignment?.odds || '0'),
              lastAttend: data.member_by_pk.attends[0]
                ? {
                    startedAt: new Date(data.member_by_pk.attends[0].started_at),
                    endedAt: new Date(data.member_by_pk.attends[0].ended_at),
                  }
                : null,
            }
          : null,
        sharingOfMonth: sum(
          data.order_executor_sharing.map(sharing => Math.floor(sharing.total_price * sharing.ratio)),
        ),
        sharingOrdersOfMonth: data.order_executor_sharing.length,
        totalDuration: data.member_note_aggregate.aggregate?.sum?.duration || 0,
        totalNotes: data.member_note_aggregate.aggregate?.count || 0,
      }
    : null

  return {
    loadingSalesSummary: loading,
    errorSalesSummary: error,
    salesSummary,
    refetchSalesSummary: refetch,
  }
}

const useSalesOddsAddition = (
  salesId: string,
  lastAttend: {
    startedAt: Date
    endedAt: Date
  } | null,
) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_SALES_ODDS_ADDITION,
    hasura.GET_SALES_ODDS_ADDITIONVariables
  >(
    gql`
      query GET_SALES_ODDS_ADDITION(
        $salesId: String!
        $startedAt: timestamptz!
        $endedAt: timestamptz!
        $startOfLastWeek: timestamptz!
      ) {
        member_note_aggregate(where: { author_id: { _eq: $salesId }, created_at: { _gt: $startedAt, _lt: $endedAt } }) {
          aggregate {
            count
          }
        }
        member_contract_aggregate(
          where: { author_id: { _eq: $salesId }, agreed_at: { _gt: $startOfLastWeek }, revoked_at: { _is_null: true } }
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
        startedAt: lastAttend?.startedAt || moment().subtract(12, 'hours').startOf('hour'),
        endedAt: lastAttend?.endedAt || moment().startOf('hour'),
        startOfLastWeek: moment().subtract(7, 'days').startOf('day').toDate(),
      },
    },
  )

  const oddsAdditions = {
    lastAttendMemberNotesCount: data?.member_note_aggregate.aggregate?.count || 0,
    lastWeekAgreedContractsCount: data?.member_contract_aggregate.aggregate?.count || 0,
  }

  return {
    loadingOddsAddition: loading,
    errorOddsAddition: error,
    oddsAdditions,
    refetchOddsAddition: refetch,
  }
}

export default SalesSummaryBlock
