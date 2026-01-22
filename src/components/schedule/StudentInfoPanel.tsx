import { Empty, Typography } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { Student } from '../../types/schedule'
import { ScheduleCard } from './styles'
import scheduleMessages from './translation'

const { Text } = Typography

const InfoItem = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`

const Label = styled(Text)`
  display: block;
  color: #8c8c8c;
  font-size: 13px;
  margin-bottom: 4px;
`

const Value = styled(Text)`
  display: block;
  font-size: 15px;
  color: #262626;
  white-space: pre-wrap;
`

interface StudentInfoPanelProps {
  student?: Student
}

const StudentInfoPanel: React.FC<StudentInfoPanelProps> = ({ student }) => {
  const { formatMessage } = useIntl()

  if (!student) {
    return (
      <ScheduleCard title={formatMessage(scheduleMessages.StudentInfo.title)} size="small">
        <Empty description={formatMessage(scheduleMessages.StudentInfo.selectStudent)} />
      </ScheduleCard>
    )
  }

  return (
    <ScheduleCard title={formatMessage(scheduleMessages.StudentInfo.title)} size="small">
      <InfoItem>
        <Label>{formatMessage(scheduleMessages.StudentInfo.studentName)}</Label>
        <Value strong>{student.name || '-'}</Value>
      </InfoItem>

      <InfoItem>
        <Label>{formatMessage(scheduleMessages.StudentInfo.studentEmail)}</Label>
        <Value strong>{student.email || '-'}</Value>
      </InfoItem>

      <InfoItem>
        <Label>{formatMessage(scheduleMessages.StudentInfo.internalNote)}</Label>
        <Value strong>{student.internalNote || '-'}</Value>
      </InfoItem>

      <InfoItem>
        <Label>{formatMessage(scheduleMessages.StudentInfo.preferredTeachers)}</Label>
        <Value strong>
          {student.preferredTeachers || '-'}
        </Value>
      </InfoItem>

      <InfoItem>
        <Label>{formatMessage(scheduleMessages.StudentInfo.excludedTeachers)}</Label>
        <Value strong>
          {student.excludedTeachers || '-'}
        </Value>
      </InfoItem>
    </ScheduleCard>
  )
}

export default StudentInfoPanel
