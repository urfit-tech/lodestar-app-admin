import { Form } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React from 'react'
import { BlogPostProps } from '../../types/blog'
import AdminCard from '../admin/AdminCard'

type BlogPostBasicAdminCardProps = BlogPostProps & FormComponentProps

const BlogPostBasicAdminCard: React.FC<BlogPostBasicAdminCardProps> = ({ post, onRefetch, form }) => {
  return <AdminCard></AdminCard>
}

export default Form.create<BlogPostBasicAdminCardProps>()(BlogPostBasicAdminCard)
