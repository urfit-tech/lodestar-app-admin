import Icon from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Select, Spin } from 'antd'
import gql from 'graphql-tag'
import { flatten } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import { useAuth } from '../../contexts/AuthContext'
import hasura from '../../hasura'
import { commonMessages, errorMessages, programMessages } from '../../helpers/translation'
import { ReactComponent as BookIcon } from '../../images/icon/book.svg'

type FilterProps = {
  programId?: string
  contentId?: string
}

const ExerciseResultPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { currentUserRole, currentMemberId } = useAuth()

  const [selectedExercise, setSelectedExercise] = useState<FilterProps>({})

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <BookIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.practice)}</span>
      </AdminPageTitle>

      <ProgramExerciseSelector
        creatorId={currentUserRole === 'content-creator' ? currentMemberId || '' : undefined}
        value={selectedExercise}
        onChange={value => setSelectedExercise(value)}
      />
    </AdminLayout>
  )
}

const ProgramExerciseSelector: React.VFC<{
  creatorId?: string
  value: FilterProps
  onChange?: (value: FilterProps) => void
}> = ({ creatorId, value, onChange }) => {
  const { formatMessage } = useIntl()
  const { loadingPrograms, errorPrograms, programs } = useProgramWithExercises(creatorId)

  if (loadingPrograms) {
    return <Spin />
  }

  if (errorPrograms) {
    return <>{formatMessage(errorMessages.data.fetch)}</>
  }

  return (
    <>
      <Select
        showSearch
        placeholder={<>{formatMessage(programMessages.label.select)}</>}
        optionFilterProp="children"
        value={value.programId || undefined}
        onChange={newProgramId =>
          onChange?.({
            programId: newProgramId,
          })
        }
        className="mr-3"
        style={{ width: '24rem' }}
      >
        {programs.map(program => (
          <Select.Option key={program.id} value={program.id}>
            {program.title}
          </Select.Option>
        ))}
      </Select>
      <Select
        showSearch
        placeholder={<>{formatMessage(programMessages.label.selectExercise)}</>}
        optionFilterProp="children"
        value={value.contentId || undefined}
        onChange={newContentId =>
          onChange?.({
            programId: value.programId,
            contentId: newContentId,
          })
        }
        style={{ width: '12rem' }}
      >
        {programs
          .find(program => program.id === value.programId)
          ?.contents.map(content => (
            <Select.Option key={content.id} value={content.id}>
              {content.title}
            </Select.Option>
          ))}
      </Select>
    </>
  )
}

const useProgramWithExercises = (creatorId?: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PROGRAMS_WITH_EXERCISES,
    hasura.GET_PROGRAMS_WITH_EXERCISESVariables
  >(
    gql`
      query GET_PROGRAMS_WITH_EXERCISES($creatorId: String) {
        program(
          where: {
            program_roles: { name: { _eq: "owner" }, member_id: { _eq: $creatorId } }
            program_content_sections: { program_contents: { program_content_body: { type: { _eq: "exercise" } } } }
          }
        ) {
          id
          title
          program_content_sections {
            id
            program_contents(where: { program_content_body: { type: { _eq: "exercise" } } }) {
              id
              title
            }
          }
        }
      }
    `,
    { variables: { creatorId } },
  )

  const programs: {
    id: string
    title: string
    contents: {
      id: string
      title: string
    }[]
  }[] =
    data?.program.map(v => ({
      id: v.id,
      title: v.title,
      contents: flatten(v.program_content_sections.map(s => s.program_contents)),
    })) || []

  return {
    loadingPrograms: loading,
    errorPrograms: error,
    programs,
    refetchPrograms: refetch,
  }
}

export default ExerciseResultPage
