import React from 'react'
import { PostType } from '../../types/blog'
import RoleAdminBlock from '../admin/RoleAdminBlock'

type BlogPostAuthorCollectionBlockProps = {
  post: PostType
}

const BlogPostAuthorCollectionBlock: React.FC<BlogPostAuthorCollectionBlockProps> = ({ post }) => {
  const handleDelete = () => {}

  return (
    <>
      {post.authors &&
        post.authors.map(author => (
          <RoleAdminBlock
            key={author.id}
            name={author.name}
            pictureUrl={author.pictureUrl}
            onDelete={() => handleDelete()}
          />
        ))}
    </>
  )
}

export default BlogPostAuthorCollectionBlock
