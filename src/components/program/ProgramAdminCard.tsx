import { useQuery } from '@apollo/react-hooks'
import { Card, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import gql from 'graphql-tag'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useProgram } from '../../hooks/program'
import EmptyCover from '../../images/default/empty-cover.png'
import AdminCard from '../admin/AdminCard'
import MemberAvatar from '../common/MemberAvatar'
import ProgramPriceLabel from './ProgramPriceLabel'

const AvatarPlaceHolder = styled.div`
  margin: 16px 0;
  height: 32px;
`
const ProgramCover = styled.div<{ src?: string }>`
  width: 100%;
  padding-top: 56.25%;
  background-image: url(${props => props.src || EmptyCover});
  background-size: cover;
  background-position: center;
`
const ExtraContentBlock = styled.div`
  position: absolute;
  right: 0px;
  bottom: 0px;
  left: 0px;
  padding: 0.5rem 1rem;
  background-color: #f7f8f8;
  color: #9b9b9b;
  text-align: center;
`

type ProgramAdminCardProps = CardProps & {
  programId: string
}
const ProgramAdminCard: React.FC<ProgramAdminCardProps> = ({ programId, ...cardProps }) => {
  const { program } = useProgram(programId)
  const { loading: programEnrollmentLoading, error: programEnrollmentError, data: programEnrollmentData } = useQuery(
    program && program.isSubscription ? GET_SUBSCRIPTION_ENROLLMENT : GET_PERPETUAL_ENROLLMENT,
    {
      variables: { programId },
    },
  )

  return (
    <>
      <AvatarPlaceHolder className="mb-3">
        {program &&
          program.roles
            .filter(role => role.name === 'owner')
            .map(role => <MemberAvatar key={role.memberId} memberId={role.memberId} withName />)}
      </AvatarPlaceHolder>
      <Link to={`/studio/programs/${programId}`}>
        <AdminCard
          {...cardProps}
          variant="program"
          loading={!program}
          cover={<ProgramCover src={program && program.coverUrl ? program.coverUrl : ''} />}
        >
          <Card.Meta
            title={<Typography.Title ellipsis={{ rows: 2 }}>{program && program.title}</Typography.Title>}
            description={
              <>
                <Typography.Paragraph ellipsis={{ rows: 2 }}>{program && program.abstract}</Typography.Paragraph>
                <div className="d-flex justify-content-end pb-3">
                  {program && <ProgramPriceLabel program={program} />}
                </div>
                <ExtraContentBlock>
                  {!program || programEnrollmentLoading
                    ? '-'
                    : programEnrollmentError
                    ? '載入錯誤'
                    : program.isSubscription
                    ? `已訂閱 ${programEnrollmentData.program_plan_enrollment_aggregate.aggregate.count || 0} 人`
                    : `已售 ${programEnrollmentData.program_enrollment_aggregate.aggregate.count} 人`}
                </ExtraContentBlock>
              </>
            }
          />
        </AdminCard>
      </Link>
    </>
  )
}

const GET_PERPETUAL_ENROLLMENT = gql`
  query GET_PERPETUAL_ENROLLMENT($programId: uuid!) {
    program_enrollment_aggregate(where: { program_id: { _eq: $programId } }) {
      aggregate {
        count
      }
    }
  }
`

const GET_SUBSCRIPTION_ENROLLMENT = gql`
  query GET_SUBSCRIPTION_ENROLLMENT($programId: uuid!) {
    program_plan_enrollment_aggregate(where: { program_plan: { program_id: { _eq: $programId } } }) {
      aggregate {
        count
      }
    }
  }
`

export default ProgramAdminCard
