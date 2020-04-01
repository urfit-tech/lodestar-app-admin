import { Progress, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { groupBy, sum } from 'ramda'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import MemberAvatar from '../../components/common/MemberAvatar'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { useProgramProgressCollection } from '../../hooks/program'

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
type MemberProgressProps = MemberProps & {
  duration: number
  progress: number
}

const ProgramProgressTable: React.FC<{
  programId?: string | null
}> = ({ programId }) => {
  const { formatMessage } = useIntl()
  const { loading, error, programEnrollments, programContentProgress } = useProgramProgressCollection(programId)

  if (error) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  const programEnrollmentsByMember = groupBy(enrollment => enrollment.memberId, programEnrollments)

  const dataSource: MemberProgressProps[] = Object.values(programEnrollmentsByMember).map(memberEnrollments => {
    const totalCount = sum(memberEnrollments.map(enrollment => enrollment.programContentCount))
    const totalDuration = sum(memberEnrollments.map(enrollment => enrollment.programContentDuration))
    const progress =
      totalCount && programContentProgress
        ? sum(
            programContentProgress
              .filter(programContentProgress => programContentProgress.memberId === memberEnrollments[0].memberId)
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

export default ProgramProgressTable
