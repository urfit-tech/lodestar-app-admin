import React from 'react'
import { ProjectContentProps } from './ProjectContent'

const PreOrderContentBlock: React.FC<ProjectContentProps> = ({
  id,
  type,
  createdAt,
  publishedAt,
  expiredAt,
  coverUrl,
  title,
  abstract,
  description,
  targetAmount,
  template,
  introduction,
  contents,
  updates,
  comments,
}) => {
  return <div>Default Pre Order Content</div>
}

export default PreOrderContentBlock
