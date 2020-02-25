import { useQuery } from '@apollo/react-hooks'
import { Progress, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import { flatten, groupBy, sum } from 'ramda'
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

type MemberProgress = {
  member: {
    id: string
    name: string
    email: string
    pictureUrl: string
  }
  duration: number
  progress: number
}
type MemberProgramProgress = MemberProgress & {
  programId: string
}

const ProgramProgressTable: React.FC<{
  programId?: string
}> = ({ programId }) => {
  const { formatMessage } = useIntl()
  const { loading, error, data } = useQuery<types.GET_PROGRAM_PROGRESS, types.GET_PROGRAM_PROGRESSVariables>(
    GET_PROGRAM_PROGRESS,
    { variables: { programId } },
  )

  const memberProgramProgressList: MemberProgramProgress[] =
    data?.program_enrollment.map(programEnrollment => {
      const progressData = flatten(
        programEnrollment.program?.program_content_sections.map(contentSection =>
          contentSection.program_contents.map(content => ({
            duration: content.duration || 0,
            progress: sum(
              content.program_content_progress
                .filter(contentProgress => contentProgress.member_id === programEnrollment.member_id)
                .map(contentProgress => contentProgress.progress || 0),
            ),
          })),
        ) || [],
      )
      const totalDuration = sum(progressData.map(v => v.duration)) / 60
      const duration = sum(progressData.map(v => v.duration * v.progress)) / 60
      return {
        programId: programEnrollment.program?.id,
        member: {
          id: programEnrollment.member_id || '',
          name: programEnrollment.member_name || '',
          email: programEnrollment.member_email || '',
          pictureUrl: programEnrollment.member_picture_url || '',
        },
        duration,
        progress: totalDuration ? duration / totalDuration : 1,
      }
    }) || []

  const groupedData = groupBy<MemberProgramProgress>(value => value.member.id)(memberProgramProgressList)

  const dataSource: MemberProgress[] = Object.values(groupedData).map(programProgressList => {
    return {
      member: programProgressList[0].member,
      duration: sum(programProgressList.map(v => v.duration)),
      progress: sum(programProgressList.map(v => v.progress)) / programProgressList.length,
    }
  })

  if (error) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  const programProgressTableColumns: ColumnProps<MemberProgress>[] = [
    {
      title: formatMessage(commonMessages.term.memberName),
      dataIndex: 'member.id',
      render: (_, record) => (
        <MemberAvatar name={record.member.name} pictureUrl={record.member.pictureUrl}></MemberAvatar>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'member.email',
    },
    {
      title: formatMessage(messages.learningDuration),
      dataIndex: 'duration',
      render: value => formatMessage(commonMessages.text.minutes, { minutes: `${parseInt(value)}` }),
    },
    {
      title: formatMessage(messages.learningProgress),
      dataIndex: 'progress',
      render: value => <StyledProgress percent={parseInt(`${value * 100}`)} />,
    },
  ]

  return (
    <Table
      rowKey={row => row.member.id}
      rowClassName={() => 'cursor-pointer'}
      loading={loading}
      columns={programProgressTableColumns}
      dataSource={dataSource}
    />
  )
}

const GET_PROGRAM_PROGRESS = gql`
  query GET_PROGRAM_PROGRESS($programId: uuid) {
    program_enrollment(
      where: { _and: [{ program_id: { _eq: $programId } }, { program: { published_at: { _is_null: false } } }] }
    ) {
      member_id
      member_name
      member_email
      member_picture_url
      program {
        id
        program_content_sections {
          program_contents(where: { published_at: { _is_null: false } }) {
            duration
            program_content_progress {
              progress
              member_id
            }
          }
        }
      }
    }
  }
`
export default ProgramProgressTable
