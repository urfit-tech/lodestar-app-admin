import { Skeleton } from 'antd'
import dayjs from 'dayjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import moment from 'moment'
import React from 'react'
import { useIntl } from 'react-intl'
import { Redirect } from 'react-router'
import styled from 'styled-components'
import { useAppUsage } from '../hooks/data'
import { ErrorBrowserIcon } from '../images/icon'
import pageMessages from './translation'

const StyledLayout = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background-color: #f7f8f8;
`

const StyledDeactivateSiteCard = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  background-color: #fff;
  padding: 80px;
`

const StyledDeactivateTitle = styled.h1`
  font-size: 20px;
  font-weight: bold;
  line-height: 1.6;
  letter-spacing: 0.8px;
  color: var(--gray-darker);
  &:first-of-type {
    margin-top: 24px;
  }
`
const StyledDeactivateDescription = styled.div`
  width: 312px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.57;
  letter-spacing: 0.18px;
  color: var(--gray-darker);
  margin-top: 8px;
  text-align: center;
`

const DeactivatePage = () => {
  const { formatMessage } = useIntl()
  const { loading, options: appOptions, endedAt: appEndedAt } = useApp()
  const { totalVideoDuration, totalWatchedSeconds } = useAppUsage([moment().startOf('M'), moment().endOf('M')])
  const isSiteContractExpired = dayjs(appEndedAt).diff(dayjs(), 'day') <= 0
  const isVideoDurationExceedsUsage = Math.round(totalVideoDuration / 60) > appOptions.video_duration
  const isWatchedSecondsExceedsUsage = totalWatchedSeconds > appOptions.video_duration

  if (loading) {
    return <Skeleton active />
  }

  if (!appOptions.close_site_at || dayjs(appOptions.close_site_at).diff(dayjs(), 'day') >= 0) {
    return <Redirect to="/" />
  }

  return (
    <StyledLayout>
      <StyledDeactivateSiteCard>
        <ErrorBrowserIcon />
        {isSiteContractExpired && (isVideoDurationExceedsUsage || isWatchedSecondsExceedsUsage) ? (
          <>
            <StyledDeactivateTitle>
              {formatMessage(pageMessages.DeactivatePage.contactExpiredAndUsageExceeded)}
            </StyledDeactivateTitle>
            <StyledDeactivateTitle>{formatMessage(pageMessages.DeactivatePage.pleaseUpdatePlan)}</StyledDeactivateTitle>
          </>
        ) : isVideoDurationExceedsUsage || isWatchedSecondsExceedsUsage ? (
          <StyledDeactivateTitle>
            {formatMessage(pageMessages.DeactivatePage.usageExceededAndPleaseUpdatePlan)}
          </StyledDeactivateTitle>
        ) : isSiteContractExpired ? (
          <StyledDeactivateTitle>{formatMessage(pageMessages.DeactivatePage.planHadExpired)}</StyledDeactivateTitle>
        ) : (
          <Skeleton active />
        )}
        <StyledDeactivateDescription>
          {isSiteContractExpired && (isVideoDurationExceedsUsage || isWatchedSecondsExceedsUsage) ? (
            <>
              <p>{formatMessage(pageMessages.DeactivatePage.contactExpiredAndUsageExceededDescription1)}</p>
              <p>{formatMessage(pageMessages.DeactivatePage.contactExpiredAndUsageExceededDescription2)}</p>
              <p>{formatMessage(pageMessages.DeactivatePage.contactExpiredAndUsageExceededDescription3)}</p>
              <p>{formatMessage(pageMessages.DeactivatePage.contactExpiredAndUsageExceededDescription4)}</p>
            </>
          ) : isVideoDurationExceedsUsage || isWatchedSecondsExceedsUsage ? (
            <>
              <p>{formatMessage(pageMessages.DeactivatePage.usageExceededAndPleaseUpdatePlanDescription1)}</p>
              <p>{formatMessage(pageMessages.DeactivatePage.usageExceededAndPleaseUpdatePlanDescription2)}</p>
              <p>{formatMessage(pageMessages.DeactivatePage.usageExceededAndPleaseUpdatePlanDescription3)}</p>
            </>
          ) : isSiteContractExpired ? (
            <>
              <p>{formatMessage(pageMessages.DeactivatePage.planHadExpiredDescription1)}</p>
              <p>{formatMessage(pageMessages.DeactivatePage.planHadExpiredDescription2)}</p>
              <p>{formatMessage(pageMessages.DeactivatePage.planHadExpiredDescription3)}</p>
            </>
          ) : (
            <Skeleton active />
          )}
        </StyledDeactivateDescription>
      </StyledDeactivateSiteCard>
    </StyledLayout>
  )
}

export default DeactivatePage
