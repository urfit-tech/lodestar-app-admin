import { useQuery } from '@apollo/react-hooks'
import { Icon, Skeleton } from 'antd'
import gql from 'graphql-tag'
import { sum } from 'ramda'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { dateRangeFormatter } from '../../helpers'
import { activityMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'

const StyledWrapper = styled.div`
  padding: 1.5rem 0;
  background: #f7f8f8;
  border-radius: 4px;
  color: #585858;
`
const StyledTitle = styled.h2`
  padding-left: 1.5rem;
  border-left: 2px solid ${props => props.theme['@primary-color']};
  font-size: 16px;
`
const StyledContent = styled.div`
  line-height: 1.5;
  padding: 0 1.5rem;

  > div + div {
    margin-top: 0.75rem;
  }
`

const ActivitySessionItem: React.FC<{
  activitySessionId: string
}> = ({ activitySessionId }) => {
  const { formatMessage } = useIntl()
  const { loading, error, data } = useQuery<types.GET_ACTIVITY_SESSION, types.GET_ACTIVITY_SESSIONVariables>(
    GET_ACTIVITY_SESSION,
    { variables: { activitySessionId } },
  )

  if (loading) {
    return (
      <StyledWrapper>
        <Skeleton active />
      </StyledWrapper>
    )
  }

  if (error || !data || !data.activity_session_by_pk) {
    return <StyledWrapper>{formatMessage(errorMessages.data.fetch)}</StyledWrapper>
  }

  const activitySession = data.activity_session_by_pk

  const maximumPeople = sum(
    activitySession.activity_session_tickets.map(sessionTicket => sessionTicket.activity_ticket.count),
  )

  return (
    <StyledWrapper>
      <StyledTitle className="mb-3">{activitySession.title}</StyledTitle>
      <StyledContent>
        <div>
          <Icon type="calendar" className="mr-2" />
          <span>{dateRangeFormatter(activitySession.started_at, activitySession.ended_at)}</span>
        </div>

        <div>
          <Icon type="pushpin" className="mr-2" />
          <span>{activitySession.location}</span>
          {activitySession.description && <span className="ml-2">({activitySession.description})</span>}
        </div>

        {activitySession.activity.is_participants_visible && (
          <div>
            <Icon type="user" className="mr-2" />
            <span>
              {activitySession.activity_enrollments.length} / {maximumPeople}
            </span>
            {activitySession.threshold && (
              <span className="ml-3">
                {formatMessage(activityMessages.ui.threshold)} {activitySession.threshold}
              </span>
            )}
          </div>
        )}
      </StyledContent>
    </StyledWrapper>
  )
}

const GET_ACTIVITY_SESSION = gql`
  query GET_ACTIVITY_SESSION($activitySessionId: uuid!) {
    activity_session_by_pk(id: $activitySessionId) {
      id
      title
      started_at
      ended_at
      location
      description
      threshold
      activity_session_tickets {
        activity_ticket {
          count
        }
      }
      activity {
        is_participants_visible
      }
      activity_enrollments {
        member_id
      }
    }
  }
`

export default ActivitySessionItem
