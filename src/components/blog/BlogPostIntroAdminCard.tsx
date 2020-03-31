import { Form } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React from 'react'
import { BlogPostProps } from '../../types/blog'
import AdminCard from '../admin/AdminCard'

type BlogPostIntroAdminCardProps = BlogPostProps & FormComponentProps

const BlogPostIntroAdminCard: React.FC<BlogPostIntroAdminCardProps> = ({
  post,
  onRefetch,
  form: { getFieldDecorator, resetFields, validateFields },
}) => {
  return <AdminCard></AdminCard>
}

export default Form.create<BlogPostIntroAdminCardProps>()(BlogPostIntroAdminCard)
