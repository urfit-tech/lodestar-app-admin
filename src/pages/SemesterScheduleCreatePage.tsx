import React from 'react'
import ClassGroupScheduleEditor from '../components/schedule/editor/ClassGroupScheduleEditor'

const SemesterScheduleCreatePage: React.FC = () => {
  return <ClassGroupScheduleEditor scheduleType="semester" mode="create" />
}

export default SemesterScheduleCreatePage
