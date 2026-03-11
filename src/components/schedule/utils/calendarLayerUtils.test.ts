import { SCHEDULE_COLORS, Teacher } from '../../../types/schedule'
import {
  buildScheduleEventIdSet,
  resolveTeacherLayerColor,
  shouldShowStudentLayerEvent,
  shouldShowTeacherLayerEvent,
} from './calendarLayerUtils'

describe('calendarLayerUtils', () => {
  const selectedTeachers: Teacher[] = [
    {
      id: 'teacher-b',
      name: 'B',
      email: 'b@example.com',
      campus: '',
      campusIds: [],
      campusNames: [],
      languages: ['中文'],
      teachingLanguages: ['中文'],
      traits: [],
      level: '1',
      yearsOfExperience: 1,
    },
    {
      id: 'teacher-a',
      name: 'A',
      email: 'a@example.com',
      campus: '',
      campusIds: [],
      campusNames: [],
      languages: ['中文'],
      teachingLanguages: ['中文'],
      traits: [],
      level: '1',
      yearsOfExperience: 1,
    },
  ]

  it('maps teacher color by selected order instead of teacher id sort', () => {
    expect(resolveTeacherLayerColor(selectedTeachers, 'teacher-b', 'open')).toBe(SCHEDULE_COLORS.teacher.teacher1.light)
    expect(resolveTeacherLayerColor(selectedTeachers, 'teacher-a', 'published')).toBe(
      SCHEDULE_COLORS.teacher.teacher2.dark,
    )
  })

  it('builds id set from both local id and api id', () => {
    const idSet = buildScheduleEventIdSet([
      { id: 'local-1', apiEventId: 'api-1' },
      { id: 'local-2' },
      { id: 'local-3', apiEventId: '' },
    ])
    expect(Array.from(idSet).sort()).toEqual(['api-1', 'local-1', 'local-2', 'local-3'])
  })

  it('filters teacher events by teacher visibility, status visibility and dedupe ids', () => {
    const visibleTeachers = new Set(['teacher-a'])
    const teacherStatusVisibility = { open: true, scheduled: true, published: true }
    const scheduleEventIdSet = new Set<string>(['dup-event'])

    expect(
      shouldShowTeacherLayerEvent(
        {
          teacherId: 'teacher-a',
          status: 'open',
          originalEventId: 'dup-event',
        },
        visibleTeachers,
        teacherStatusVisibility,
        scheduleEventIdSet,
      ),
    ).toBe(false)

    expect(
      shouldShowTeacherLayerEvent(
        {
          teacherId: 'teacher-a',
          status: 'published',
          originalEventId: 'teacher-event-2',
        },
        visibleTeachers,
        teacherStatusVisibility,
        scheduleEventIdSet,
      ),
    ).toBe(true)

    expect(
      shouldShowTeacherLayerEvent(
        {
          teacherId: 'teacher-b',
          status: 'published',
          originalEventId: 'teacher-event-3',
        },
        visibleTeachers,
        teacherStatusVisibility,
        scheduleEventIdSet,
      ),
    ).toBe(false)
  })

  it('keeps template as placeholder when template feature is disabled', () => {
    const studentStatusVisibility = {
      open: true,
      scheduled: true,
      published: true,
      template: true,
    }

    expect(shouldShowStudentLayerEvent('open', studentStatusVisibility, false)).toBe(true)
    expect(shouldShowStudentLayerEvent('published', { ...studentStatusVisibility, published: false }, false)).toBe(
      false,
    )
    expect(shouldShowStudentLayerEvent('template', studentStatusVisibility, false)).toBe(false)
  })
})
