import { useQuery } from '@apollo/react-hooks'
import { Card, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import gql from 'graphql-tag'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import MemberAvatar from '../../containers/common/MemberAvatar'
import { notEmpty } from '../../helpers'
import { errorMessages, programMessages } from '../../helpers/translation'
import { useProgram } from '../../hooks/program'
import EmptyCover from '../../images/default/empty-cover.png'
import AdminCard from '../admin/AdminCard'
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

const messages = defineMessages({
  noAssignedInstructor: { id: 'common.text.noAssignedInstructor', defaultMessage: '尚未指定講師' },
})

type ProgramAdminCardProps = CardProps & {
  programId: string
  link: string
}
const ProgramAdminCard: React.FC<ProgramAdminCardProps> = ({ programId, link, ...cardProps }) => {
  const { formatMessage } = useIntl()
  const { program } = useProgram(programId)

  const { loading: programEnrollmentLoading, error: programEnrollmentError, data: programEnrollmentData } = useQuery(
    program && program.isSubscription ? GET_SUBSCRIPTION_ENROLLMENT : GET_PERPETUAL_ENROLLMENT,
    {
      variables: { programId },
    },
  )

  const instructors = program?.roles
    ? program.roles
        .filter(role => role.name === 'instructor')
        .map(role => role.member)
        .filter(notEmpty)
    : []

  return (
    <>
      <AvatarPlaceHolder className="mb-3">
        {instructors.length > 0 ? (
          <MemberAvatar key={instructors[0].id || ''} memberId={instructors[0].id || ''} withName />
        ) : (
          formatMessage(messages.noAssignedInstructor)
        )}
      </AvatarPlaceHolder>
      <Link to={link}>
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
                    ? formatMessage(errorMessages.data.fetch)
                    : program.isSubscription
                    ? formatMessage(programMessages.text.enrolledSubscriptionCount, {
                        count: programEnrollmentData.program_plan_enrollment_aggregate.aggregate.count || 0,
                      })
                    : formatMessage(programMessages.text.enrolledPerpetualCount, {
                        count: programEnrollmentData.program_enrollment_aggregate.aggregate.count || 0,
                      })}
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
