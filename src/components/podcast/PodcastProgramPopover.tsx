import { Button, Icon, Popover } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { ReactComponent as MicrophoneIcon } from '../../images/default/microphone.svg'
import { AvatarImage } from '../common/Image'
import Responsive, { BREAK_POINT } from '../common/Responsive'
import { Link } from 'react-router-dom'

const StyledWrapper = styled.div`
  padding: 1.25rem;
  width: 100vw;
  max-width: 272px;
  max-height: 70vh;
  overflow: auto;
  background-color: white;
  box-shadow: 0 1px 8px 0 rgba(0, 0, 0, 0.1);

  @media (min-width: ${BREAK_POINT}px) {
    max-width: 320px;
  }
`
const StyledTitle = styled.div`
  margin-bottom: 0.75rem;
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
`
const StyledMeta = styled.div`
  margin-bottom: 0.75rem;
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
`
const StyledDescription = styled.div`
  margin-bottom: 0.75rem;
  color: var(--gray-darker);
  font-size: 14px;
  letter-spacing: 0.4px;
`

export type PodcastProgramPopoverProps = {
  title: string
  duration: number
  description?: string | null
  categories: {
    id: string
    name: string
  }[]
  creator: {
    id: string
    avatarUrl?: string | null
    name: string
  }
}
const PodcastProgramPopover: React.FC<PodcastProgramPopoverProps> = ({
  children,
  title,
  duration,
  description,
  categories,
  creator,
}) => {
  const content = (
    <StyledWrapper>
      <StyledTitle>{title}</StyledTitle>
      <StyledMeta>
        <Icon component={() => <MicrophoneIcon />} className="mr-2" />
        {Math.floor(duration / 60)}:{`${duration % 60}`.padStart(2, '0')}
      </StyledMeta>
      <StyledDescription>{description}</StyledDescription>
      <StyledMeta className="mb-4">
        {categories.map(category => (
          <span key={category.id} className="mr-2">
            #{category.name}
          </span>
        ))}
      </StyledMeta>

      <div className="d-flex align-items-center justify-content-between mb-3">
        <Link to={`/creators/${creator.id}`} className="d-flex align-items-center">
          <AvatarImage className="mr-2" src={creator.avatarUrl} size={36} />
          <StyledMeta className="m-0">{creator.name}</StyledMeta>
        </Link>
        <div className="flex-grow-1 text-right">
          <Button type="link" icon="plus" size="small">
            訂閱頻道
          </Button>
        </div>
      </div>

      <div>
        <Button type="primary" className="mb-2" block>
          立即購買
        </Button>
        <Button block>加入購物車</Button>
      </div>
    </StyledWrapper>
  )

  return (
    <>
      <Responsive.Default>
        <Popover placement="bottomRight" trigger="click" content={content}>
          <div className="cursor-pointer">{children}</div>
        </Popover>
      </Responsive.Default>
      <Responsive.Desktop>
        <Popover placement="right" trigger="click" content={content}>
          <div className="cursor-pointer">{children}</div>
        </Popover>
      </Responsive.Desktop>
    </>
  )
}

export default PodcastProgramPopover
