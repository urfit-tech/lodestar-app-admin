import { CardProps } from 'antd/lib/card'
import React from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { projectMessages } from '../../helpers/translation'
import EmptyCover from '../../images/default/empty-cover.png'
import { ProjectPreviewProps } from '../../types/project'

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
const StyledAction = styled.div`
  padding: 0.75rem 1rem;
  background-color: var(--gray-lighter);
  font-size: 14px;
  letter-spacing: 0.4px;
  div:first-child {
    color: var(--gray-dark);
  }
  div:last-child {
    line-height: 22px;
    color: ${props => props.theme['@primary-color']};
  }
`

const ProjectAdminCard: React.FC<ProjectPreviewProps & CardProps> = ({ id, coverUrl, title, abstract, totalCount }) => {
  const { formatMessage } = useIntl()

  return (
    <StyledWrapper>
      <Link to={`/projects/${id}`}>
        <StyledCover src={coverUrl || EmptyCover} />

        <StyledDescription>
          <StyledTitle className="mb-4">{title}</StyledTitle>
        </StyledDescription>
      </Link>

      <StyledAction className="d-flex justify-content-between">
        <div className="text-left">
          {formatMessage(projectMessages.text.soldOutProjectCount, { count: totalCount })}
        </div>
        <div className="text-right"></div>
      </StyledAction>
    </StyledWrapper>
  )
}
export default ProjectAdminCard
