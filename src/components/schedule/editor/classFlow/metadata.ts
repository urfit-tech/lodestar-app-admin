import { ClassScheduleEventMetadata, Language, ScheduleEvent } from '../../../../types/schedule'

interface BuildClassMetadataOptions {
  classTitle?: string
  studentIds: string[]
  orderIds: string[]
  publishedStudentIds?: string[]
  preScheduledStudentIds?: string[]
  scheduleType: 'semester' | 'group'
  classId: string
  campus: string
  language: Language | string
  teacherId?: string
  classroomId?: string
  classroomIds?: string[]
  isExternal?: boolean
  duration?: number
  material?: string
  needsOnlineRoom?: boolean
  clientEventId?: string
  createdBy?: string
  createdByEmail?: string
  createdByName?: string
  updatedBy?: string
  updatedByEmail?: string
  updatedByName?: string
}

export const buildClassMetadata = (options: BuildClassMetadataOptions): ClassScheduleEventMetadata => {
  const classroomIds = Array.from(new Set((options.classroomIds || []).filter(Boolean)))
  const classroomId = options.classroomId || classroomIds[0]
  const publishedStudentIds = Array.from(new Set((options.publishedStudentIds || []).filter(Boolean)))
  const preScheduledStudentIds = Array.from(new Set((options.preScheduledStudentIds || []).filter(Boolean)))

  return {
    title: options.classTitle,
    scheduleType: options.scheduleType,
    classId: options.classId,
    studentIds: Array.from(new Set(options.studentIds.filter(Boolean))),
    orderIds: Array.from(new Set(options.orderIds.filter(Boolean))),
    publishedStudentIds,
    preScheduledStudentIds,
    teacherId: options.teacherId,
    classroomId,
    classroomIds,
    classMode: options.isExternal ? '外課' : '一般',
    is_external: Boolean(options.isExternal),
    duration: options.duration,
    material: options.material,
    needsOnlineRoom: options.needsOnlineRoom,
    campus: options.campus,
    language: options.language,
    clientEventId: options.clientEventId,
    createdBy: options.createdBy,
    createdByEmail: options.createdByEmail,
    createdByName: options.createdByName,
    updatedBy: options.updatedBy,
    updatedByEmail: options.updatedByEmail,
    updatedByName: options.updatedByName,
  }
}

export const isClassMetadata = (metadata: unknown): metadata is ClassScheduleEventMetadata => {
  if (!metadata || typeof metadata !== 'object') return false
  const data = metadata as Record<string, unknown>

  return (
    (data.scheduleType === 'group' || data.scheduleType === 'semester') &&
    typeof data.classId === 'string' &&
    Array.isArray(data.studentIds) &&
    Array.isArray(data.orderIds) &&
    Array.isArray(data.publishedStudentIds) &&
    Array.isArray(data.preScheduledStudentIds)
  )
}

export const assertClassMetadata = (metadata: unknown): ClassScheduleEventMetadata => {
  if (!isClassMetadata(metadata)) {
    throw new Error('INVALID_CLASS_SCHEDULE_METADATA')
  }
  return metadata
}

export const parseClassMetadata = (metadata: unknown): ClassScheduleEventMetadata | null => {
  if (!isClassMetadata(metadata)) {
    return null
  }

  const normalized: ClassScheduleEventMetadata = {
    ...metadata,
    studentIds: Array.from(new Set((metadata.studentIds || []).filter(Boolean))),
    orderIds: Array.from(new Set((metadata.orderIds || []).filter(Boolean))),
    publishedStudentIds: Array.from(new Set((metadata.publishedStudentIds || []).filter(Boolean))),
    preScheduledStudentIds: Array.from(new Set((metadata.preScheduledStudentIds || []).filter(Boolean))),
    classroomIds: Array.from(new Set((metadata.classroomIds || []).filter(Boolean))),
  }

  if (!normalized.classroomId && normalized.classroomIds && normalized.classroomIds.length > 0) {
    normalized.classroomId = normalized.classroomIds[0]
  }

  return normalized
}

export const getEventKey = (event: Pick<ScheduleEvent, 'id' | 'apiEventId'>) => event.apiEventId || event.id
