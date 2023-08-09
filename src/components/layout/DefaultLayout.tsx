import { DownOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Divider, Dropdown, Layout, Menu } from 'antd'
import dayjs from 'dayjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useContext, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { footerHeight } from '.'
import LocaleContext, { SUPPORTED_LOCALES } from '../../contexts/LocaleContext'
import hasura from '../../hasura'
import { useAppUsage } from '../../hooks/data'
import defaultSettings from '../../settings'
import AttendButton from '../attend/AttendButton'
import AuthModal, { AuthModalContext } from '../auth/AuthModal'
import Footer from '../common/Footer'
import MemberProfileButton from '../common/MemberProfileButton'
import { BREAK_POINT } from '../common/Responsive'
import NotificationDropdown from '../notification/NotificationDropdown'
import layoutMessages from './translation'

const StyledLayout = styled(Layout)`
  &.bg-white {
    background: white;
  }
`
const StyledLayoutHeader = styled(Layout.Header)`
  border-bottom: 1px solid #ececec;
`
export const StyledLayoutContent = styled(Layout.Content)<{ variant?: 'default' | 'gray' }>`
  height: calc(100vh - 64px);
  overflow-y: auto;
  ${props => (props.variant === 'gray' ? 'background: var(--gray-lighter);' : '')}
`
const StyledContainer = styled.div<{ noFooter?: boolean; centeredBox?: boolean }>`
  min-height: calc(100vh - 64px - ${props => (props.noFooter ? '0' : footerHeight)}px);

  ${props =>
    props.centeredBox
      ? css`
          display: flex;
          align-items: center;
          justify-content: center;
        `
      : ''}
`
const CenteredBox = styled.div`
  margin: 1rem;
  width: 100%;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);

  @media (min-width: ${BREAK_POINT}px) {
    width: calc(100% / 3);
  }
`
const StyledButton = styled(Button)`
  && {
    color: var(--gray-dark);
    font-size: 14px;
  }
`

const StyledWarningBar = styled.div`
  background-color: var(--error);
  color: #fff;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.8px;
  padding: 8px 0;
`

const DefaultLayout: React.FC<{
  white?: boolean
  noFooter?: boolean
  centeredBox?: boolean
  renderTitle?: () => React.ReactNode
  renderExtraNav?: () => React.ReactNode
}> = ({ white, noFooter, centeredBox, renderTitle, children }) => {
  const [visible, setVisible] = useState(false)

  return (
    <AuthModalContext.Provider value={{ visible, setVisible }}>
      <AuthModal />
      <DefaultLayoutHeader renderTitle={renderTitle} />
      <StyledLayout className={white ? 'bg-white' : ''}>
        <StyledLayoutContent id="layout-content">
          <StyledContainer noFooter={noFooter} centeredBox={centeredBox}>
            {centeredBox ? <CenteredBox>{children}</CenteredBox> : children}
          </StyledContainer>

          {!noFooter && <Footer />}
        </StyledLayoutContent>
      </StyledLayout>
    </AuthModalContext.Provider>
  )
}

