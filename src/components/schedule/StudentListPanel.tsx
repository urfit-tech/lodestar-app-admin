import { DeleteOutlined, ExclamationCircleFilled, PlusOutlined } from '@ant-design/icons'
import { Button, Empty, Input, message, Popconfirm, Space, Spin, Table, Typography } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import dayjs from 'dayjs'
import React, { useCallback, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { useOrdersByIds, useRemoveOrderFromClassGroup } from '../../hooks/scheduleManagement'
import { ScheduleEvent, ScheduleType } from '../../types/schedule'
import AddOrdersToClassModal from './AddOrdersToClassModal'
import { ScheduleCard } from './styles'
import scheduleMessages from './translation'
import { matchesScheduleOrderProductName } from './utils/orderNameFilter'

const { Search } = Input

interface StudentOrderRow {
  id: string
  orderId: string
  memberId: string
  name: string
  email: string
  pictureUrl: string | null
  productName: string
  status: string
  language?: string
  createdAt?: string
  lastClassDate?: Date
  availableMinutes?: number
  expiresAt?: Date | null
  campusId?: string | null
}

interface StudentListPanelProps {
  /** Order IDs from class_group_order */
  orderIds?: string[]
  /** Legacy prop - member IDs (deprecated, use orderIds instead) */
  studentIds?: string[]
  /** Class group ID for adding orders */
  classGroupId?: string
  /** Schedule type for filtering available orders */
  scheduleType?: ScheduleType
  /** Language for filtering available orders */
  language?: string
  /** Campus ID for filtering orders */
  campusId?: string | null
  /** Max students limit */
  maxStudents?: number
  /** Optional schedule events to compute last class date */
  events?: ScheduleEvent[]
  /** Expiry date computed per order (e.g. from schedule expiry settings) */
  expiryDateByOrderId?: Record<string, Date | null>
  /** Callback when orders are added/removed */
  onOrdersChanged?: () => void
}

const StudentListPanel: React.FC<StudentListPanelProps> = ({
  orderIds = [],
  studentIds = [],
  classGroupId,
  scheduleType = 'semester',
  language = '',
  campusId,
  maxStudents,
  events = [],
  expiryDateByOrderId = {},
  onOrdersChanged,
}) => {
  const { formatMessage } = useIntl()
  const [searchText, setSearchText] = useState('')
  const [addModalVisible, setAddModalVisible] = useState(false)

  // Fetch order data including member info from GraphQL
  const { orders: orderLogs, loading, refetch } = useOrdersByIds(orderIds)
  const { removeOrderFromClassGroup, loading: removeLoading } = useRemoveOrderFromClassGroup()

  const scheduledEvents = useMemo(() => events.filter(event => event.status !== 'pending'), [events])

  const lastClassDateByOrderId = useMemo(() => {
    const map: Record<string, Date> = {}
    scheduledEvents.forEach(event => {
      event.orderIds?.forEach(orderId => {
        const current = map[orderId]
        if (!current || event.date > current) {
          map[orderId] = event.date
        }
      })
    })
    return map
  }, [scheduledEvents])

  const hasScheduledEventByOrderId = useMemo(() => {
    const map: Record<string, boolean> = {}
    scheduledEvents.forEach(event => {
      event.orderIds?.forEach(orderId => {
        map[orderId] = true
      })
    })
    return map
  }, [scheduledEvents])

  // Handle remove student
  const handleRemoveStudent = useCallback(
    async (orderId: string) => {
      if (!classGroupId) return
      const success = await removeOrderFromClassGroup(classGroupId, orderId)
      if (success) {
        message.success('已移除學生')
        refetch()
        onOrdersChanged?.()
      } else {
        message.error('移除失敗')
      }
    },
    [classGroupId, removeOrderFromClassGroup, refetch, onOrdersChanged],
  )

  const students = useMemo((): StudentOrderRow[] => {
    const classTypeLabel = scheduleType === 'semester' ? '團體班' : '小組班'
    const now = new Date()

    return orderLogs
      .map(order => {
        const orderOptions = order.options as any
        const classProduct = order.order_products?.find((product: any) => {
          const options = product.options?.options
          if (!options) return false
          if (options.product === '教材') return false
          if (options.class_type !== classTypeLabel) return false
          if (language && options.language && options.language !== language) return false
          const productName = options.title || product.name
          if (!matchesScheduleOrderProductName({ productName, scheduleType, language })) return false
          return true
        })

        if (!classProduct) return null

        const productOptions = classProduct.options as any
        const productMeta = productOptions?.options || {}
        const totalSessions =
          productMeta?.total_sessions?.max || productOptions?.total_sessions?.max || productOptions?.quantity || 0
        const totalMinutes = totalSessions * 50
        const orderExpiredAt = order.expired_at ? new Date(order.expired_at) : null
        const computedExpiry = expiryDateByOrderId[order.id]
        const hasScheduledEvent = Boolean(hasScheduledEventByOrderId[order.id])
        const productEndedAt = classProduct.ended_at ? new Date(classProduct.ended_at) : null
        const expiresAt = hasScheduledEvent ? computedExpiry || productEndedAt : null
        const campusFromOptions =
          orderOptions?.campus_id || orderOptions?.campusId || productMeta?.campus_id || productMeta?.campusId || null

        if ((order.status || '').includes('EXPIRED')) {
          return null
        }

        if (orderExpiredAt && orderExpiredAt < now) {
          return null
        }

        if (expiresAt && new Date(expiresAt) < now) {
          return null
        }

        if (campusId && campusFromOptions && campusFromOptions !== campusId) {
          return null
        }

        return {
          id: order.member?.id || order.member_id,
          orderId: order.id,
          memberId: order.member_id,
          name: order.member?.name || '',
          email: order.member?.email || '',
          pictureUrl: order.member?.picture_url || null,
          productName: productMeta?.title || classProduct.name || '',
          status: order.status,
          language: productMeta?.language || '',
          createdAt: order.created_at,
          lastClassDate: lastClassDateByOrderId[order.id],
          availableMinutes: totalMinutes,
          expiresAt,
          campusId: campusFromOptions,
        } as StudentOrderRow
      })
      .filter(Boolean) as StudentOrderRow[]
  }, [
    orderLogs,
    scheduleType,
    language,
    campusId,
    expiryDateByOrderId,
    lastClassDateByOrderId,
    hasScheduledEventByOrderId,
  ])

  // Apply search filter
  const filteredStudents = useMemo(() => {
    if (!searchText) return students

    const search = searchText.toLowerCase()
    return students.filter(
      s =>
        s.name.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search) ||
        s.productName.toLowerCase().includes(search),
    )
  }, [students, searchText])

  const uniqueStudentCount = useMemo(() => {
    return new Set(students.map(s => s.memberId)).size
  }, [students])

  const isFull = useMemo(() => {
    if (!maxStudents || maxStudents <= 0) return false
    return uniqueStudentCount >= maxStudents
  }, [uniqueStudentCount, maxStudents])

  const isGroup = scheduleType === 'group'
  const groupEmailColumns: ColumnsType<StudentOrderRow> = isGroup
    ? [
        {
          title: formatMessage(scheduleMessages.StudentList.email),
          key: 'email',
          dataIndex: 'email',
          width: 180,
          ellipsis: true,
          render: (email: string) => (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {email || '-'}
            </Typography.Text>
          ),
        },
      ]
    : []

  const groupDetailColumns: ColumnsType<StudentOrderRow> = isGroup
    ? [
        {
          title: formatMessage(scheduleMessages.StudentList.lastClassDate),
          key: 'lastClassDate',
          dataIndex: 'lastClassDate',
          width: 120,
          sorter: (a: StudentOrderRow, b: StudentOrderRow) =>
            (a.lastClassDate?.getTime() || 0) - (b.lastClassDate?.getTime() || 0),
          defaultSortOrder: 'descend' as const,
          render: (date: Date | undefined) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
        },
        {
          title: formatMessage(scheduleMessages.StudentList.availableMinutes),
          key: 'availableMinutes',
          dataIndex: 'availableMinutes',
          width: 120,
          render: (minutes: number | undefined) => (minutes ? `${minutes}` : '-'),
        },
        {
          title: formatMessage(scheduleMessages.StudentList.expiresAt),
          key: 'expiresAt',
          dataIndex: 'expiresAt',
          width: 120,
          sorter: (a: StudentOrderRow, b: StudentOrderRow) =>
            (a.expiresAt?.getTime() || 0) - (b.expiresAt?.getTime() || 0),
          render: (date: Date | null | undefined) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
        },
      ]
    : []

  const actionColumns: ColumnsType<StudentOrderRow> = classGroupId
    ? [
        {
          title: '',
          key: 'action',
          width: 50,
          render: (_: any, record: StudentOrderRow) => (
            <Popconfirm
              title="確定要移除嗎？"
              onConfirm={() => handleRemoveStudent(record.orderId)}
              okText="確定"
              cancelText="取消"
              overlayInnerStyle={{ padding: 8 }}
              overlayStyle={{ padding: 8 }}
            >
              <Button type="text" size="small" danger icon={<DeleteOutlined />} loading={removeLoading} />
            </Popconfirm>
          ),
        },
      ]
    : []

  const columns: ColumnsType<StudentOrderRow> = [
    {
      title: formatMessage(scheduleMessages.StudentList.name),
      key: 'name',
      width: 140,
      render: (_, record) => (
        <div>
          <div>
            {record.status !== 'SUCCESS' && <ExclamationCircleFilled style={{ color: '#ff4d4f', marginRight: 4 }} />}
            {record.name || '(未設定姓名)'}
          </div>
          {!isGroup && (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Typography.Text>
          )}
        </div>
      ),
    },
    ...groupEmailColumns,
    {
      title: formatMessage(scheduleMessages.StudentList.productName),
      key: 'productName',
      dataIndex: 'productName',
      ellipsis: true,
    },
    ...groupDetailColumns,
    ...actionColumns,
  ]

  const handleOrdersAdded = () => {
    refetch()
    onOrdersChanged?.()
  }

  const cardTitle = (
    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
      <span>{formatMessage(scheduleMessages.StudentList.title)}</span>
      {classGroupId && (
        <Button
          type="link"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => setAddModalVisible(true)}
          disabled={isFull}
        >
          新增
        </Button>
      )}
    </Space>
  )

  if (loading) {
    return (
      <ScheduleCard size="small" title={cardTitle}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
          <Spin />
        </div>
      </ScheduleCard>
    )
  }

  return (
    <>
      <ScheduleCard size="small" title={cardTitle}>
        <div style={{ marginBottom: 12 }}>
          <Search
            placeholder={formatMessage(scheduleMessages['*'].search)}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: '100%' }}
            allowClear
          />
        </div>

        {filteredStudents.length === 0 ? (
          <Empty
            description={
              <Typography.Text type="secondary">
                {formatMessage(scheduleMessages.StudentList.noStudents)}
              </Typography.Text>
            }
            style={{ marginTop: '20%' }}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredStudents}
            rowKey="orderId"
            size="small"
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
              showTotal: total => `共 ${total} 筆`,
            }}
          />
        )}
      </ScheduleCard>

      {classGroupId && (
        <AddOrdersToClassModal
          visible={addModalVisible}
          classGroupId={classGroupId}
          scheduleType={scheduleType}
          language={language}
          existingOrderIds={orderIds}
          campusId={campusId ?? undefined}
          onClose={() => setAddModalVisible(false)}
          onOrdersAdded={handleOrdersAdded}
        />
      )}
    </>
  )
}

export default StudentListPanel
