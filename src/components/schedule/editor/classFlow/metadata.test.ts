import {
  assertClassMetadata,
  buildClassMetadata,
  parseClassMetadata,
} from './metadata'

describe('class metadata helpers', () => {
  it('builds normalized metadata payload', () => {
    const metadata = buildClassMetadata({
      classTitle: '小組班 A',
      classId: 'class-1',
      scheduleType: 'group',
      campus: 'campus-1',
      language: '中文',
      studentIds: ['student-1', 'student-1', 'student-2'],
      orderIds: ['order-1', 'order-1', 'order-2'],
      classroomIds: ['room-1', 'room-1', 'room-2'],
      isExternal: false,
    })

    expect(metadata.studentIds).toEqual(['student-1', 'student-2'])
    expect(metadata.orderIds).toEqual(['order-1', 'order-2'])
    expect(metadata.classroomIds).toEqual(['room-1', 'room-2'])
    expect(metadata.classroomId).toBe('room-1')
    expect(metadata.classMode).toBe('一般')
  })

  it('parses and normalizes metadata', () => {
    const raw = {
      scheduleType: 'semester',
      classId: 'class-2',
      studentIds: ['student-1', 'student-1'],
      orderIds: ['order-1', 'order-1'],
      publishedStudentIds: ['student-1', 'student-1'],
      preScheduledStudentIds: ['student-2', 'student-2'],
      classroomIds: ['room-1', 'room-1'],
    }

    const parsed = parseClassMetadata(raw)

    expect(parsed).not.toBeNull()
    expect(parsed?.studentIds).toEqual(['student-1'])
    expect(parsed?.orderIds).toEqual(['order-1'])
    expect(parsed?.publishedStudentIds).toEqual(['student-1'])
    expect(parsed?.preScheduledStudentIds).toEqual(['student-2'])
    expect(parsed?.classroomIds).toEqual(['room-1'])
    expect(parsed?.classroomId).toBe('room-1')
  })

  it('rejects invalid metadata payload', () => {
    expect(parseClassMetadata({ scheduleType: 'semester', classId: 'class-1' })).toBeNull()
    expect(() => assertClassMetadata({ scheduleType: 'semester', classId: 'class-1' })).toThrow(
      'INVALID_CLASS_SCHEDULE_METADATA',
    )
  })
})
