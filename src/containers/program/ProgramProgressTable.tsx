import { Progress, Table } from 'antd'
import * as types from '../../types'
import { ColumnProps } from 'antd/lib/table'
import React from 'react'
import MemberAvatar from '../../components/common/MemberAvatar'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import { groupBy, sum, flatten } from 'ramda'

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
type ProgramProgressTableProps = {
  programId?: string
}
const ProgramProgressTable: React.FC<ProgramProgressTableProps> = ({ programId }) => {
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
    return <div>無法載入資料</div>
  }

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

const programProgressTableColumns: ColumnProps<MemberProgress>[] = [
  {
    title: '姓名',
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
    title: '學習時數',
    dataIndex: 'duration',
    render: value => `${parseInt(value)} 分鐘`,
  },
  {
    title: '學習進度',
    dataIndex: 'progress',
    render: value => <Progress percent={parseInt(`${value * 100}`)} />,
  },
]

const GET_PROGRAM_PROGRESS = gql`
  query GET_PROGRAM_PROGRESS($programId: uuid) {
    program_enrollment(where: { program_id: { _eq: $programId } }) {
      member_id
      member_name
      member_email
      member_picture_url
      program {
        id
        program_content_sections {
          program_contents {
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
