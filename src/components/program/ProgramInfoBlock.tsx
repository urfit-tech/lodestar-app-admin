import { Affix, Button, Card } from 'antd'
import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { InferType } from 'yup'
import { currencyFormatter } from '../../helpers'
import { useEnrolledProgramIds, usePublicMember } from '../../hooks/data'
import { programSchema } from '../../schemas/program'
import { useAuth } from '../auth/AuthContext'
import ProgramPaymentButton from '../checkout/ProgramPaymentButton'
import { AvatarImage } from '../common/Image'
import Responsive, { BREAK_POINT } from '../common/Responsive'

const ProgramInforCard = styled(Card)`
  && {
    margin-bottom: 2.5rem;
    box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
  }

  .ant-card-body {
    padding: 1rem;
  }
`
const StyledInstructorName = styled.div`
  margin-bottom: 28px;
  color: #585858;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
`
const StyledCountBlock = styled.div`
  text-align: center;

  > div {
    padding: 0 1.5rem;
    height: 2.5rem;
    padding-bottom: 0.25rem;
  }
  > div + div {
    border-left: 1px solid #ececec;
  }

  span:first-child {
    color: #585858;
    font-size: 24px;
    letter-spacing: 0.2px;
  }
  span:last-child {
    color: #9b9b9b;
    font-size: 14px;
    letter-spacing: 0.4px;
  }

  @media (min-width: ${BREAK_POINT}px) {
    margin-bottom: 2rem;
  }
`
const StyledPriceBLock = styled.div`
  text-align: center;
`
const PriceLabel = styled.span`
  color: #585858;
  font-size: 18px;
  font-weight: bold;

  & + & {
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
    font-weight: normal;
    text-decoration: line-through;

    ::before {
      content: '原價 ';
    }
  }
`

const ProgramInfoBlock: React.FC<{
  program: InferType<typeof programSchema>
}> = ({ program }) => {
  const { currentMemberId } = useAuth()
  const instructorId = program.roles.filter(role => role.name === 'instructor').map(role => role.memberId)[0]
  const { member } = usePublicMember(instructorId)
  const { enrolledProgramIds } = useEnrolledProgramIds(currentMemberId || '', true)

  const isEnrolled = enrolledProgramIds.includes(program.id)

  return (
    <>
      <Responsive.Default>
        <ProgramInforCard>
          <ProgramContentCountBlock program={program} />
        </ProgramInforCard>
      </Responsive.Default>

      <Responsive.Desktop>
        <Affix offsetTop={40} target={() => document.getElementById('layout-content')}>
          <ProgramInforCard>
            {member && (
              <>
                <AvatarImage src={member.pictureUrl || ''} size={96} className="my-3 mx-auto" />
                <StyledInstructorName>{member.name}</StyledInstructorName>
              </>
            )}

            <ProgramContentCountBlock program={program} />

            <StyledPriceBLock className="mb-3">
              {program.soldAt && program.soldAt > new Date() && (
                <PriceLabel className="mr-2">{currencyFormatter(program.salePrice)}</PriceLabel>
              )}
              <PriceLabel>{currencyFormatter(program.listPrice)}</PriceLabel>
            </StyledPriceBLock>

            {currentMemberId && !isEnrolled && (
              <ProgramPaymentButton memberId={currentMemberId} program={program} variant="multiline" />
            )}
            {currentMemberId && isEnrolled && (
              <Link to={`/programs/${program.id}/contents`}>
                <Button block>進入課程</Button>
              </Link>
            )}
          </ProgramInforCard>
        </Affix>
      </Responsive.Desktop>
    </>
  )
}

const ProgramContentCountBlock: React.FC<{
  program: InferType<typeof programSchema>
}> = ({ program }) => {
  const numProgramContents = program.contentSections
    .flatMap(contentSection => contentSection.programContents.length)
    .reduce((a, b) => a + b, 0)

  const totalDuration = program.contentSections
    .map(contentSection =>
      contentSection.programContents.map(programContent => programContent.duration || 0).reduce((a, b) => a + b, 0),
    )
    .reduce((a, b) => a + b, 0)

  return (
    <StyledCountBlock className="d-flex align-items-center justify-content-center">
      <div className="d-flex flex-column justify-content-center">
        <span>{Math.floor(totalDuration / 60)}</span>
        <span>分鐘</span>
      </div>
      <div className="d-flex flex-column justify-content-center">
        <span>{program.contentSections.filter(contentSesion => contentSesion.programContents.length).length}</span>
        <span>章節</span>
      </div>
      <div className="d-flex flex-column justify-content-center">
        <span>{numProgramContents}</span>
        <span>內容</span>
      </div>
    </StyledCountBlock>
  )
}

export default ProgramInfoBlock
