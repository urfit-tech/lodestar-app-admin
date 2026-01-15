export type ScheduleType = 'personal' | 'semester' | 'group'

export type ScheduleStatus = 'pending' | 'pre-scheduled' | 'published'

export type Language = '中文' | '德文' | '日文' | '法文' | '英文' | '西文' | '韓文' | '台語' | '粵語'

export interface Campus {
  id: string
  name: string
}

export interface Teacher {
  id: string
  name: string
  email: string
  campus: string
  languages: Language[]
  traits: string[]
  level: string
  yearsOfExperience: number
  note?: string
  availableSlots?: TimeSlot[]
}

export interface Student {
  id: string
  name: string
  email: string
  campus: string
  internalNote?: string
  preferredTeachers?: string[]
  excludedTeachers?: string[]
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
  expiresAt?: Date // 課時到期日：開課日 + 有效天數，初始無值，預排/發布後才有值
  lastClassDate?: Date
  status: string // order_log status: 'SUCCESS', 'UNPAID', etc.
  campus: string
  materials: string[] // 教材列表：從同一訂單的 order_products 中 options.options.product === '教材' 的項目取得 title
}

export interface Classroom {
  id: string
  name: string
  campus: string
  capacity: number
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

// ============================================
// Mock Data Store for Schedule Management
// This will be replaced with GraphQL queries/mutations later
// ============================================

// Mock Campuses
export const mockCampuses: Campus[] = [
  { id: 'campus-1', name: '台北校區' },
  { id: 'campus-2', name: '台中校區' },
  { id: 'campus-3', name: '高雄校區' },
]

// Mock Teachers
export const mockTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    name: '王小明',
    email: 'wang@example.com',
    campus: 'campus-1',
    languages: ['中文', '英文'],
    traits: ['耐心', '幽默'],
    level: 'Senior',
    yearsOfExperience: 8,
    note: '擅長初學者教學',
  },
  {
    id: 'teacher-2',
    name: '李美玲',
    email: 'li@example.com',
    campus: 'campus-1',
    languages: ['中文', '日文'],
    traits: ['細心', '專業'],
    level: 'Senior',
    yearsOfExperience: 10,
  },
  {
    id: 'teacher-3',
    name: 'John Smith',
    email: 'john@example.com',
    campus: 'campus-1',
    languages: ['英文'],
    traits: ['活潑', '互動性強'],
    level: 'Mid',
    yearsOfExperience: 5,
  },
  {
    id: 'teacher-4',
    name: '田中太郎',
    email: 'tanaka@example.com',
    campus: 'campus-2',
    languages: ['日文', '英文'],
    traits: ['嚴謹', '系統化'],
    level: 'Senior',
    yearsOfExperience: 12,
  },
  {
    id: 'teacher-5',
    name: '陳志偉',
    email: 'chen@example.com',
    campus: 'campus-2',
    languages: ['中文', '韓文'],
    traits: ['親切', '有耐心'],
    level: 'Junior',
    yearsOfExperience: 2,
  },
]

// Mock Students
export const mockStudents: Student[] = [
  {
    id: 'student-1',
    name: '張小華',
    email: 'zhang@example.com',
    campus: 'campus-1',
    internalNote: '學習進度快，可加快教學速度',
    preferredTeachers: ['teacher-1'],
    excludedTeachers: [],
  },
  {
    id: 'student-2',
    name: '林美麗',
    email: 'lin@example.com',
    campus: 'campus-1',
    internalNote: '需要更多練習時間',
  },
  {
    id: 'student-3',
    name: '陳大明',
    email: 'chendm@example.com',
    campus: 'campus-1',
  },
  {
    id: 'student-4',
    name: '黃志強',
    email: 'huang@example.com',
    campus: 'campus-2',
    preferredTeachers: ['teacher-4'],
  },
  {
    id: 'student-5',
    name: '王美琪',
    email: 'wangmq@example.com',
    campus: 'campus-2',
  },
]

// Mock Orders
const today = new Date()
const futureDate = (days: number) => {
  const date = new Date(today)
  date.setDate(date.getDate() + days)
  return date
}
const pastDate = (days: number) => {
  const date = new Date(today)
  date.setDate(date.getDate() - days)
  return date
}

