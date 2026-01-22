import { SearchOutlined } from '@ant-design/icons'
import { Input, Modal, Spin, Table } from 'antd'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { useMembersForSchedule } from '../../hooks/schedule'
import scheduleMessages from './translation'


import type { ColumnsType } from 'antd/lib/table'
import type { MemberForSchedule } from '../../hooks/schedule'


const SearchWrapper = styled.div`
  margin-bottom: 16px;
`

interface StudentSelectionModalProps {
  visible: boolean
  onSelect: (student: MemberForSchedule) => void
  onCancel: () => void
}

const StudentSelectionModal: React.FC<StudentSelectionModalProps> = ({ visible, onSelect, onCancel }) => {
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
  const { members, loading } = useMembersForSchedule(debouncedSearch || undefined)

  const columns: ColumnsType<MemberForSchedule> = [
    {
      title: formatMessage(scheduleMessages.StudentInfo.studentName),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
  ]

  const handleRowClick = (record: MemberForSchedule) => {
    onSelect(record)
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
