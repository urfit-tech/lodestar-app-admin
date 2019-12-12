import React, { createContext } from 'react'

export type AppointmentPlanProps = {
  id: string
  title: string
  description: string | null
  duration: number
  listPrice: number
  periods: {
    id: string
    scheduleId: string
    schedulePeriodType: 'M' | 'W' | 'D' | null
    startedAt: Date
    isEnrolled?: boolean
    isExcluded?: boolean
  }[]
  isPublished: boolean | null
}

const AppointmentPlanContext = createContext<{
  appointmentPlan?: AppointmentPlanProps
}>({})

export const AppointmentPlanProvider: React.FC<{
  appointmentPlanId: string
}> = ({ appointmentPlanId, children }) => {
  // ! fake data
  const appointmentPlan: AppointmentPlanProps = {
    id: appointmentPlanId,
    title: '',
    description: '這是一個很棒的課程\n這是一個很棒\n這是一個很棒的課程\n這是一個很棒的課程這是一個很棒的課程。',
    duration: 0,
    listPrice: 0,
    periods: [
      {
        id: 'session-1',
        scheduleId: 'schedule-1',
        schedulePeriodType: 'D',
        startedAt: new Date('2019-12-01T13:00:00+0800'),
      },
      {
        id: 'session-2',
        scheduleId: 'schedule-2',
        schedulePeriodType: 'D',
        startedAt: new Date('2019-12-01T13:30:00+0800'),
      },
      {
        id: 'session-3',
        scheduleId: 'schedule-3',
        schedulePeriodType: 'D',
        startedAt: new Date('2019-12-01T14:00:00+0800'),
      },
      {
        id: 'session-4',
        scheduleId: 'schedule-4',
        schedulePeriodType: 'D',
        startedAt: new Date('2019-12-01T14:30:00+0800'),
        isEnrolled: true,
      },
      {
        id: 'session-5',
        scheduleId: 'schedule-5',
        schedulePeriodType: 'D',
        startedAt: new Date('2019-12-01T15:00:00+0800'),
        isEnrolled: true,
      },
      {
        id: 'session-6',
        scheduleId: 'schedule-6',
        schedulePeriodType: 'D',
        startedAt: new Date('2019-12-01T15:30:00+0800'),
      },
      {
        id: 'session-7',
        scheduleId: 'schedule-7',
        schedulePeriodType: 'D',
        startedAt: new Date('2019-12-01T16:00:00+0800'),
      },
      {
        id: 'session-8',
        scheduleId: 'schedule-8',
        schedulePeriodType: 'D',
        startedAt: new Date('2019-12-01T16:30:00+0800'),
      },
      {
        id: 'session-9',
        scheduleId: 'schedule-9',
        schedulePeriodType: 'D',
        startedAt: new Date('2019-12-01T17:00:00+0800'),
      },
      {
        id: 'session-10',
        scheduleId: 'schedule-10',
        schedulePeriodType: 'D',
        startedAt: new Date('2019-12-01T17:30:00+0800'),
      },
      {
        id: 'session-11',
        scheduleId: 'schedule-3',
        schedulePeriodType: 'D',
        startedAt: new Date('2019-12-02T14:00:00+0800'),
      },
      {
        id: 'session-12',
        scheduleId: 'schedule-4',
        schedulePeriodType: 'D',
        startedAt: new Date('2019-12-02T14:30:00+0800'),
        isEnrolled: true,
      },
      {
        id: 'session-13',
        scheduleId: 'schedule-5',
        schedulePeriodType: 'D',
        startedAt: new Date('2019-12-02T15:00:00+0800'),
        isExcluded: true,
      },
      {
        id: 'session-14',
        scheduleId: 'schedule-6',
        schedulePeriodType: 'D',
        startedAt: new Date('2019-12-02T15:30:00+0800'),
      },
      {
        id: 'session-15',
        scheduleId: 'schedule-7',
        schedulePeriodType: 'D',
        startedAt: new Date('2019-12-02T16:00:00+0800'),
      },
      {
        id: 'session-16',
        scheduleId: 'schedule-8',
        schedulePeriodType: 'D',
        startedAt: new Date('2019-12-02T16:30:00+0800'),
      },
    ],
    isPublished: null,
  }

  return (
    <AppointmentPlanContext.Provider
      value={{
        appointmentPlan,
      }}
    >
      {children}
    </AppointmentPlanContext.Provider>
  )
}

export default AppointmentPlanContext
