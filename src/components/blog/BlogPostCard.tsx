import { Icon } from 'antd'
import moment from 'moment-timezone'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import EmptyCover from '../../images/default/empty-cover.png'
import { ReactComponent as PlayIcon } from '../../images/icon/play.svg'

const StyledWrapper = styled.div`
  overflow: hidden;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
`
const StyledCover = styled.div<{ src: string }>`
  position: relative;
  padding-top: ${900 / 16}%;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
`
const StyledIcon = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
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
const StyledViews = styled.div`
  padding: 0.75rem 1rem;
  background-color: var(--gray-lighter);
  font-size: 14px;
  color: var(--gray-dark);
  text-align: center;
`

export type BlogPostCardProps = {
  coverUrl: string | null
  videoUrl: string | null
  title: string
  views?: number | null
  publishedAt: Date | null
  link: string
  action?: React.ReactNode
  memberName?: string | null
}
const BlogPostCard: React.FC<BlogPostCardProps> = ({
  title,
  coverUrl,
  videoUrl,
  views,
  publishedAt,
  link,
  memberName,
}) => {
  return (
    <StyledWrapper>
      <Link to={link}>
        <StyledCover src={coverUrl || EmptyCover}>
          <StyledIcon>{videoUrl && <Icon component={() => <PlayIcon />} />}</StyledIcon>
        </StyledCover>

        <StyledDescription>
          <StyledTitle className="mb-4">{title}</StyledTitle>

          <StyledMeta className="mb-2">
            <div className="d-inline-block mr-2">
              <Icon type="user" className="mr-2" />
              {memberName}
            </div>
            {publishedAt && (
              <>
                <Icon type="calendar" className="mr-2" />
                {moment(publishedAt).format('YYYY-MM-DD')}
              </>
            )}
          </StyledMeta>
        </StyledDescription>
      </Link>

      <StyledViews>瀏覽 {views}</StyledViews>
    </StyledWrapper>
  )
}

export default BlogPostCard