export const DefaultLayoutHeader: React.FC<{
  renderTitle?: () => React.ReactNode
}> = ({ renderTitle }) => {
  const { formatMessage } = useIntl()
  const { currentMemberId, permissions, currentUserRole } = useAuth()
  const { enabledModules, id: appId, endedAt: appEndedAt, options: appOptions } = useApp()
  const { currentLocale, setCurrentLocale } = useContext(LocaleContext)
  const { totalVideoDuration, totalWatchedSeconds } = useAppUsage([moment().startOf('M'), moment().endOf('M')])
  const [updateAppointmentPlanDescription] = useMutation<hasura.UPDATE_APP_OPTIONS, hasura.UPDATE_APP_OPTIONSVariables>(
    UPDATE_APP_OPTIONS,
  )

  const isSiteExpiringSoon = dayjs(appEndedAt).diff(dayjs(), 'day') <= 20
  const isVideoDurationExceedsUsage = Math.round(totalVideoDuration / 60) > appOptions.video_duration
  const isWatchedSecondsExceedsUsage = totalWatchedSeconds > appOptions.video_duration
  const closeSiteAt = appOptions.close_site_at
    ? dayjs(appOptions.close_site_at)
    : dayjs().add(15, 'days').diff(dayjs(appEndedAt)) < 0
    ? dayjs().add(15, 'days').endOf('day')
    : dayjs(appEndedAt).endOf('day')

  useEffect(() => {
    if (
      currentUserRole === 'app-owner' &&
      !appOptions.close_site_at &&
      (isSiteExpiringSoon || isVideoDurationExceedsUsage || isWatchedSecondsExceedsUsage)
    ) {
      console.log('enter')
      updateAppointmentPlanDescription({
        variables: {
          appId: appId,
          options: { ...appOptions, close_site_at: closeSiteAt.utc().format('YYYY-MM-DDTHH:mm:ss.SSSZ') },
        },
      })
    }
  }, [currentUserRole, appOptions, totalVideoDuration, totalWatchedSeconds])

  let Logo: string | undefined
  try {
    Logo = require(`../../images/${appId}/logo.svg`)
  } catch {
    try {
      Logo = require(`../../images/${appId}/logo.png`)
    } catch {
      try {
        Logo = require(`../../images/${appId}/logo.jpg`)
      } catch {
        Logo = undefined
      }
    }
  }

  return (
    <>
      <StyledLayoutHeader className="d-flex align-items-center justify-content-between">
        {renderTitle ? (
          renderTitle()
        ) : (
          <Link to={`/`} className="d-flex align-items-center">
            {Logo ? <img src={Logo} alt="logo" className="header-logo" /> : defaultSettings.seo.name || 'Home'}
          </Link>
        )}

        <div className="d-flex align-items-center">
          {enabledModules.locale && (
            <>
              <Dropdown
                trigger={['click']}
                overlay={
                  <Menu>
                    {SUPPORTED_LOCALES.map(supportedLocale => (
                      <Menu.Item key={supportedLocale.locale}>
                        <StyledButton
                          type="link"
                          size="small"
                          onClick={() => setCurrentLocale?.(supportedLocale.locale)}
                        >
                          {supportedLocale.label}
                        </StyledButton>
                      </Menu.Item>
                    ))}
                  </Menu>
                }
              >
                <StyledButton type="link" size="small">
                  {SUPPORTED_LOCALES.find(supportedLocale => currentLocale === supportedLocale.locale)?.label ||
                    'Unknown'}
                  <DownOutlined />
                </StyledButton>
              </Dropdown>
              <Divider type="vertical" />
            </>
          )}
          {currentMemberId && enabledModules.attend && permissions.MEMBER_ATTENDANT && (
            <AttendButton memberId={currentMemberId} />
          )}
          {currentMemberId && <NotificationDropdown memberId={currentMemberId} />}
          {currentMemberId && <MemberProfileButton memberId={currentMemberId} />}
        </div>
      </StyledLayoutHeader>
      {currentUserRole === 'app-owner' &&
      (isSiteExpiringSoon || isVideoDurationExceedsUsage || isWatchedSecondsExceedsUsage) ? (
        <StyledWarningBar>
          <p>
            {isSiteExpiringSoon && (isVideoDurationExceedsUsage || isWatchedSecondsExceedsUsage)
              ? formatMessage(
                  layoutMessages.DefaultLayout.contractWillExpiredAndStorageAndWatchTrafficIsExceededNotice,
                  {
                    contractExpiredAt: dayjs(appEndedAt).format('YYYY-MM-DD'),
                    closeSiteAt: closeSiteAt.format('YYYY-MM-DD'),
                  },
                )
              : isVideoDurationExceedsUsage || isWatchedSecondsExceedsUsage
              ? formatMessage(layoutMessages.DefaultLayout.storageAndWatchTrafficIsExceededNotice, {
                  closeSiteAt: closeSiteAt.format('YYYY-MM-DD'),
                })
              : formatMessage(layoutMessages.DefaultLayout.contractWillExpiredNotice, {
                  contractExpiredAt: dayjs(appEndedAt).format('YYYY-MM-DD'),
                })}
          </p>
        </StyledWarningBar>
      ) : null}
    </>
  )
}

const UPDATE_APP_OPTIONS = gql`
  mutation UPDATE_APP_OPTIONS($appId: String!, $options: jsonb!) {
    update_app(where: { id: { _eq: $appId } }, _set: { options: $options }) {
      affected_rows
    }
  }
`

export default DefaultLayout
