import { Progress, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import React from 'react'
import MemberAvatar from '../../components/common/MemberAvatar'
import { useAuth } from '../../contexts/AuthContext'

type ProgramProgress = {
  member: {
    id: string
    name: string
    email: string
    pictureUrl: string
  }
  duration: number
  progress: number
}
type ProgramProgressTableProps = {
  programId?: string
}
const ProgramProgressTable: React.FC<ProgramProgressTableProps> = ({ programId }) => {
  const { currentUserRole, currentMemberId } = useAuth()

  const columns: ColumnProps<ProgramProgress>[] = [
    {
      title: '姓名',
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
      render: value => `${value} 分鐘`,
    },
    {
      title: '學習進度',
      dataIndex: 'progress',
      render: value => <Progress percent={value * 100} />,
    },
  ]

  const dataSource: ProgramProgress[] = [
    {
      member: {
        id: 'foo',
        name: 'KK',
        email: 'kk@kolable.com',
        pictureUrl: 'https://i.pravatar.cc/300',
      },
      duration: 120,
      progress: 0.5,
    },
  ]

  return <Table rowKey="member.id" rowClassName={() => 'cursor-pointer'} columns={columns} dataSource={dataSource} />
}

export default ProgramProgressTable
