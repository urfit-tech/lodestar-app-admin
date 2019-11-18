import { Skeleton, Typography } from 'antd'
import gql from 'graphql-tag'
import { flatten, uniq } from 'ramda'
import React from 'react'
import { useQuery } from 'react-apollo-hooks'
import ProgramCard from '../../components/program/ProgramCard'
import types from '../../types'

const EnrolledProgramCollectionBlock: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { loading, error, data } = useQuery<types.GET_OWNED_PROGRAMS, types.GET_OWNED_PROGRAMSVariables>(
    GET_OWNED_PROGRAMS,
    { variables: { memberId } },
  )

  if (loading) {
    return (
      <div className="container py-3">
        <Typography.Title level={4}>課程</Typography.Title>
        <Skeleton active avatar />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container py-3">
        <Typography.Title level={4}>課程</Typography.Title>
        <div>無法載入</div>
      </div>
    )
  }

  const programIds = uniq(
    flatten([
      ...data.program_enrollment.map(programEnrollment => programEnrollment.program_id),
      ...data.program_plan_enrollment.map(programPlanEnrollment =>
        programPlanEnrollment.program_plan ? programPlanEnrollment.program_plan.program_id : null,
      ),
      ...data.program_content_enrollment.map(programContentEnrollment => programContentEnrollment.program_id),
    ]),
  )

  return (
    <div className="container py-3">
      <Typography.Title level={4}>課程</Typography.Title>

      {programIds.length === 0 ? (
        <div>沒有參與任何課程</div>
      ) : (
        <div className="row">
          {programIds.map(programId => (
            <div key={programId} className="col-12 mb-4 col-md-6 col-lg-4">
              <ProgramCard memberId={memberId} programId={programId} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const ProgramCardWithProgramPlanId: React.FC<{ programPlanId: string; memberId: string }> = ({
  programPlanId,
  memberId,
}) => {
  const { data } = useQuery<types.GET_PROGRAM_BY_PROGRAM_PLAN_ID, types.GET_PROGRAM_BY_PROGRAM_PLAN_IDVariables>(
    GET_PROGRAM_BY_PROGRAM_PLAN_ID,
    {
      variables: { programPlanId },
    },
  )
  const program = data && data.program && data.program[0]
  return (program && <ProgramCard memberId={memberId} programId={program.id} />) || null
}

const GET_OWNED_PROGRAMS = gql`
  query GET_OWNED_PROGRAMS($memberId: String!) {
    program_enrollment(where: { member_id: { _eq: $memberId } }, distinct_on: program_id) {
      program_id
    }
    program_plan_enrollment(where: { member_id: { _eq: $memberId } }, distinct_on: program_plan_id) {
      program_plan {
        id
        program_id
      }
    }
    program_content_enrollment(distinct_on: program_id) {
      program_id
    }
  }
`

const GET_PROGRAM_BY_PROGRAM_PLAN_ID = gql`
  query GET_PROGRAM_BY_PROGRAM_PLAN_ID($programPlanId: uuid!) {
    program(where: { program_plans: { id: { _eq: $programPlanId } } }) {
      id
    }
  }
`
export default EnrolledProgramCollectionBlock
