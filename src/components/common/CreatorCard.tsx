import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { AvatarImage } from './Image'
import { BREAK_POINT } from './Responsive'

const StyledWrapper = styled.div`
  padding: 2.5rem 1.5rem;
  background: white;
  text-align: center;

  @media (min-width: ${BREAK_POINT}px) {
    display: flex;
    align-items: flex-start;
    padding: 2.5rem;
    text-align: left;
  }
`
const AvatarBlock = styled.div`
  margin-bottom: 2.5rem;

  @media (min-width: ${BREAK_POINT}px) {
    margin-bottom: 0;
    margin-right: 2.5rem;
  }
`
const StyledTitle = styled.div`
  justify-content: center;
  margin-bottom: 0.75rem;
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;

  @media (min-width: ${BREAK_POINT}px) {
    justify-content: start;
  }
`
const StyledLabel = styled.span`
  padding: 2px 0.5rem;
  background: ${props => props.theme['@primary-color']};
  color: white;
  font-size: 12px;
  font-weight: normal;
  line-height: normal;
  letter-spacing: 0.58px;
  border-radius: 11px;
`
const StyledDescription = styled.div`
  margin-bottom: 1.25rem;
  color: var(--gray-darker);
  line-height: 1.69;
  letter-spacing: 0.2px;
  text-align: justify;
`
const StyledAction = styled.span`
  padding: 0 1rem;
  font-size: 14px;

  &:not(:first-child) {
    border-left: 1px solid var(--gray-light);
  }

  @media (min-width: ${BREAK_POINT}px) {
    &:first-child {
      padding-left: 0;
    }
  }
`

const messages = defineMessages({
  creatorPrograms: { id: 'creator.label.creatorPrograms', defaultMessage: '開設課程' },
  creatorPodcast: { id: 'creator.label.creatorPodcast', defaultMessage: '廣播頻道' },
  creatorAppointments: { id: 'creator.label.creatorAppointments', defaultMessage: '大師預約' },
})

export type CreatorCardProps = {
  id: string
  avatarUrl?: string | null
  title: string
  labels: {
    id: string
    name: string
  }[]
  description: string
  withPodcast?: boolean
  withReservation?: boolean
}
const CreatorCard: React.FC<CreatorCardProps> = ({
  id,
  avatarUrl,
  title,
  labels,
  description,
  withPodcast,
  withReservation,
}) => {
  const { formatMessage } = useIntl()

  return (
    <StyledWrapper>
      <AvatarBlock className="flex-shrink-0 d-flex justify-content-center">
        <AvatarImage src={avatarUrl} size={128} />
      </AvatarBlock>

      <div className="flex-grow-1">
        <StyledTitle className="d-flex align-items-center">
          <span>{title}</span>
          {labels.map(label => (
            <StyledLabel key={label.id} className="ml-2">
              {label.name}
            </StyledLabel>
          ))}
        </StyledTitle>

        <StyledDescription>{description}</StyledDescription>

        <div>
          <StyledAction>
            <Link to={`/creators/${id}?tabkey=programs`}>{formatMessage(messages.creatorPrograms)}</Link>
          </StyledAction>
          {withPodcast && (
            <StyledAction>
              <Link to={`/creators/${id}?tabkey=podcasts`}>{formatMessage(messages.creatorPodcast)}</Link>
            </StyledAction>
          )}
          {withReservation && (
            <StyledAction>
              <Link to={`/creators/${id}?tabkey=reservations`}>{formatMessage(messages.creatorAppointments)}</Link>
            </StyledAction>
          )}
        </div>
      </div>
    </StyledWrapper>
  )
}

export default CreatorCard