export const mockOrders: Order[] = [
  {
    id: 'order-1',
    studentId: 'student-1',
    productName: '英文會話 25 堂',
    language: '英文',
    type: 'personal',
    totalMinutes: 1250,
    usedMinutes: 250,
    availableMinutes: 1000,
    createdAt: pastDate(30),
    expiresAt: futureDate(150),
    lastClassDate: pastDate(3),
    status: 'SUCCESS',
    campus: 'campus-1',
    materials: [],
  },
  {
    id: 'order-2',
    studentId: 'student-1',
    productName: '日文入門 15 堂',
    language: '日文',
    type: 'personal',
    totalMinutes: 750,
    usedMinutes: 0,
    availableMinutes: 750,
    createdAt: pastDate(10),
    expiresAt: futureDate(170),
    status: 'SUCCESS',
    campus: 'campus-1',
    materials: [],
  },
  {
    id: 'order-3',
    studentId: 'student-2',
    productName: '中文進階 20 堂',
    language: '中文',
    type: 'personal',
    totalMinutes: 1000,
    usedMinutes: 500,
    availableMinutes: 500,
    createdAt: pastDate(60),
    expiresAt: futureDate(120),
    lastClassDate: pastDate(7),
    status: 'SUCCESS',
    campus: 'campus-1',
    materials: [],
  },
  {
    id: 'order-4',
    studentId: 'student-3',
    productName: '英文商務 10 堂',
    language: '英文',
    type: 'personal',
    totalMinutes: 500,
    usedMinutes: 0,
    availableMinutes: 500,
    createdAt: pastDate(5),
    expiresAt: futureDate(175),
    status: 'UNPAID', // Unpaid order
    campus: 'campus-1',
    materials: [],
  },
  {
    id: 'order-5',
    studentId: 'student-4',
    productName: '日文中級 30 堂',
    language: '日文',
    type: 'personal',
    totalMinutes: 1500,
    usedMinutes: 300,
    availableMinutes: 1200,
    createdAt: pastDate(45),
    expiresAt: futureDate(135),
    lastClassDate: pastDate(2),
    status: 'SUCCESS',
    campus: 'campus-2',
    materials: [],
  },
  // Semester class orders
  {
    id: 'order-6',
    studentId: 'student-1',
    productName: '英文學期班 A',
    language: '英文',
    type: 'semester',
    totalMinutes: 2000,
    usedMinutes: 0,
    availableMinutes: 2000,
    createdAt: pastDate(20),
    expiresAt: futureDate(180),
    status: 'SUCCESS',
    campus: 'campus-1',
    materials: [],
  },
  {
    id: 'order-7',
    studentId: 'student-2',
    productName: '英文學期班 A',
    language: '英文',
    type: 'semester',
    totalMinutes: 2000,
    usedMinutes: 0,
    availableMinutes: 2000,
    createdAt: pastDate(18),
    expiresAt: futureDate(182),
    status: 'SUCCESS',
    campus: 'campus-1',
    materials: [],
  },
  {
    id: 'order-8',
    studentId: 'student-3',
    productName: '英文學期班 A',
    language: '英文',
    type: 'semester',
    totalMinutes: 2000,
    usedMinutes: 0,
    availableMinutes: 2000,
    createdAt: pastDate(15),
    expiresAt: futureDate(185),
    status: 'UNPAID', // Unpaid
    campus: 'campus-1',
    materials: [],
  },
  // Group class orders
  {
    id: 'order-9',
    studentId: 'student-1',
    productName: '日文小組班 B',
    language: '日文',
    type: 'group',
    totalMinutes: 1500,
    usedMinutes: 0,
    availableMinutes: 1500,
    createdAt: pastDate(25),
    expiresAt: futureDate(155),
    status: 'SUCCESS',
    campus: 'campus-1',
    materials: [],
  },
  {
    id: 'order-10',
    studentId: 'student-2',
    productName: '日文小組班 B',
    language: '日文',
    type: 'group',
    totalMinutes: 1500,
    usedMinutes: 0,
    availableMinutes: 1500,
    createdAt: pastDate(22),
    expiresAt: futureDate(158),
    status: 'SUCCESS',
    campus: 'campus-1',
    materials: [],
  },
]

// Mock Classrooms
export const mockClassrooms: Classroom[] = [
  { id: 'room-1', name: '教室 101', campus: 'campus-1', capacity: 10 },
  { id: 'room-2', name: '教室 102', campus: 'campus-1', capacity: 6 },
  { id: 'room-3', name: '教室 103', campus: 'campus-1', capacity: 15 },
  { id: 'room-4', name: '教室 201', campus: 'campus-2', capacity: 8 },
  { id: 'room-5', name: '教室 202', campus: 'campus-2', capacity: 12 },
]

