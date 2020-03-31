import { Typography } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { blogMessages } from '../../helpers/translation'
import { BlogPostProps } from '../../types/blog'
import AdminBraftEditor from '../admin/AdminBraftEditor'
import AdminCard from '../admin/AdminCard'

const BlogPostContentAdminCard: React.FC<BlogPostProps> = ({ post, onRefetch }) => {
  const { formatMessage } = useIntl()
  return (
    <AdminCard>
      <Typography.Title className="pb-4" level={4}>
        {formatMessage(blogMessages.ui.contentDescription)}
      </Typography.Title>
      <AdminBraftEditor />
    </AdminCard>
  )
}

export default BlogPostContentAdminCard
