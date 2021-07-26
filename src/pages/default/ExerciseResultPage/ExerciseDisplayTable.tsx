import { SearchOutlined } from '@ant-design/icons'
import { Button, Input, Table } from 'antd'
import { ColumnType } from 'antd/lib/table'
import moment from 'moment'
import React, { useRef } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { useApp } from '../../../contexts/AppContext'
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
  programId: string
  programContentId: string
}> = ({ totalPoints, exercises, programId, programContentId }) => {
  const { formatMessage } = useIntl()
  const { host } = useApp()
  const inputRef = useRef<Input>(null)

  const getColumnSearchProps: (dataIndex: keyof ExerciseDisplayProps) => ColumnType<ExerciseDisplayProps> =
    dataIndex => ({
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className="p-2" style={{ width: '200px' }}>
          <Input
            ref={inputRef}
            placeholder={formatMessage(programMessages.text.searchExerciseMember)}
            value={selectedKeys[0]}
            className="d-block mb-2"
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
          />
          <div className="d-flex justify-content-between">
            <Button type="primary" icon={<SearchOutlined />} size="small" block onClick={() => confirm()}>
              {formatMessage(commonMessages.ui.search)}
            </Button>
            <Button size="small" block className="ml-2" onClick={() => clearFilters?.()}>
              {formatMessage(commonMessages.ui.reset)}
            </Button>
          </div>
        </div>
      ),
      filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
      onFilter: (value, record) =>
        record[dataIndex]
          ? `${JSON.stringify(record[dataIndex])}`.toLowerCase().includes(`${value}`.toLowerCase())
          : false,
      onFilterDropdownVisibleChange: visible => {
        if (visible) {
          setTimeout(() => inputRef.current?.select(), 100)
        }
      },
    })

  return (
    <StyledTableWrapper>
      <Table<ExerciseDisplayProps>
        rowKey="id"
        scroll={{ x: true }}
        onRow={record => ({
          onClick: () =>
            window.open(
              `//${host}/programs/${programId}/contents/${programContentId}?exerciseId=${record.id}`,
              '_blank',
            ),
        })}
        rowClassName="cursor-pointer"
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
            ...getColumnSearchProps('member'),
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