// Mock Class Groups (for semester and group classes)
export const mockClassGroups: ClassGroup[] = [
  {
    id: 'class-1',
    appId: 'mock-app',
    name: '英文學期班 A',
    type: 'semester',
    campusId: 'campus-1',
    language: '英文',
    minStudents: 3,
    maxStudents: 10,
    materials: ['English Textbook Level 3', 'Grammar Workbook'],
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    orderIds: ['order-1', 'order-2', 'order-3'],
  },
  {
    id: 'class-2',
    appId: 'mock-app',
    name: '日文小組班 B',
    type: 'group',
    campusId: 'campus-1',
    language: '日文',
    minStudents: 2,
    maxStudents: 5,
    materials: ['日本語初級 I', '聽力練習本'],
    status: 'draft',
    createdAt: new Date(),
    updatedAt: new Date(),
    orderIds: ['order-1', 'order-2'],
  },
]

// Mock Schedule Events
export const mockScheduleEvents: ScheduleEvent[] = [
  {
    id: 'event-1',
    scheduleType: 'personal',
    status: 'published',
    studentId: 'student-1',
    orderIds: ['order-1'],
    teacherId: 'teacher-3',
    classroomId: 'room-1',
    campus: 'campus-1',
    language: '英文',
    date: pastDate(3),
    startTime: '10:00',
    endTime: '10:50',
    duration: 50,
    material: 'English Textbook Level 3',
    needsOnlineRoom: false,
    createdBy: 'admin-1',
    createdByEmail: 'admin@example.com',
    updatedAt: pastDate(5),
  },
  {
    id: 'event-2',
    scheduleType: 'personal',
    status: 'pre-scheduled',
    studentId: 'student-1',
    orderIds: ['order-1'],
    teacherId: 'teacher-3',
    classroomId: 'room-1',
    campus: 'campus-1',
    language: '英文',
    date: futureDate(4),
    startTime: '10:00',
    endTime: '10:50',
    duration: 50,
    material: 'English Textbook Level 3',
    needsOnlineRoom: true,
    createdBy: 'admin-1',
    createdByEmail: 'admin@example.com',
    updatedAt: today,
  },
  {
    id: 'event-3',
    scheduleType: 'semester',
    status: 'published',
    classId: 'class-1',
    studentIds: ['student-1', 'student-2'],
    orderIds: ['order-6', 'order-7'],
    teacherId: 'teacher-1',
    classroomId: 'room-3',
    campus: 'campus-1',
    language: '英文',
    date: pastDate(7),
    startTime: '14:00',
    endTime: '15:30',
    duration: 90,
    material: 'English Textbook Level 3',
    needsOnlineRoom: false,
    createdBy: 'admin-1',
    createdByEmail: 'admin@example.com',
    updatedAt: pastDate(10),
  },
]

// Mock Holidays
export const mockHolidays: Holiday[] = [
  { id: 'holiday-1', date: new Date('2025-01-01'), name: '元旦', isFixed: true },
  { id: 'holiday-2', date: new Date('2025-01-28'), name: '除夕', isFixed: true },
  { id: 'holiday-3', date: new Date('2025-01-29'), name: '春節', isFixed: true },
  { id: 'holiday-4', date: new Date('2025-01-30'), name: '春節', isFixed: true },
  { id: 'holiday-5', date: new Date('2025-01-31'), name: '春節', isFixed: true },
  { id: 'holiday-6', date: new Date('2025-02-28'), name: '和平紀念日', isFixed: true },
  { id: 'holiday-7', date: new Date('2025-04-04'), name: '清明節', isFixed: true },
  { id: 'holiday-8', date: new Date('2025-05-01'), name: '勞動節', isFixed: true },
  { id: 'holiday-9', date: new Date('2025-06-02'), name: '端午節', isFixed: true },
  { id: 'holiday-10', date: new Date('2025-09-08'), name: '中秋節', isFixed: true },
  { id: 'holiday-11', date: new Date('2025-10-10'), name: '國慶日', isFixed: true },
]

// Mock Templates
export const mockTemplates: ScheduleTemplate[] = []

// In-memory store class
class ScheduleManagementStore {
  private events: ScheduleEvent[] = [...mockScheduleEvents]
  private templates: ScheduleTemplate[] = [...mockTemplates]
  private classGroups: ClassGroup[] = [...mockClassGroups]

