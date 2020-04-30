import { Typography } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { programMessages } from '../../helpers/translation'
import EmptyCover from '../../images/default/empty-cover.png'

const StyledWrapper = styled.div`
  overflow: hidden;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
`
const StyledCover = styled.div<{ src?: string | null }>`
  position: relative;
  padding-top: ${900 / 16}%;
  background-image: url(${props => props.src || EmptyCover});
  background-size: cover;
  background-position: center;
`
const StyledDescription = styled.div`
  padding: 1.25rem;
  height: 80px;
`
const StyledTitle = styled(Typography.Title)`
  && {
    margin: 0;
    color: var(--gray-darker);
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 0.8px;
  }
`
const StyledSoldQuantity = styled.div`
  padding: 0.75rem 1rem;
  background-color: var(--gray-lighter);
  font-size: 14px;
  color: var(--gray-dark);
  text-align: center;
`
const ProgramPackageAdminCard: React.FC<{
  id: string
  coverUrl?: string | null
  title: string
  soldQuantity: number
}> = ({ id, coverUrl, title, soldQuantity }) => {
  const { formatMessage } = useIntl()

  return (
    <StyledWrapper>
      <Link to={`/program-packages/${id}?tabkey=program`}>
        <StyledCover src={coverUrl} />

        <StyledDescription>
          <StyledTitle ellipsis={{ rows: 2 }}>{title}</StyledTitle>
        </StyledDescription>

        <StyledSoldQuantity>
          {formatMessage(programMessages.text.enrolledPerpetualCount, { count: soldQuantity })}
        </StyledSoldQuantity>
      </Link>
    </StyledWrapper>
  )
}

export default ProgramPackageAdminCard
