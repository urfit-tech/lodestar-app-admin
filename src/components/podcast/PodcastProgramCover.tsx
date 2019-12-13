import moment from 'moment'
import React from 'react'
import styled from 'styled-components'
import { BREAK_POINT } from '../common/Responsive'

const StyledWrapper = styled.div<{ coverUrl?: string }>`
  padding: 4rem 1.5rem;
  background-image: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${props => props.coverUrl || ''});
  background-size: cover;
  background-position: center;
  color: white;
  text-align: center;

  @media (min-width: ${BREAK_POINT}px) {
    height: calc(100vh - 64px);
    padding: 4rem;
    text-align: left;
  }
`
const StyledTitle = styled.h1`
  color: white;
  font-size: 28px;
  font-weight: 500;
  line-height: 1.3;
  letter-spacing: 0.23px;

  @media (min-width: ${BREAK_POINT}px) {
    font-size: 40px;
    font-weight: bold;
    letter-spacing: 1px;
  }
`
const StyledMeta = styled.div`
  font-size: 14px;
  letter-spacing: 0.8px;

  span:not(:first-child) {
    margin-left: 0.5rem;
  }
`

export type PodcastProgramCoverProps = {
  coverUrl?: string | null
  title: string
  publishedAt: Date
  categories: {
    id: string
    name: string
  }[]
}
const PodcastProgramCover: React.FC<PodcastProgramCoverProps> = ({ coverUrl, title, publishedAt, categories }) => {
  return (
    <StyledWrapper coverUrl={coverUrl || ''}>
      <StyledMeta className="mb-4">{moment(publishedAt).format('YYYY-MM-DD')}</StyledMeta>

      <StyledMeta className="mb-3">
        {categories.map(category => (
          <span key={category.id}>#{category.name}</span>
        ))}
      </StyledMeta>

      <StyledTitle>{title}</StyledTitle>
    </StyledWrapper>
  )
}

export default PodcastProgramCover
