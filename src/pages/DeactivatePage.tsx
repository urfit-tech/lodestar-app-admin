import { Skeleton } from 'antd'
import dayjs from 'dayjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import moment from 'moment'
import React from 'react'
import { Redirect } from 'react-router'
import styled from 'styled-components'
import { useAppUsage } from '../hooks/data'
import { ErrorBrowserIcon } from '../images/icon'

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
            <StyledDeactivateTitle>方案已到期且超出用量</StyledDeactivateTitle>
            <StyledDeactivateTitle>請升級方案</StyledDeactivateTitle>
          </>
        ) : isVideoDurationExceedsUsage || isWatchedSecondsExceedsUsage ? (
          <StyledDeactivateTitle>超出用量請升級方案</StyledDeactivateTitle>
        ) : (
          <StyledDeactivateTitle>方案已到期</StyledDeactivateTitle>
        )}
        <StyledDeactivateDescription>
          {isSiteContractExpired && (isVideoDurationExceedsUsage || isWatchedSecondsExceedsUsage)
            ? '因您尚未進行續約且影片儲存/流量使用量已超過您的方案上限，請聯繫 KOLABLE 官方 us@urfit.com.tw 洽談續約事宜，逾期將全數刪除站點資料。'
            : isVideoDurationExceedsUsage || isWatchedSecondsExceedsUsage
            ? '您的影片儲存/流量使用量已超過您的方案上限請聯繫 KOLABLE 官方 us@urfit.com.tw 洽談方案升級'
            : '因您尚未進行續約，網站後台已關閉請您儘速聯繫 KOLABLE 官方 us@urfit.com.tw 洽談續約事宜'}
        </StyledDeactivateDescription>
      </StyledDeactivateSiteCard>
    </StyledLayout>
  )
}

export default DeactivatePage
