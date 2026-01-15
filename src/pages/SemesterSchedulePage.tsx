import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, message, Modal, Space, Table, Tag, Typography } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import React, { useCallback, useMemo } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { AdminPageTitle } from '../components/admin'
import AdminLayout from '../components/layout/AdminLayout'
import { scheduleMessages } from '../components/schedule'
import { useClassGroups, useDeleteClassGroup, usePermissionGroupsAsCampuses } from '../hooks/scheduleManagement'
import { CalendarCheckFillIcon } from '../images/icon'
import { ClassGroup } from '../types/schedule'

const PageWrapper = styled.div`
  padding: 16px 0;
`

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  flex-wrap: wrap;
  gap: 8px;
`

const TableWrapper = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
`

const STATUS_COLORS: Record<string, string> = {
  draft: 'default',
  scheduled: 'processing',
  published: 'success',
  archived: 'warning',
}

const STATUS_LABELS: Record<string, string> = {
  draft: '草稿',
  scheduled: '已排課',
  published: '已發布',
  archived: '已封存',
}

const SemesterSchedulePage: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()

  // Fetch class groups from GraphQL
  const { classGroups, loading, refetch } = useClassGroups('semester')
  const { deleteClassGroup } = useDeleteClassGroup()
  const { campuses } = usePermissionGroupsAsCampuses()

  // Create campus lookup map
  const campusMap = useMemo(() => {
    const map = new Map<string, string>()
    campuses.forEach(c => map.set(c.id, c.name))
    return map
  }, [campuses])

  const handleCreate = useCallback(() => {
    history.push('/class-schedule/semester/create')
  }, [history])

  const handleEdit = useCallback(
    (classGroup: ClassGroup) => {
      history.push(`/class-schedule/semester/${classGroup.id}`)
    },
    [history],
  )

  const handleDelete = useCallback(
    (classGroup: ClassGroup) => {
      Modal.confirm({
        title: '確認刪除',
        content: `確定要刪除班級「${classGroup.name}」嗎？此操作無法復原。`,
        okText: '刪除',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          try {
            await deleteClassGroup(classGroup.id)
            message.success('班級已刪除')
            refetch()
          } catch (error) {
            console.error('Failed to delete class group:', error)
            message.error('刪除失敗')
          }
        },
      })
    },
    [deleteClassGroup, refetch],
  )

  const columns: ColumnsType<ClassGroup> = [
    {
      title: '班級名稱',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ClassGroup) => <a onClick={() => handleEdit(record)}>{name}</a>,
    },
    {
      title: '校區',
      dataIndex: 'campusId',
      key: 'campusId',
      render: (campusId: string | null) => (campusId ? campusMap.get(campusId) || campusId : '-'),
    },
    {
      title: '語言',
      dataIndex: 'language',
      key: 'language',
    },
    {
      title: '人數限制',
      key: 'students',
      render: (_: any, record: ClassGroup) => `${record.minStudents} - ${record.maxStudents} 人`,
    },
    {
      title: '狀態',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={STATUS_COLORS[status] || 'default'}>{STATUS_LABELS[status] || status}</Tag>
      ),
    },
    {
      title: '建立時間',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => new Date(date).toLocaleDateString('zh-TW'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 120,
      render: (_: any, record: ClassGroup) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)} />
        </Space>
      ),
    },
  ]

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <CalendarCheckFillIcon className="mr-3" />
        <span>{formatMessage(scheduleMessages['*'].semester)}</span>
      </AdminPageTitle>

      <PageWrapper>
        <ActionBar>
          <Typography.Title level={5} style={{ margin: 0 }}>
            {formatMessage(scheduleMessages['*'].semester)}
          </Typography.Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            {formatMessage(scheduleMessages.SemesterClass.addSchedule)}
          </Button>
        </ActionBar>

        <TableWrapper>
          <Table
            columns={columns}
            dataSource={classGroups}
            rowKey="id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showTotal: total => `共 ${total} 個班級`,
            }}
          />
        </TableWrapper>
      </PageWrapper>
    </AdminLayout>
  )
}

export default SemesterSchedulePage
