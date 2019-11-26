import { Divider, Skeleton, Tag } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { InferType } from 'yup'
import { programRoleFormatter } from '../../helpers'
import { usePublicMember } from '../../hooks/member'
import { programRoleSchema, programSchema } from '../../schemas/program'
import MemberAvatar from '../common/MemberAvatar'
import { BREAK_POINT } from '../common/Responsive'

const StyledTitle = styled.h2`
  font-size: 24px;
  letter-spacing: 0.2px;
  color: #585858;
`
const StyledTag = styled(Tag)`
  && {
    margin-left: 12px;
    border: 0;
    border-radius: 11px;
  }
`
const StyledInstructorName = styled.div`
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;

  @media (min-width: ${BREAK_POINT}px) {
    justify-content: flex-start;
  }
`

const ProgramInstructorCollectionBlock: React.FC<{
  program: InferType<typeof programSchema> | null
  title?: string
}> = ({ program, title }) => {
  return (
    <div>
      <StyledTitle>{title || '講師簡介'}</StyledTitle>
      <Divider className="mt-1" />

      <div className="container">
        {program &&
          program.roles
            .filter(role => role.name === 'instructor')
            .map(role => (
              <div key={role.id} className="row">
                <RoleProfile role={role} />
              </div>
            ))}
      </div>
    </div>
  )
}

const RoleProfile: React.FC<{ role: InferType<typeof programRoleSchema> }> = ({ role }) => {
  const { loadingMember, member } = usePublicMember(role.memberId)

  if (loadingMember || !member) {
    return <Skeleton active avatar />
  }

  return (
    <>
      <div className="col-12 col-lg-3 d-flex justify-content-center mb-3">
        <MemberAvatar memberId={role.memberId} size={128} />
      </div>
      <div className="col-12 col-lg-9">
        <StyledInstructorName className="d-flex align-items-center mb-3">
          <span>{member.name}</span>
          <StyledTag>{programRoleFormatter(role.name)}</StyledTag>
        </StyledInstructorName>
        <div style={{ textAlign: 'justify' }}>{member.description}</div>
      </div>
    </>
  )
}

export default ProgramInstructorCollectionBlock
