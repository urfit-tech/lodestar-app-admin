import { Typography } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { blogMessages } from '../../helpers/translation'
import { BlogPostProps } from '../../types/blog'
import BlogPostBasicAdminCard from './BlogPostBasicAdminCard'
import BlogPostDeletionAdminCard from './BlogPostDeletionAdminCard'
import BlogPostSettingAdminCard from './BlogPostSettingAdminCard'

const BlogSettingAdminPane: React.FC<BlogPostProps> = ({ post, onRefetch }) => {
  const { formatMessage } = useIntl()

  return (
    <div className="container py-3">
      <Typography.Title className="pb-4" level={3}>
        {formatMessage(blogMessages.label.postManagement)}
      </Typography.Title>
      <div className="mb-3">
        <BlogPostBasicAdminCard post={post} onRefetch={onRefetch} />
      </div>
      <div className="mb-3">
        <BlogPostSettingAdminCard post={post} onRefetch={onRefetch} />
      </div>
      <div className="mb-3">
        <BlogPostDeletionAdminCard post={post} onRefetch={onRefetch} />
      </div>
    </div>
  )
}

export default BlogSettingAdminPane
