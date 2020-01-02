import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { durationFormatter } from '../../helpers'
import { useEnrolledProgramIds, useProgram, useProgramDuration } from '../../hooks/program'
import EmptyCover from '../../images/default/empty-cover.png'
import { CustomRatioImage } from '../common/Image'
import MemberAvatar from '../common/MemberAvatar'
import ProgramPriceLabel from './ProgramPriceLabel'

const StyledWrapper = styled.div`
  overflow: hidden;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
`
const StyledMeta = styled.div`
  padding: 1.25rem;
`
const StyledTitle = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 1.25rem;
  height: 3em;
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
`
const StyledDescription = styled.div`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 1.25rem;
  height: 3em;
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
`
const AvatarPlaceHolder = styled.div`
  height: 2rem;
`
const StyledPriceBlock = styled.div`
  height: 1.5rem;
  color: var(--gray-dark);
  font-size: 14px;
`

type ProgramCardProps = {
  memberId: string
  programId: string
  programType?: string
  noInstructor?: boolean
  noPrice?: boolean
  withMetadata?: boolean
}
const ProgramCard: React.FC<ProgramCardProps> = ({
  memberId,
  programId,
  programType,
  noInstructor,
  noPrice,
  withMetadata,
}) => {
  const { program } = useProgram(programId)
  const duration = useProgramDuration(programId)
  const { enrolledProgramIds } = useEnrolledProgramIds(memberId, true)

  const isEnrolled = enrolledProgramIds.includes(programId)

  return (
    <>
      {!noInstructor && (
        <AvatarPlaceHolder className="my-3">
          {program &&
            program.roles
              .filter(role => role.name === 'instructor')
              .slice(0, 1)
              .map(role => <MemberAvatar key={role.memberId} memberId={role.memberId} withName />)}
        </AvatarPlaceHolder>
      )}

      <Link
        to={
          isEnrolled
            ? `/programs/${programId}/contents`
            : `/programs/${programId}` + (programType ? `?type=${programType}` : '')
        }
      >
        <StyledWrapper>
          <CustomRatioImage
            width="100%"
            ratio={9 / 16}
            src={program && program.coverUrl ? program.coverUrl : EmptyCover}
            shape="rounded"
          />
          <StyledMeta>
            <StyledTitle>{program && program.title}</StyledTitle>
            <StyledDescription>{program && program.abstract}</StyledDescription>

            <StyledPriceBlock className="d-flex justify-content-between">
              {!isEnrolled && withMetadata && (
                <>
                  <div>{program && !program.isSubscription && durationFormatter(duration)}</div>
                  {!noPrice && program && <ProgramPriceLabel program={program} />}
                </>
              )}
            </StyledPriceBlock>
          </StyledMeta>
        </StyledWrapper>
      </Link>
    </>
  )
}

export default ProgramCard
