import { SearchOutlined } from '@ant-design/icons'
import { Input, Modal, Spin, Table, Typography } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { useMembers } from '../../hooks/scheduleManagement'
import { ScheduleType, Student } from '../../types/schedule'
import scheduleMessages from './translation'

const SearchWrapper = styled.div`
  margin-bottom: 16px;
`

interface MemberData {
  id: string
  name: string
  email: string
}

interface StudentSelectionModalProps {
  visible: boolean
  scheduleType: ScheduleType
  onSelect: (student: Student) => void
  onCancel: () => void
}

const StudentSelectionModal: React.FC<StudentSelectionModalProps> = ({ visible, scheduleType, onSelect, onCancel }) => {
  const { formatMessage } = useIntl()
  const [searchText, setSearchText] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchText])

  // Fetch members from GraphQL (only when search term is provided)
  const { members, loading } = useMembers(debouncedSearch || undefined)

  const columns: ColumnsType<MemberData> = [
    {
      title: formatMessage(scheduleMessages.StudentInfo.studentName),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record) => (
        <div>
          <div>{name || '(未設定姓名)'}</div>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {record.email}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['md'],
    },
  ]

  const handleRowClick = (record: MemberData) => {
    // Convert MemberData to Student format
    const student: Student = {
      id: record.id,
      name: record.name || '',
      email: record.email,
      campus: '', // Will be determined later or from user profile
    }
    onSelect(student)
    setSearchText('')
  }

  const handleCancel = () => {
    onCancel()
    setSearchText('')
  }

  return (
    <Modal title="選擇學生" visible={visible} onCancel={handleCancel} footer={null} width={600}>
      <SearchWrapper>
        <Input
          placeholder="搜尋學生姓名或 Email"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          allowClear
        />
      </SearchWrapper>

      <Spin spinning={loading}>
        <Table
          dataSource={members}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          onRow={record => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
          })}
          locale={{
            emptyText: searchText ? '找不到符合條件的學生' : '請輸入姓名或 Email 搜尋',
          }}
        />
      </Spin>
    </Modal>
  )
}

export default StudentSelectionModal
