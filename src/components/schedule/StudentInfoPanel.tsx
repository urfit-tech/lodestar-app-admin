import { Card, Descriptions, Empty, Tag, Typography } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { scheduleStore, Student } from '../../types/schedule'
import scheduleMessages from './translation'

const PanelCard = styled(Card)`
  .ant-card-body {
    padding: 16px;
  }
`

const TeacherTag = styled(Tag)<{ $preferred?: boolean }>`
  ${props => props.$preferred && 'background-color: #e6f7ff; border-color: #91d5ff;'}
`

interface StudentInfoPanelProps {
  student?: Student
}

const StudentInfoPanel: React.FC<StudentInfoPanelProps> = ({ student }) => {
  const { formatMessage } = useIntl()
  const teachers = scheduleStore.getTeachers()

  const getTeacherName = (teacherId: string): string => {
    const teacher = teachers.find(t => t.id === teacherId)
    return teacher?.name || teacherId
  }

  if (!student) {
    return (
      <PanelCard title={formatMessage(scheduleMessages.StudentInfo.title)} size="small">
        <Empty description={formatMessage(scheduleMessages.StudentInfo.selectStudent)} />
      </PanelCard>
    )
  }

  return (
    <PanelCard title={formatMessage(scheduleMessages.StudentInfo.title)} size="small">
      <Descriptions column={1} size="small" labelStyle={{ width: 120 }}>
        <Descriptions.Item label={formatMessage(scheduleMessages.StudentInfo.studentName)}>
          <Typography.Text strong>{student.name}</Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label={formatMessage(scheduleMessages.StudentInfo.studentEmail)}>
          {student.email}
        </Descriptions.Item>
        <Descriptions.Item label={formatMessage(scheduleMessages.StudentInfo.internalNote)}>
          <Typography.Text type="secondary">{student.internalNote || '-'}</Typography.Text>
        </Descriptions.Item>
        <Descriptions.Item label={formatMessage(scheduleMessages.StudentInfo.preferredTeachers)}>
          {student.preferredTeachers && student.preferredTeachers.length > 0 ? (
            student.preferredTeachers.map(id => (
              <TeacherTag key={id} $preferred color="blue">
                {getTeacherName(id)}
              </TeacherTag>
            ))
          ) : (
            <Typography.Text type="secondary">-</Typography.Text>
          )}
        </Descriptions.Item>
        <Descriptions.Item label={formatMessage(scheduleMessages.StudentInfo.excludedTeachers)}>
          {student.excludedTeachers && student.excludedTeachers.length > 0 ? (
            student.excludedTeachers.map(id => (
              <Tag key={id} color="red">
                {getTeacherName(id)}
              </Tag>
            ))
          ) : (
            <Typography.Text type="secondary">-</Typography.Text>
          )}
        </Descriptions.Item>
      </Descriptions>
    </PanelCard>
  )
}

export default StudentInfoPanel
