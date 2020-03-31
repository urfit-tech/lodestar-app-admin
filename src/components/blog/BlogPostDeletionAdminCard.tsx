import React from 'react'
import { BlogPostProps } from '../../types/blog'
import AdminCard from '../admin/AdminCard'

const BlogPostDeletionAdminCard: React.FC<BlogPostProps> = ({ post, onRefetch }) => {
  return <AdminCard></AdminCard>
}

export default BlogPostDeletionAdminCard
