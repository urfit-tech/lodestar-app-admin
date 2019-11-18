import { Skeleton } from 'antd'
import { render } from 'mustache'
import React from 'react'
import { Redirect } from 'react-router'
import { FundingCommentProps } from './FundingCommentsPane'
import FundingContentBlock from './FundingContentBlock'
import { FundingContentProps } from './FundingContentsPane'
import { FundingUpdateProps } from './FundingUpdatesPane'
import OnSaleContentBlock from './OnSaleContentBlock'
import { ProjectPlanProps } from './ProjectPlan'

type Update = {
  date: string
  cover: string
  title: string
  description: string
}

type OnSaleContentProps = {
  title: string
  subtitle: string
  contents: {
    title: string
    description: string
  }[]
  updates: Update[]
}

export type ProjectContentProps = {
  loading?: boolean
  error?: Error
  id: string
  type: string
  createdAt: Date
  publishedAt: Date | null
  expiredAt: Date | null
  coverType: string
  coverUrl: string
  title: string
  abstract: string
  description: string
  targetAmount: number
  template: string | null
  introduction: string
  contents: any
  updates: any
  comments: FundingCommentProps[]
  projectPlans: ProjectPlanProps[]
}
const ProjectContent: React.FC<ProjectContentProps> = props => {
  const { template } = props

  if (props.loading) {
    return <Skeleton active />
  }

  if (props.error || !props.publishedAt || props.publishedAt.getTime() > Date.now()) {
    return <Redirect to="/" />
  }

  if (template) {
    return <div dangerouslySetInnerHTML={{ __html: render(template, props) }} />
  }

  switch (props.type) {
    case 'funding':
    case 'pre-order':
      return (
        <FundingContentBlock
          {...props}
          contents={props.contents as FundingContentProps[]}
          updates={props.updates as FundingUpdateProps[]}
        />
      )
    // return <PreOrderContentBlock {...props} />
    case 'on-sale':
      return <OnSaleContentBlock {...props} contents={props.contents as OnSaleContentProps[]} />
    default:
      return <div>Default Project Page</div>
  }
}

export default ProjectContent