  // Events CRUD
  getEvents(type?: ScheduleType, status?: string): ScheduleEvent[] {
    let result = this.events
    if (type) {
      result = result.filter(e => e.scheduleType === type)
    }
    if (status) {
      result = result.filter(e => e.status === status)
    }
    return result
  }

  getEventById(id: string): ScheduleEvent | undefined {
    return this.events.find(e => e.id === id)
  }

  addEvent(event: Omit<ScheduleEvent, 'id'>): ScheduleEvent {
    const newEvent: ScheduleEvent = {
      ...event,
      id: `event-${Date.now()}`,
    }
    this.events.push(newEvent)
    return newEvent
  }

  updateEvent(id: string, updates: Partial<ScheduleEvent>): ScheduleEvent | undefined {
    const index = this.events.findIndex(e => e.id === id)
    if (index !== -1) {
      this.events[index] = { ...this.events[index], ...updates, updatedAt: new Date() }
      return this.events[index]
    }
    return undefined
  }

  deleteEvent(id: string): boolean {
    const index = this.events.findIndex(e => e.id === id)
    if (index !== -1) {
      this.events.splice(index, 1)
      return true
    }
    return false
  }

  // Teachers
  getTeachers(language?: Language, campus?: string): Teacher[] {
    let result = [...mockTeachers]
    if (language) {
      result = result.filter(t => t.languages.includes(language))
    }
    if (campus) {
      result = result.filter(t => t.campus === campus)
    }
    // Sort by same campus priority, then by level, then by experience
    result.sort((a, b) => {
      if (campus) {
        const aMatch = a.campus === campus ? 0 : 1
        const bMatch = b.campus === campus ? 0 : 1
        if (aMatch !== bMatch) return aMatch - bMatch
      }
      const levelOrder = { Senior: 0, Mid: 1, Junior: 2 }
      const levelDiff =
        (levelOrder[a.level as keyof typeof levelOrder] || 2) -
        (levelOrder[b.level as keyof typeof levelOrder] || 2)
      if (levelDiff !== 0) return levelDiff
      return b.yearsOfExperience - a.yearsOfExperience
    })
    return result
  }

  // Students
  getStudents(campus?: string): Student[] {
    if (campus) {
      return mockStudents.filter(s => s.campus === campus)
    }
    return [...mockStudents]
  }

  getStudentById(id: string): Student | undefined {
    return mockStudents.find(s => s.id === id)
  }

  // Orders
  getOrdersByStudent(studentId: string, type?: ScheduleType): Order[] {
    let result = mockOrders.filter(
      o => o.studentId === studentId && o.availableMinutes > 0 && o.expiresAt && o.expiresAt > new Date()
    )
    if (type) {
      result = result.filter(o => o.type === type)
    }
    return result
  }

  getOrdersByType(type: ScheduleType, campus?: string, language?: Language): Order[] {
    let result = mockOrders.filter(
      o => o.type === type && o.availableMinutes > 0 && o.expiresAt && o.expiresAt > new Date()
    )
    if (campus) {
      result = result.filter(o => o.campus === campus)
    }
    if (language) {
      result = result.filter(o => o.language === language)
    }
    return result
  }

  // Class Groups
  getClassGroups(type?: 'semester' | 'group'): ClassGroup[] {
    if (type) {
      return this.classGroups.filter(c => c.type === type)
    }
    return [...this.classGroups]
  }

  getClassGroupById(id: string): ClassGroup | undefined {
    return this.classGroups.find(c => c.id === id)
  }

  updateClassGroup(id: string, updates: Partial<ClassGroup>): ClassGroup | undefined {
    const index = this.classGroups.findIndex(c => c.id === id)
    if (index !== -1) {
      this.classGroups[index] = { ...this.classGroups[index], ...updates }
      return this.classGroups[index]
    }
    return undefined
  }

  addClassGroup(group: Omit<ClassGroup, 'id' | 'createdAt' | 'updatedAt' | 'appId'>): ClassGroup {
    const newGroup: ClassGroup = {
      ...group,
      id: `class-${Date.now()}`,
      appId: 'mock-app',
      status: group.status || 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      orderIds: group.orderIds || [],
    }
    this.classGroups.push(newGroup)
    return newGroup
  }

  // Classrooms
  getClassrooms(campus?: string): Classroom[] {
    if (campus) {
      return mockClassrooms.filter(c => c.campus === campus)
    }
    return [...mockClassrooms]
  }

