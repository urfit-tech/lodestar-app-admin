import { Typography } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { blogMessages } from '../../helpers/translation'
import { PostType } from '../../types/blog'
// import ProgramBasicAdminCard from './ProgramBasicAdminCard'
// import ProgramDeletionAdminCard from './ProgramDeletionAdminCard'
// import ProgramIntroAdminCard from './ProgramIntroAdminCard'

const BlogSettingAdminPane: React.FC<{
  post: PostType | null
  onRefetch?: () => void
}> = ({ post, onRefetch }) => {
  const { formatMessage } = useIntl()

  return (
    <div className="container py-3">
      <Typography.Title className="pb-4" level={3}>
        {formatMessage(blogMessages.label.postManagement)}
      </Typography.Title>
      <div className="mb-3">{/* <BlogPostBasicAdminCard post={post} onRefetch={onRefetch} /> */}</div>
      <div className="mb-3">{/* <BlogPostIntroAdminCard post={post} onRefetch={onRefetch} /> */}</div>
      <div className="mb-3">{/* <BlogPostDeletionAdminCard post={post} onRefetch={onRefetch} /> */}</div>
    </div>
  )
}

export default BlogSettingAdminPane
