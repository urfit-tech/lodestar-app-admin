export type ScheduleType = 'personal' | 'semester' | 'group'

export type ScheduleStatus = 'pending' | 'pre-scheduled' | 'published'

export interface ClassScheduleEventMetadata {
  title?: string
  scheduleType: 'semester' | 'group'
  classId: string
  studentIds: string[]
  orderIds: string[]
  publishedStudentIds: string[]
  preScheduledStudentIds: string[]
  teacherId?: string
  classroomId?: string
  classroomIds?: string[]
  classMode?: '一般' | '外課'
  is_external?: boolean
  duration?: number
  material?: string
  needsOnlineRoom?: boolean
  campus?: string
  language?: Language | string
  clientEventId?: string
  createdBy?: string
  createdByEmail?: string
  createdByName?: string
  updatedBy?: string
  updatedByEmail?: string
  updatedByName?: string
}

export type Language = '中文' | '德文' | '日文' | '法文' | '英文' | '西文' | '韓文' | '台語' | '粵語'

export interface Campus {
  id: string
  name: string
}

export interface Teacher {
  id: string
  name: string
  email: string
  campus: string // 主要校區名稱（向後相容）
  campusId?: string // 主要校區 ID
  campusIds: string[] // 所有校區 ID（支援多校區）
  campusNames: string[] // 所有校區名稱（支援多校區）
  languages: Language[]
  teachingLanguages: string[]
  traits: string[]
  level: string // from member_property (等級)
  yearsOfExperience: number
  note?: string
  availableSlots?: TimeSlot[]
}

export interface Student {
  id: string
  name: string
  email: string
  internalNote?: string
  preferredTeachers?: string
  excludedTeachers?: string
}

export interface Order {
  id: string
  studentId: string
  productName: string
  language: string // 原始語言值，如 '中文'、'英文'，用於篩選教師
  type: ScheduleType
  totalMinutes: number
  usedMinutes: number
  availableMinutes: number
  createdAt: Date
  expiresAt?: Date // 課時到期日：開課日 + 有效月數，初始無值，預排/發布後才有值
  lastClassDate?: Date
  status: string // order_log status: 'SUCCESS', 'UNPAID', etc.
  materials: string[] // 教材列表：從同一訂單的 order_products 中 options.options.product === '教材' 的項目取得 title
}

export interface Classroom {
  id: string
  name: string
  campus: string // 向後相容
  campusId?: string // 校區 ID（關聯到 permission_group）
  campusName?: string // 校區名稱
  capacity: number
  systemName?: string // 系統欄位名稱
}

export interface TimeSlot {
  start: Date
  end: Date
}

export interface ScheduleEvent {
  id: string
  apiEventId?: string // API event ID after pre-schedule
  scheduleType: ScheduleType
  status: ScheduleStatus
  classId?: string // For semester/group classes
  studentId?: string // For personal classes
  studentIds?: string[] // For semester/group classes
  orderIds: string[]
  teacherId?: string
  classroomId?: string
  classroomIds?: string[]
  campus: string
  language: Language
  date: Date
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  duration: number // in minutes
  material?: string
  needsOnlineRoom: boolean
  onlineRoomUrl?: string
  createdBy: string
  createdByEmail: string
  updatedBy?: string
  updatedByEmail?: string
  updatedAt: Date
  isExternal?: boolean // External class marked with '外'
}

export interface ClassGroup {
  id: string
  appId: string
  name: string
  type: 'semester' | 'group'
  campusId: string | null // 關聯到 permission_group
  language: Language
  minStudents: number // 成班人數
  maxStudents: number // 滿班人數
  materials: string[]
  status: 'draft' | 'scheduled' | 'published' | 'archived'
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
  // 關聯資料 (從 class_group_order 取得)
  orderIds?: string[]
}

export interface ScheduleTemplate {
  id: string
  studentId: string
  language: Language
  weekday: number
  startTime: string
  duration: number
  teacherId?: string
  classroomId?: string
  material?: string
  needsOnlineRoom: boolean
}

// Template types for multi-row templates bound to editor (member_id)
export interface CourseRowData {
  weekday: number // 1-7
  duration: number // minutes
  startTime: string // 'HH:mm'
  material: string
  materialType: 'order' | 'undecided' | 'custom'
  customMaterial: string
  teacherId?: string
  classroomIds: string[]
  needsOnlineRoom: boolean
}

export interface ScheduleTemplateProps {
  id: string
  appId: string
  memberId: string // Editor who created the template
  name: string
  language: Language
  rrule?: string // Recurrence rule
  courseRows: CourseRowData[]
  createdAt: Date
  updatedAt: Date
}

export interface Holiday {
  id: string
  date: Date
  name: string
  isFixed: boolean
}

export interface ScheduleCondition {
  startDate: Date
  endDate?: Date
  totalMinutes?: number
  excludedDates: Date[]
  excludeHolidays: boolean
}

// Color schemes from PRD
export const SCHEDULE_COLORS = {
  personal: {
    studentOpen: '#fed7aa',
    template: '#a8a29e',
    preScheduled: '#fdba74',
    published: '#f97316',
    pending: '#64748B',
  },
  semester: {
    pending: '#64748B',
    preScheduled: '#14B8A6',
    published: '#0F766E',
  },
  group: {
    pending: '#64748B',
    preScheduled: '#fcd34d',
    published: '#eab308',
  },
  teacher: {
    teacher1: { light: '#bfdbfe', medium: '#93c5fd', dark: '#3b82f6' },
    teacher2: { light: '#fbcfe8', medium: '#f9a8d4', dark: '#ec4899' },
    teacher3: { light: '#e9d5ff', medium: '#d8b4fe', dark: '#a855f7' },
  },
  today: '#3B82F6',
}

export const DURATION_OPTIONS = [30, 50, 60, 75, 90, 100, 120, 150, 170, 180]

export const DEFAULT_DURATION = 50

// Helper functions
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

export const getStatusColor = (type: ScheduleType, status: ScheduleStatus): string => {
  const colors = SCHEDULE_COLORS[type]
  switch (status) {
    case 'pending':
      return colors.pending
    case 'pre-scheduled':
      return colors.preScheduled
    case 'published':
      return colors.published
    default:
      return colors.pending
  }
}
