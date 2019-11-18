import { Card, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { durationFormatter } from '../../helpers'
import { useEnrolledProgramIds, useProgram, useProgramDuration } from '../../hooks/data'
import EmptyCover from '../../images/default/empty-cover.png'
import AdminCard from '../common/AdminCard'
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
const StyledPriceBlock = styled.div`
  color: #585858;
`

type ProgramCardProps = CardProps & {
  withMetadata?: boolean
  memberId: string
  programId: string
  noPrice?: boolean
  programType?: string
}
const ProgramCard: React.FC<ProgramCardProps> = ({
  withMetadata,
  memberId,
  programId,
  noPrice,
  programType,
  ...cardProps
}) => {
  const { program } = useProgram(programId)
  const duration = useProgramDuration(programId)
  const { enrolledProgramIds } = useEnrolledProgramIds(memberId, true)

  const isEnrolled = enrolledProgramIds.includes(programId)

  return (
    <>
      <AvatarPlaceHolder className="mb-3">
        {program &&
          program.roles
            .filter(role => role.name === 'owner')
            .map(role => <MemberAvatar key={role.memberId} memberId={role.memberId} withName />)}
      </AvatarPlaceHolder>

      <Link
        to={
          isEnrolled
            ? `/programs/${programId}/contents`
            : `/programs/${programId}` + (programType ? `?type=${programType}` : '')
        }
      >
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

                {!isEnrolled && withMetadata && (
                  <StyledPriceBlock className="d-flex justify-content-between">
                    <div>{program && !program.isSubscription && durationFormatter(duration)}</div>
                    {!noPrice && program && <ProgramPriceLabel program={program} />}
                  </StyledPriceBlock>
                )}
              </>
            }
          />
        </AdminCard>
      </Link>
    </>
  )
}

export default ProgramCard
