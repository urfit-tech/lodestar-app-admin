import { Spin, Tabs } from 'antd'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import React, { useEffect } from 'react'
import { useMutation } from 'react-apollo-hooks'
import styled from 'styled-components'
import { throttle } from 'throttle-typescript'
import { InferType } from 'yup'
import { useProgramContent } from '../../hooks/data'
import { programSchema } from '../../schemas/program'
import { useAuth } from '../auth/AuthContext'
import { BraftContent } from '../common/StyledBraftEditor'
import IssueThreadBlock from '../issue/IssueThreadBlock'
import ProgramContentPlayer from './ProgramContentPlayer'

const StyledContentBlock = styled.div`
  padding: 1.25rem;
  background-color: white;
`
const StyledTitle = styled.h3`
  padding-bottom: 1.25rem;
  border-bottom: 1px solid #e8e8e8;
  font-size: 20px;
`

const ProgramContentBlock: React.FC<{
  program: InferType<typeof programSchema>
  programContentId: string
}> = ({ program, programContentId }) => {
  const { currentMemberId } = useAuth()
  const { programContent, refetchProgramContent } = useProgramContent(programContentId)
  const insertProgramContentProgress = useMutation(INSTERT_PROGRAM_CONTENT_PROGRESS)

  const setProgress = (progress: number) => {
    if (progress === 0) {
      return
    }

    insertProgramContentProgress({
      variables: {
        memberId: currentMemberId,
        programContentId: programContentId,
        progress: progress,
      },
    }).then(() => {
      refetchProgramContent()
    })
  }
  const setProgressThrottle = throttle(setProgress, 3000)

  useEffect(() => {
    if (
      currentMemberId &&
      programContent.programContentBody &&
      programContent.programContentBody.id &&
      programContent.programContentBody.type !== 'video'
    ) {
      setProgressThrottle(1)
    }
  })

  if (!programContent) {
    return <Spin />
  }

  return (
    <div id="program_content_block" className="p-sm-4" style={{ paddingTop: '20px' }}>
      {!programContent.programContentBody && '未購買此內容'}

      {currentMemberId && programContent.programContentBody && programContent.programContentBody.type === 'video' && (
        <ProgramContentPlayer
          memberId={currentMemberId}
          programContentBody={programContent.programContentBody}
          onProgress={({ played }) => {
            setProgressThrottle(played)
          }}
          onEnded={() => {
            setProgress(1)
          }}
        />
      )}

      <StyledContentBlock className="mb-3">
        <StyledTitle className="mb-4 text-center">{programContent.title}</StyledTitle>

        {programContent.programContentBody &&
          !BraftEditor.createEditorState(programContent.programContentBody.description).isEmpty() && (
            <BraftContent>{programContent.programContentBody.description}</BraftContent>
          )}
      </StyledContentBlock>

      <StyledContentBlock>
        <Tabs defaultActiveKey="issue">
          <Tabs.TabPane tab="問題討論" key="issue" className="py-3">
            <IssueThreadBlock
              programRoles={program.roles}
              threadId={`/programs/${program.id}/contents/${programContentId}`}
            />
          </Tabs.TabPane>
        </Tabs>
      </StyledContentBlock>
    </div>
  )
}

const INSTERT_PROGRAM_CONTENT_PROGRESS = gql`
  mutation INSTERT_PROGRAM_CONTENT_PROGRESS($memberId: String, $programContentId: uuid!, $progress: numeric) {
    insert_program_content_progress(
      objects: { member_id: $memberId, program_content_id: $programContentId, progress: $progress }
      on_conflict: { constraint: program_content_progress_member_id_program_content_id_key, update_columns: progress }
    ) {
      affected_rows
    }
  }
`

export default ProgramContentBlock
