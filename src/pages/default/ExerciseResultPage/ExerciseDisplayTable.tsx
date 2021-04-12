import { Table } from 'antd'
import moment from 'moment'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, programMessages } from '../../../helpers/translation'
import { ExerciseProps } from '../../../types/program'

const messages = defineMessages({
  exerciseCreatedAt: { id: 'program.label.exerciseCreatedAt', defaultMessage: '測驗日期' },
})

const StyledTableWrapper = styled.div`
  color: var(--gray-darker);
  white-space: nowrap;
  line-height: 1.5;
  letter-spacing: 0.2px;
`
const StyledTag = styled.div<{ variant: 'accepted' | 'failed' }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  background-color: ${props => (props.variant === 'accepted' ? 'var(--success)' : 'var(--error)')};
  color: white;
  font-size: 12px;
`

export type ExerciseDisplayProps = ExerciseProps & {
  createdAt: Date
  member: {
    id: string
    name: string
    email: string
  }
  score: number
  status: 'accepted' | 'failed'
}

const ExerciseDisplayTable: React.VFC<{
  totalPoints: number
  exercises: ExerciseDisplayProps[]
}> = ({ totalPoints, exercises }) => {
  const { formatMessage } = useIntl()

  return (
    <StyledTableWrapper>
      <Table<ExerciseDisplayProps>
        rowKey="id"
        scroll={{ x: true }}
        columns={[
          {
            dataIndex: 'createdAt',
            title: formatMessage(messages.exerciseCreatedAt),
            sorter: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
            render: value => moment(value).format('YYYY-MM-DD HH:mm'),
          },
          {
            key: 'memberId',
            title: formatMessage(commonMessages.label.nameAndEmail),
            render: (_, record, i) => (
              <>
                {record.member.name} / {record.member.email}
              </>
            ),
          },
          {
            dataIndex: 'score',
            title: formatMessage(programMessages.label.score),
            sorter: (a, b) => a.score - b.score,
            render: value => (
              <>
                {Math.floor(value * 10) / 10}/{totalPoints}
              </>
            ),
          },
          {
            dataIndex: 'status',
            title: formatMessage(commonMessages.label.status),
            render: value =>
              value === 'accepted' ? (
                <StyledTag variant="accepted">{formatMessage(programMessages.status.accepted)}</StyledTag>
              ) : (
                <StyledTag variant="failed">{formatMessage(programMessages.status.failed)}</StyledTag>
              ),
            filters: [
              {
                text: formatMessage(programMessages.status.accepted),
                value: 'accepted',
              },
              {
                text: formatMessage(programMessages.status.failed),
                value: 'failed',
              },
            ],
            onFilter: (value, record) => record.status === value,
          },
        ]}
        dataSource={exercises}
      />
    </StyledTableWrapper>
  )
}

export default ExerciseDisplayTable
