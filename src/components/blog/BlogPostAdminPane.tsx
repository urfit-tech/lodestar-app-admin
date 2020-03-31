import { Typography } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { blogMessages } from '../../helpers/translation'
import { BlogPostProps } from '../../types/blog'
import BlogPostContentAdminCard from './BlogPostContentAdminCard'
import BlogPostVideoAdminCard from './BlogPostVideoAdminCard'

const BlogPostAdminPane: React.FC<BlogPostProps> = ({ post, onRefetch }) => {
  const { formatMessage } = useIntl()

  return (
    <div className="container py-3">
      <Typography.Title className="pb-4" level={3}>
        {formatMessage(blogMessages.label.postContent)}
      </Typography.Title>
      <div className="mb-3">
        <BlogPostVideoAdminCard post={post} onRefetch={onRefetch} />
      </div>
      <div className="mb-3">
        <BlogPostContentAdminCard post={post} onRefetch={onRefetch} />
      </div>
    </div>
  )
}

export default BlogPostAdminPane
