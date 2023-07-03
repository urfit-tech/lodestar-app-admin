import { Button, Progress, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { sum } from 'ramda'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import MemberAvatar from '../../components/common/MemberAvatar'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { useProgramProgressCollection } from '../../hooks/program'

const messages = defineMessages({
  learningDuration: { id: 'common.label.learningDuration', defaultMessage: '學習時數' },
  learningProgress: { id: 'common.label.learningProgress', defaultMessage: '學習進度' },
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
  onMemberListSet: Dispatch<SetStateAction<string[][]>>
}> = ({ programId, onMemberListSet }) => {
  const { formatMessage } = useIntl()
  const { loadingProgramProgress, errorProgramProgress, memberProgramProgress, fetchMoreProgramProgress } =
    useProgramProgressCollection(programId)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const data: string[][] = [
      [
        formatMessage(commonMessages.label.memberName),
        formatMessage(messages.learningDuration),
        formatMessage(messages.learningProgress),
      ],
    ]

    dataSource.forEach(member => {
      data.push([member.name, `${Math.floor(member.duration / 60)}`, `${Math.floor(member.progress * 100)}`])
    })

    onMemberListSet(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(memberProgramProgress)])

  if (errorProgramProgress) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  const dataSource: MemberProgressProps[] = memberProgramProgress.map(memberEnrollments => {
    const totalCount = sum(memberEnrollments.programEnrollments.map(enrollment => enrollment.programContentCount))
    const totalDuration = sum(memberEnrollments.programEnrollments.map(enrollment => enrollment.programContentDuration))
    const progress =
      totalCount && memberEnrollments.programContentProgresses
        ? sum(
            memberEnrollments.programContentProgresses.map(programContentProgress => programContentProgress.progress) ||
              [],
          ) / totalCount
        : 0

    return {
      memberId: memberEnrollments.memberId,
      name: memberEnrollments.name,
      email: memberEnrollments.email,
      pictureUrl: memberEnrollments.pictureUrl,
      duration: totalDuration * progress,
      progress,
    }
  })

  const programProgressTableColumns: ColumnProps<MemberProgressProps>[] = [
    {
      dataIndex: 'id',
      title: formatMessage(commonMessages.label.memberName),
      render: (text, record, index) => <MemberAvatar size="32px" memberId={record.memberId} withName />,
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
    <>
      <Table
        rowKey={row => row.memberId}
        rowClassName={() => 'cursor-pointer'}
        loading={loadingProgramProgress}
        columns={programProgressTableColumns}
        dataSource={dataSource}
        pagination={false}
      />
      {memberProgramProgress.length >= 10 && fetchMoreProgramProgress && (
        <div className="text-center mt-4">
          <Button
            loading={loading}
            onClick={() => {
              setLoading(true)
              fetchMoreProgramProgress().finally(() => setLoading(false))
            }}
          >
            {formatMessage(commonMessages.ui.showMore)}
          </Button>
        </div>
      )}
    </>
  )
}

export default ProgramProgressTable
