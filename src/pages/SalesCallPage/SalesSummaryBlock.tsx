import { Divider, Progress, Switch, Tooltip } from 'antd'
import { AdminBlock } from 'lodestar-app-admin/src/components/admin'
import { AvatarImage } from 'lodestar-app-admin/src/components/common/Image'
import { currencyFormatter } from 'lodestar-app-admin/src/helpers'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { salesMessages } from '../../helpers/translation'
import { SalesProps, useSalesOddsAddition } from './salesHooks'

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
  sales: SalesProps
}> = ({ sales }) => {
  const { formatMessage } = useIntl()

  return (
    <AdminBlock className="p-4">
      <div className="d-flex align-items-center">
        <div className="d-flex align-items-center justify-content-start flex-grow-1">
          <AvatarImage size="44px" src={sales.pictureUrl} className="mr-2" />
          <div>
            <MemberNameLabel>{sales.name}</MemberNameLabel>
            <MemberDescription>
              <span className="mr-2">{sales.email}</span>
              <span>分機號碼：{sales.telephone}</span>
            </MemberDescription>
          </div>
        </div>

        <StyledMetrics className="flex-shrink-0 mr-4">
          本月業績：{currencyFormatter(sales.sharingOfMonth)}
        </StyledMetrics>
        <StyledMetrics className="flex-shrink-0">本月總件數：{sales.sharingOrdersOfMonth}</StyledMetrics>
      </div>
      <Divider />

      <div className="d-flex align-items-center">
        <div className="mr-3">今日通時：{Math.ceil(sales.totalDuration / 60)} 分鐘</div>
        <div className="mr-3">今日接通：{sales.totalNotes} 次</div>
        {/* <div className="mr-3">今日名單派發：{hashedAssignedCount}</div> */}
        <div className="mr-3 flex-grow-1">
          <span className="mr-2">名單新舊佔比：</span>
          <AssignmentRateBar salesId={sales.id} baseOdds={sales.baseOdds} lastAttend={sales.lastAttend} />
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
  const { oddsAdditions } = useSalesOddsAddition(salesId, lastAttend)

  if (!oddsAdditions) {
    return null
  }

  const score =
    baseOdds +
    (oddsAdditions.lastAttendMemberNotesCount > 40 ? 5 : 0) +
    oddsAdditions.lastWeekAgreedContractsCount * 5 +
    20
  const newAssignmentRate = score > 90 ? 90 : Math.floor(score)

  return (
    <Tooltip title={`新 ${newAssignmentRate}% / 舊 ${100 - newAssignmentRate}%`}>
      <StyledProgress percent={100} showInfo={false} success={{ percent: newAssignmentRate }} />
    </Tooltip>
  )
}

export default SalesSummaryBlock
