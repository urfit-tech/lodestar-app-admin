import { Icon, Typography } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import CategoryAdminCard from '../../components/common/CategoryAdminCard'
import OwnerAdminLayout from '../../components/layout/OwnerAdminLayout'
import { commonMessages } from '../../helpers/translation'

const BlogPostCategoryPage: React.FC = () => {
  const { formatMessage } = useIntl()
  return (
    <OwnerAdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon type="book" className="mr-3" />
        <span>{formatMessage(commonMessages.menu.blogCategory)}</span>
      </Typography.Title>
      <CategoryAdminCard classType="post" />
    </OwnerAdminLayout>
  )
}

export default BlogPostCategoryPage
