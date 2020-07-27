import { CalendarOutlined, UserOutlined } from '@ant-design/icons'
import moment from 'moment'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import EmptyCover from '../../images/default/empty-cover.png'

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
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
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

export type ActivityProps = {
  id: string
  coverUrl: string | null
  title: string
  description?: string
  isParticipantsVisible: boolean
  participantCount?: number
  publishedAt: Date | null
  startedAt: Date | null
  endedAt: Date | null
  link: string
  action?: React.ReactNode
  isPublished?: boolean
}
const Activity: React.FC<ActivityProps> = ({
  title,
  coverUrl,
  description,
  isParticipantsVisible,
  participantCount,
  startedAt,
  endedAt,
  link,
  action,
}) => {
  const startDate = startedAt ? moment(startedAt).format('YYYY-MM-DD(dd)') : ''
  const endDate = endedAt ? moment(endedAt).format('YYYY-MM-DD(dd)') : ''

  return (
    <StyledWrapper>
      <Link to={link}>
        <StyledCover src={coverUrl || EmptyCover} />

        <StyledDescription>
          <StyledTitle className="mb-4">{title}</StyledTitle>

          <StyledMeta className="mb-2">
            {isParticipantsVisible && (
              <>
                <UserOutlined className="mr-2" />
                <span>{participantCount}</span>
              </>
            )}
          </StyledMeta>

          <StyledMeta>
            <CalendarOutlined className="mr-2" />
            {startDate && endDate ? (
              <span>
                {startDate}
                {startDate !== endDate ? ` ~ ${endDate}` : ''}
              </span>
            ) : null}
          </StyledMeta>
        </StyledDescription>
      </Link>

      {action && <StyledAction>{action}</StyledAction>}
    </StyledWrapper>
  )
}

export default Activity
