import { Divider, Icon, Tag, Typography } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { InferType } from 'yup'
import { durationFormatter } from '../../helpers'
import { useEnrolledProgramIds } from '../../hooks/data'
import { programContentSchema, programSchema } from '../../schemas/program'
import ProgramContentTrialModal from './ProgramContentTrialModal'

const StyledTitle = styled.h2`
  font-size: 24px;
  letter-spacing: 0.2px;
  color: #585858;
`
const ProgramSectionBlock = styled.div`
  margin-bottom: 2.5rem;
`
const ProgramSectionTitle = styled.h3`
  font-size: 20px;
  font-weight: bold;
`
const ProgramContentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  margin-bottom: 12px;
  padding: 1rem;
  border-radius: 4px;
  background-color: #f7f8f8;
  font-size: 14px;
  cursor: pointer;

  .ant-typography-secondary {
    font-size: 12px;
  }
`
const StyledObscure = styled.span`
  &::before {
    content: ' ';
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
    cursor: pointer;
  }
`
const StyledTag = styled(Tag)`
  && {
    border: none;
  }
`
const StyledDuration = styled.span`
  color: rgb(155, 155, 155);
`

const ProgramContentListSection: React.FC<{
  memberId: string
  program: InferType<typeof programSchema>
  trialOnly?: boolean
}> = ({ memberId, program, trialOnly }) => {
  const { enrolledProgramIds } = useEnrolledProgramIds(memberId, true)

  const isEnrolled = program && enrolledProgramIds.includes(program.id)

  const trialProgramContents: InferType<typeof programContentSchema>[] =
    (program &&
      program.contentSections.flatMap(contentSection =>
        contentSection.programContents.filter(programContent => programContent.price === 0),
      )) ||
    []

  if (trialOnly && trialProgramContents.length === 0) {
    return null
  }

  if (trialOnly) {
    // subscription program
    return (
      <>
        <StyledTitle>試看課程</StyledTitle>
        <Divider className="mt-1" />

        {program.contentSections
          .flatMap(contentSection =>
            contentSection.programContents.filter(programContent => programContent.price === 0),
          )
          .map(programContent => {
            return (
              <ProgramContentTrialModal
                key={programContent.id}
                programContentId={programContent.id}
                render={({ setVisible }) => (
                  <ProgramContentItem onClick={() => setVisible(true)}>
                    <Typography.Text>
                      {programContent.duration ? (
                        <Icon type="video-camera" className="mr-2" />
                      ) : (
                        <Icon type="file-text" className="mr-2" />
                      )}
                      {programContent.title}
                    </Typography.Text>

                    <StyledDuration>{durationFormatter(programContent.duration) || ''}</StyledDuration>
                  </ProgramContentItem>
                )}
              />
            )
          })}
      </>
    )
  }

  // perpetual program
  return (
    <>
      <StyledTitle>課程內容</StyledTitle>
      <Divider className="mt-1" />

      {program.contentSections
        .filter(contentSection => contentSection.programContents.length)
        .map(contentSection => (
          <ProgramSectionBlock key={contentSection.id}>
            <ProgramSectionTitle className="mb-3">{contentSection.title}</ProgramSectionTitle>

            {contentSection.programContents.map(programContent => (
              <ProgramContentItem key={programContent.id}>
                <Typography.Text>
                  {programContent.programContentType.type && programContent.programContentType.type === 'video' ? (
                    <Icon type="video-camera" className="mr-2" />
                  ) : (
                    <Icon type="file-text" className="mr-2" />
                  )}
                  <span>{programContent.title}</span>
                </Typography.Text>

                <StyledDuration>
                  {programContent.price === 0 && !isEnrolled && (
                    <ProgramContentTrialModal
                      programContentId={programContent.id}
                      render={({ setVisible }) => (
                        <StyledObscure onClick={() => setVisible(true)}>
                          <StyledTag>試看</StyledTag>
                        </StyledObscure>
                      )}
                    />
                  )}
                  {durationFormatter(programContent.duration) || ''}
                </StyledDuration>
              </ProgramContentItem>
            ))}
          </ProgramSectionBlock>
        ))}
    </>
  )
}

export default ProgramContentListSection