  // Holidays
  getHolidays(): Holiday[] {
    return [...mockHolidays]
  }

  isHoliday(date: Date): boolean {
    const dateStr = date.toISOString().split('T')[0]
    return mockHolidays.some(h => h.date.toISOString().split('T')[0] === dateStr)
  }

  // Templates
  getTemplate(studentId: string, language: Language): ScheduleTemplate | undefined {
    return this.templates.find(t => t.studentId === studentId && t.language === language)
  }

  saveTemplate(template: Omit<ScheduleTemplate, 'id'>): ScheduleTemplate {
    const existingIndex = this.templates.findIndex(
      t => t.studentId === template.studentId && t.language === template.language
    )
    const newTemplate: ScheduleTemplate = {
      ...template,
      id: existingIndex !== -1 ? this.templates[existingIndex].id : `template-${Date.now()}`,
    }
    if (existingIndex !== -1) {
      this.templates[existingIndex] = newTemplate
    } else {
      this.templates.push(newTemplate)
    }
    return newTemplate
  }

  // Campuses
  getCampuses(): Campus[] {
    return [...mockCampuses]
  }

  // Check for conflicts
  hasConflict(
    date: Date,
    startTime: string,
    endTime: string,
    teacherId?: string,
    classroomId?: string,
    excludeEventId?: string,
    studentId?: string,
    classroomIds?: string[]
  ): {
    hasTeacherConflict: boolean
    hasRoomConflict: boolean
    hasStudentConflict: boolean
    conflictDetails: {
      teacherConflicts: Array<{ startTime: string; endTime: string; teacherName?: string }>
      roomConflicts: Array<{ startTime: string; endTime: string; roomName?: string }>
      studentConflicts: Array<{ startTime: string; endTime: string }>
    }
  } {
    const dateStr = date.toISOString().split('T')[0]
    const relevantEvents = this.events.filter(
      e => e.date.toISOString().split('T')[0] === dateStr && e.id !== excludeEventId
    )

    const hasTimeOverlap = (event: ScheduleEvent): boolean => {
      const eventStart = parseInt(event.startTime.replace(':', ''))
      const eventEnd = parseInt(event.endTime.replace(':', ''))
      const newStart = parseInt(startTime.replace(':', ''))
      const newEnd = parseInt(endTime.replace(':', ''))
      return newStart < eventEnd && newEnd > eventStart
    }

    // Teacher conflicts
    const teacherConflictEvents = teacherId
      ? relevantEvents.filter(e => e.teacherId === teacherId && hasTimeOverlap(e))
      : []
    const hasTeacherConflict = teacherConflictEvents.length > 0

    // Room conflicts
    const targetClassroomIds = [
      ...(classroomId ? [classroomId] : []),
      ...(classroomIds || []),
    ].filter(Boolean)
    const roomConflictEvents = targetClassroomIds.length > 0
      ? relevantEvents.filter(e => {
          const eventClassroomIds = e.classroomIds || (e.classroomId ? [e.classroomId] : [])
          return eventClassroomIds.some(id => targetClassroomIds.includes(id)) && hasTimeOverlap(e)
        })
      : []
    const hasRoomConflict = roomConflictEvents.length > 0

    // Student conflicts - check if student already has events at this time
    const studentConflictEvents = studentId
      ? relevantEvents.filter(e => e.studentId === studentId && hasTimeOverlap(e))
      : []
    const hasStudentConflict = studentConflictEvents.length > 0

    // Build conflict details
    const conflictDetails = {
      teacherConflicts: teacherConflictEvents.map(e => ({
        startTime: e.startTime,
        endTime: e.endTime,
        teacherName: this.getTeachers().find(t => t.id === e.teacherId)?.name,
      })),
      roomConflicts: roomConflictEvents.map(e => {
        const eventClassroomIds = e.classroomIds || (e.classroomId ? [e.classroomId] : [])
        const firstRoomId = eventClassroomIds[0]
        return {
          startTime: e.startTime,
          endTime: e.endTime,
          roomName: firstRoomId
            ? this.getClassrooms(e.campus).find(c => c.id === firstRoomId)?.name
            : undefined,
        }
      }),
      studentConflicts: studentConflictEvents.map(e => ({
        startTime: e.startTime,
        endTime: e.endTime,
      })),
    }

    return { hasTeacherConflict, hasRoomConflict, hasStudentConflict, conflictDetails }
  }
}

// Singleton instance
export const scheduleStore = new ScheduleManagementStore()
