import { Spin } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { useQuery } from 'react-apollo-hooks'
import types from '../../types'

const ProjectEnrollmentCounts: React.FC<{ projectId: string }> = ({ projectId }) => {
  const { loading, error, data } = useQuery<
    types.GET_PROJECT_ENROLLMENT_COUNT,
    types.GET_PROJECT_ENROLLMENT_COUNTVariables
  >(GET_PROJECT_ENROLLMENT_COUNT, {
    variables: {
      projectId,
    },
  })

  if (loading) {
    return <Spin />
  }

  if (error || !data) {
    return <span>讀取錯誤</span>
  }

  return (
    <span>
      參與人數{' '}
      {(data.project_plan_enrollment_aggregate.aggregate &&
        data.project_plan_enrollment_aggregate.aggregate.count &&
        data.project_plan_enrollment_aggregate.aggregate.count) ||
        0}
    </span>
  )
}

const GET_PROJECT_ENROLLMENT_COUNT = gql`
  query GET_PROJECT_ENROLLMENT_COUNT($projectId: uuid!) {
    project_plan_enrollment_aggregate(where: { project_plan: { project_id: { _eq: $projectId } } }) {
      aggregate {
        count
      }
    }
  }
`

export default ProjectEnrollmentCounts
