import React, { createContext } from 'react'
import { AppointmentPeriodProps } from '../../components/appointment/AppointmentPeriodItem'

export type AppointmentPlanProps = {
  id: string
  title: string
  description: string | null
  duration: number
  listPrice: number
  periods: AppointmentPeriodProps[]
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
        schedule: {
          id: 'schedule-1',
          periodType: null,
        },
        startedAt: new Date('2019-12-01T13:00:00+0800'),
      },
      {
        id: 'session-2',
        schedule: {
          id: 'schedule-2',
          periodType: null,
        },
        startedAt: new Date('2019-12-01T13:30:00+0800'),
      },
      {
        id: 'session-3',
        schedule: {
          id: 'schedule-3',
          periodType: 'D',
        },
        startedAt: new Date('2019-12-01T14:00:00+0800'),
      },
      {
        id: 'session-4',
        schedule: {
          id: 'schedule-4',
          periodType: 'D',
        },
        startedAt: new Date('2019-12-01T14:30:00+0800'),
        isEnrolled: true,
      },
      {
        id: 'session-5',
        schedule: {
          id: 'schedule-5',
          periodType: 'D',
        },
        startedAt: new Date('2019-12-01T15:00:00+0800'),
        isEnrolled: true,
      },
      {
        id: 'session-6',
        schedule: {
          id: 'schedule-6',
          periodType: 'D',
        },
        startedAt: new Date('2019-12-01T15:30:00+0800'),
      },
      {
        id: 'session-7',
        schedule: {
          id: 'schedule-7',
          periodType: 'D',
        },
        startedAt: new Date('2019-12-01T16:00:00+0800'),
        isExcluded: true,
      },
      {
        id: 'session-8',
        schedule: {
          id: 'schedule-8',
          periodType: 'D',
        },
        startedAt: new Date('2019-12-01T16:30:00+0800'),
        isExcluded: true,
      },
      {
        id: 'session-9',
        schedule: {
          id: 'schedule-9',
          periodType: null,
        },
        startedAt: new Date('2019-12-01T17:00:00+0800'),
      },
      {
        id: 'session-10',
        schedule: {
          id: 'schedule-10',
          periodType: null,
        },
        startedAt: new Date('2019-12-01T17:30:00+0800'),
      },
      {
        id: 'session-11',
        schedule: {
          id: 'schedule-3',
          periodType: 'D',
        },
        startedAt: new Date('2019-12-02T14:00:00+0800'),
      },
      {
        id: 'session-12',
        schedule: {
          id: 'schedule-4',
          periodType: 'D',
        },
        startedAt: new Date('2019-12-02T14:30:00+0800'),
        isEnrolled: true,
      },
      {
        id: 'session-13',
        schedule: {
          id: 'schedule-5',
          periodType: 'D',
        },
        startedAt: new Date('2019-12-02T15:00:00+0800'),
        isExcluded: true,
      },
      {
        id: 'session-14',
        schedule: {
          id: 'schedule-6',
          periodType: 'D',
        },
        startedAt: new Date('2019-12-02T15:30:00+0800'),
      },
      {
        id: 'session-15',
        schedule: {
          id: 'schedule-7',
          periodType: 'D',
        },
        startedAt: new Date('2019-12-02T16:00:00+0800'),
      },
      {
        id: 'session-16',
        schedule: {
          id: 'schedule-8',
          periodType: 'D',
        },
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
