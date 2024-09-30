import Icon, { CalendarOutlined, UserOutlined } from '@ant-design/icons'
import { Typography } from 'antd'
import moment from 'moment-timezone'
import React from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import EmptyCover from '../../images/default/empty-cover.png'
import { ReactComponent as PlayIcon } from '../../images/icon/play.svg'
import postMessages from './translation'

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
  top: 0.5rem;
  right: 0.5rem;
`
const StyledDescription = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.25rem;
  height: 150px;
`
const StyledTitle = styled(Typography.Title)`
  && {
    color: var(--gray-darker);
    font-size: 18px;
    font-weight: bold;
    letter-spacing: 0.8px;
  }
`
const StyledMeta = styled.div`
  min-height: 1rem;
  color: var(--black-45);
  font-size: 14px;
  letter-spacing: 0.18px;
`
const StyledMemberName = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`
const StyledViews = styled.div`
  padding: 0.75rem 1rem;
  background-color: var(--gray-lighter);
  font-size: 14px;
  color: var(--gray-dark);
  text-align: center;
`

const BlogPostCard: React.FC<{
  coverUrl: string | null
  videoUrl: string | null
  title: string
  views?: number | null
  publishedAt: Date | null
  link: string
  action?: React.ReactNode
  memberName?: string | null
}> = ({ title, coverUrl, videoUrl, views, publishedAt, link, memberName }) => {
  const { formatMessage } = useIntl()
  return (
    <StyledWrapper>
      <Link to={link}>
        <StyledCover src={coverUrl || EmptyCover}>
          <StyledIcon>{videoUrl && <Icon component={() => <PlayIcon />} />}</StyledIcon>
        </StyledCover>

        <StyledDescription>
          <StyledTitle ellipsis={{ rows: 2 }}>{title}</StyledTitle>

          <StyledMeta className="mb-2 d-flex">
            <StyledMemberName className="mr-2">
              <UserOutlined className="mr-2" />
              {memberName}
            </StyledMemberName>
            {publishedAt && (
              <div className="flex-shrink-0">
                <CalendarOutlined className="mr-2" />
                {moment(publishedAt).format('YYYY-MM-DD')}
              </div>
            )}
          </StyledMeta>
        </StyledDescription>
      </Link>

      <StyledViews>
        {formatMessage(postMessages.BlogPostCard.views)} {views}
      </StyledViews>
    </StyledWrapper>
  )
}

export default BlogPostCard
