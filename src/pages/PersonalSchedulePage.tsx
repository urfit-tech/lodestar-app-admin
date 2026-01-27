import { PlusOutlined } from '@ant-design/icons'
import { Button, message } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useCallback, useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { AdminPageTitle } from '../components/admin'
import AdminLayout from '../components/layout/AdminLayout'
import { scheduleMessages, ScheduleTable, StudentSelectionModal } from '../components/schedule'
import { deleteEvent } from '../helpers/eventHelper/eventFetchers'
import { CalendarCheckFillIcon } from '../images/icon'
import { ScheduleEvent } from '../types/schedule'

import type { MemberForSchedule } from '../hooks/schedule'

const PageWrapper = styled.div`
  padding: 16px 0;
`

const AdminPageTitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`

const PersonalSchedulePage: React.FC = () => {
  const { authToken } = useAuth()
  const { formatMessage } = useIntl()
  const history = useHistory()

  const [studentSelectionModalVisible, setStudentSelectionModalVisible] = useState(false)

  const handleOpenStudentSelection = useCallback(() => {
    setStudentSelectionModalVisible(true)
  }, [])

  const handleStudentSelect = useCallback(
    (student: MemberForSchedule) => {
      setStudentSelectionModalVisible(false)
      history.push(`/class-schedule/personal/${student.id}`)
    },
    [history],
  )

  const handleEdit = useCallback(
    (event: ScheduleEvent) => {
      if (event.status !== 'pending') {
        message.info('已預排/已發布的課程暫不支援編輯')
        return
      }
      // Navigate to edit page with member ID
      if (event.studentId) {
        history.push(`/class-schedule/personal/${event.studentId}`)
      }
    },
    [history],
  )

  const handleDelete = useCallback(
    async (event: ScheduleEvent) => {
      try {
        // Delete event via API (ScheduleTable will refetch events automatically)
        if (event.apiEventId && authToken) {
          await deleteEvent(authToken)(new Date())(event.apiEventId)
        }
        message.success('課程已刪除')
      } catch (error) {
        console.error('Failed to delete event:', error)
        message.error('刪除失敗，請稍後再試')
        throw error
      }
    },
    [authToken],
  )

  return (
    <AdminLayout>
      <AdminPageTitle>
        <AdminPageTitleWrapper>
          <CalendarCheckFillIcon />
          <span>{formatMessage(scheduleMessages['*'].personal)}</span>
        </AdminPageTitleWrapper>

        <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenStudentSelection} disabled={!authToken}>
          新增排課
        </Button>
      </AdminPageTitle>

      <PageWrapper>
        <ScheduleTable scheduleType="personal" onEdit={handleEdit} onDelete={handleDelete} />
      </PageWrapper>

      <StudentSelectionModal
        visible={studentSelectionModalVisible}
        onSelect={handleStudentSelect}
        onCancel={() => setStudentSelectionModalVisible(false)}
      />
    </AdminLayout>
  )
}

export default PersonalSchedulePage
