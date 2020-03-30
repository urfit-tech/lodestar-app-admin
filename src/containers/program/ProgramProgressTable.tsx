import { useQuery } from '@apollo/react-hooks'
import { Progress, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import { groupBy, sum, uniqBy } from 'ramda'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import MemberAvatar from '../../components/common/MemberAvatar'
import { commonMessages, errorMessages } from '../../helpers/translation'
import * as types from '../../types'

const messages = defineMessages({
  learningDuration: { id: 'common.term.learningDuration', defaultMessage: '學習時數' },
  learningProgress: { id: 'common.term.learningProgress', defaultMessage: '學習進度' },
})

const StyledProgress = styled(Progress)`
  && {
    .ant-progress-bg {
      background-color: ${props => props.theme['@primary-color']};
    }
    .anticon-check-circle {
      color: ${props => props.theme['@primary-color']};
    }
  }
`

type MemberProps = {
  memberId: string
  name: string
  email: string
  pictureUrl: string | null
}
type ProgramProps = {
  programId: string
  programContentCount: number
  programContentDuration: number
}
type MemberProgressProps = MemberProps & {
  duration: number
  progress: number
}

const ProgramProgressTable: React.FC<{
  programId?: string | null
}> = ({ programId }) => {
  const { formatMessage } = useIntl()
  const { loading, error, dataSource } = useDataSource(programId)

  if (error) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  const programProgressTableColumns: ColumnProps<MemberProgressProps>[] = [
    {
      dataIndex: 'id',
      title: formatMessage(commonMessages.term.memberName),
      render: (text, record, index) => <MemberAvatar name={record.name} pictureUrl={record.pictureUrl} />,
    },
    {
      dataIndex: 'member.email',
      title: 'Email',
    },
    {
      dataIndex: 'duration',
      title: formatMessage(messages.learningDuration),
      render: (text, record, index) =>
        formatMessage(commonMessages.text.minutes, { minutes: `${Math.floor(record.duration / 60)}` }),
    },
    {
      dataIndex: 'progress',
      title: formatMessage(messages.learningProgress),
      render: (text, record, index) => <StyledProgress percent={Math.floor(record.progress * 100)} />,
    },
  ]

  return (
    <Table
      rowKey={row => row.memberId}
      rowClassName={() => 'cursor-pointer'}
      loading={loading}
      columns={programProgressTableColumns}
      dataSource={dataSource}
    />
  )
}

const useDataSource = (programId?: string | null) => {
  const { loading, error, data } = useQuery<types.GET_PROGRAM_PROGRESS, types.GET_PROGRAM_PROGRESSVariables>(
    GET_PROGRAM_PROGRESS,
    { variables: { programId } },
  )

  const programEnrollments: (MemberProps & ProgramProps)[] = uniqBy(
    enrollment => `${enrollment.memberId}_${enrollment.programId}`,
    data?.program_content_enrollment.map(enrollment => ({
      memberId: enrollment.member?.id || '',
      name: enrollment.member?.name || enrollment.member?.username || '',
      email: enrollment.member?.email || '',
      pictureUrl: enrollment.member?.picture_url || '',

      programId: enrollment.program?.id || '',
      programContentCount: sum(
        enrollment.program?.program_content_sections.map(
          section => section.program_contents_aggregate.aggregate?.count || 0,
        ) || [],
      ),
      programContentDuration: sum(
        enrollment.program?.program_content_sections.map(
          section => section.program_contents_aggregate.aggregate?.sum?.duration || 0,
        ) || [],
      ),
    })) || [],
  )

  const programEnrollmentsByMember = groupBy(enrollment => enrollment.memberId, programEnrollments)

  const dataSource: MemberProgressProps[] = Object.values(programEnrollmentsByMember).map(memberEnrollments => {
    const totalCount = sum(memberEnrollments.map(enrollment => enrollment.programContentCount))
    const totalDuration = sum(memberEnrollments.map(enrollment => enrollment.programContentDuration))
    const progress = totalCount
      ? sum(
          data?.program_content_progress
            .filter(programContentProgress => programContentProgress.member_id === memberEnrollments[0].memberId)
            .map(programContentProgress => programContentProgress.progress) || [],
        ) / totalCount
      : 0

    return {
      memberId: memberEnrollments[0].memberId,
      name: memberEnrollments[0].name,
      email: memberEnrollments[0].email,
      pictureUrl: memberEnrollments[0].pictureUrl,
      duration: totalDuration * progress,
      progress,
    }
  })

  return {
    loading,
    error,
    dataSource,
  }
}

const GET_PROGRAM_PROGRESS = gql`
  query GET_PROGRAM_PROGRESS($programId: uuid) {
    program_content_enrollment(where: { program: { id: { _eq: $programId }, published_at: { _is_null: false } } }) {
      member {
        id
        username
        name
        email
        picture_url
      }
      program {
        id
        program_content_sections {
          program_contents_aggregate(where: { published_at: { _is_null: false } }) {
            aggregate {
              count
              sum {
                duration
              }
            }
          }
        }
      }
    }
    program_content_progress(
      where: {
        program_content: {
          program_content_section: { program: { id: { _eq: $programId }, published_at: { _is_null: false } } }
        }
      }
    ) {
      id
      member_id
      progress
    }
  }
`

export default ProgramProgressTable
