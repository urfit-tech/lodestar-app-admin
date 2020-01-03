import React from 'react'
import styled, { css } from 'styled-components'
import DefaultAvatar from '../../images/default/avatar.svg'
import { CustomRatioImage } from './Image'

const StyledCardBody = styled.div<{ active?: boolean }>`
  background-color: white;

  ${props =>
    props.active
      ? css`
          position: relative;
          top: -50px;
          width: 90%;
          max-width: 268px;
          padding-top: 1.5rem;
          padding-left: 1.5rem;
        `
      : 'padding: 1.25rem 0;'}
`
const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledSubtitle = styled.div`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
`
const StyledParagraph = styled.p`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  padding-top: 1.25rem;
  overflow: hidden;
  color: var(--gray-darker);
  font-size: 16px;
  text-align: justify;
  line-height: 1.69;
  letter-spacing: 0.2px;
`

type CreatorBriefCardProps = {
  imageUrl?: string
  title: string
  meta?: string
  description: string
  variant?: string
}
const CreatorBriefCard: React.FC<CreatorBriefCardProps> = ({ imageUrl, title, meta, description, variant }) => {
  return (
    <div>
      <CustomRatioImage width="100%" ratio={1} src={imageUrl || DefaultAvatar} />

      <StyledCardBody active={variant === 'featuring'}>
        <StyledTitle className="mb-2">{title}</StyledTitle>

        <StyledSubtitle>{meta || description}</StyledSubtitle>

        {meta && <StyledParagraph>{description}</StyledParagraph>}
      </StyledCardBody>
    </div>
  )
}

export default CreatorBriefCard
