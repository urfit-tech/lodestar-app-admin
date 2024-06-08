import { CalendarOutlined, UserOutlined } from '@ant-design/icons'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { dateRangeFormatter } from '../../helpers'
import { activityMessages } from '../../helpers/translation'
import EmptyCover from '../../images/default/empty-cover.png'
import ActivityParticipantCollectionModal from './ActivityParticipantCollectionModal'

const StyledWrapper = styled.div`
  overflow: hidden;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
`
const StyledCover = styled.div<{ src: string }>`
  padding-top: ${900 / 16}%;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
`
const StyledDescription = styled.div`
  padding: 1.25rem;
`
const StyledTitle = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  height: 3rem;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
  line-height: 1.5rem;
`
const StyledMeta = styled.div`
  min-height: 1rem;
  color: var(--black-45);
  font-size: 14px;
  letter-spacing: 0.18px;
`
const StyledAction = styled.div`
  padding: 0.75rem 1rem;
  background-color: var(--gray-lighter);
`

const ActivityCard: React.VFC<{
  id: string
  coverUrl: string | null
  title: string
  participantsCount: {
    online: number
    offline: number
  }
  includeSessionTypes: ('offline' | 'online')[]
  startedAt: Date | null
  endedAt: Date | null
}> = ({ id, coverUrl, title, participantsCount, includeSessionTypes, startedAt, endedAt }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  return (
    <StyledWrapper>
      <Link to={`/activities/${id}`}>
        <StyledCover src={coverUrl || EmptyCover} />

        <StyledDescription>
          <StyledTitle className="mb-4">{title}</StyledTitle>

          <StyledMeta className="mb-2">
            <UserOutlined className="mr-2" />
            {enabledModules.activity_online ? (
              includeSessionTypes.map(sessionType => (
                <span className="mr-1" key={sessionType}>
                  {formatMessage(activityMessages.label[sessionType])} {participantsCount[sessionType]}
                </span>
              ))
            ) : (
              <span>{participantsCount['offline']}</span>
            )}
          </StyledMeta>

          <StyledMeta>
            <CalendarOutlined className="mr-2" />
            <span>
              {startedAt &&
                endedAt &&
                dateRangeFormatter({ startedAt, endedAt, dateFormat: 'YYYY-MM-DD(dd)', timeFormat: ' ' })}
            </span>
          </StyledMeta>
        </StyledDescription>
      </Link>

      <StyledAction className="text-right">
        <ActivityParticipantCollectionModal activityId={id} />
      </StyledAction>
    </StyledWrapper>
  )
}

export default ActivityCard
