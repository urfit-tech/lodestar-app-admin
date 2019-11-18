import gql from 'graphql-tag'
import React from 'react'
import { useQuery } from 'react-apollo-hooks'
import FundingProgressBlockComponent from '../../components/project/FundingProgressBlock'
import types from '../../types'

type FundingProgressBlockProps = {
  projectId: string
  targetAmount: number
}
const FundingProgressBlock: React.FC<FundingProgressBlockProps> = ({ projectId, targetAmount }) => {
  const { loading, error, data } = useQuery<types.GET_PROJECT_SALES, types.GET_PROJECT_SALESVariables>(
    GET_PROJECT_SALES,
    { variables: { projectId } },
  )

  const [sales, enrollmentCounts] =
    loading || error || !data
      ? [0, 0]
      : [
          data.project_sales[0] ? data.project_sales[0].total_sales || 0 : 0,
          data.project_plan_enrollment_aggregate.aggregate
            ? data.project_plan_enrollment_aggregate.aggregate.count || 0
            : 0,
        ]

  return <FundingProgressBlockComponent targetAmount={targetAmount} sales={sales} enrollmentCounts={enrollmentCounts} />
}

const GET_PROJECT_SALES = gql`
  query GET_PROJECT_SALES($projectId: uuid!) {
    project_sales(where: { project_id: { _eq: $projectId } }) {
      project_id
      total_sales
    }
    project_plan_enrollment_aggregate(where: { project_plan: { project_id: { _eq: $projectId } } }) {
      aggregate {
        count
      }
    }
  }
`

export default FundingProgressBlock
