import { ScheduleEvent, SCHEDULE_COLORS, Teacher } from '../../../types/schedule'

export type TeacherLayerStatus = 'open' | 'scheduled' | 'published'
export type StudentLayerStatus = 'open' | 'template' | 'scheduled' | 'published'

export type TeacherStatusVisibility = Record<TeacherLayerStatus, boolean>
export type StudentStatusVisibility = Record<StudentLayerStatus, boolean>

const TEACHER_COLOR_KEYS = ['teacher1', 'teacher2', 'teacher3'] as const

const resolveTeacherColorSet = (selectedTeachers: Teacher[], teacherId?: string) => {
  if (!teacherId) return null
  const index = selectedTeachers.findIndex(teacher => teacher.id === teacherId)
  if (index < 0 || index >= TEACHER_COLOR_KEYS.length) return null
  return SCHEDULE_COLORS.teacher[TEACHER_COLOR_KEYS[index]]
}

export const resolveTeacherLayerColor = (
  selectedTeachers: Teacher[],
  teacherId: string | undefined,
  status: TeacherLayerStatus,
): string => {
  const colorSet = resolveTeacherColorSet(selectedTeachers, teacherId)
  if (!colorSet) return SCHEDULE_COLORS.personal.pending
  if (status === 'published') return colorSet.dark
  if (status === 'scheduled') return colorSet.medium
  return colorSet.light
}

export const buildScheduleEventIdSet = (events: Array<Pick<ScheduleEvent, 'id' | 'apiEventId'>>) => {
  const idSet = new Set<string>()
  events.forEach(event => {
    if (event.id) idSet.add(event.id)
    if (event.apiEventId) idSet.add(event.apiEventId)
  })
  return idSet
}

export const shouldShowTeacherLayerEvent = (
  event: {
    teacherId?: string
    status: TeacherLayerStatus
    originalEventId?: string
  },
  visibleTeacherIds: Set<string>,
  statusVisibility: TeacherStatusVisibility,
  scheduleEventIdSet: Set<string>,
): boolean => {
  if (!event.teacherId || !visibleTeacherIds.has(event.teacherId)) return false
  if (!statusVisibility[event.status]) return false
  if (event.originalEventId && scheduleEventIdSet.has(event.originalEventId)) return false
  return true
}

export const shouldShowStudentLayerEvent = (
  status: StudentLayerStatus,
  statusVisibility: StudentStatusVisibility,
  templateFeatureEnabled: boolean,
): boolean => {
  if (status === 'template' && !templateFeatureEnabled) return false
  return statusVisibility[status]
}
