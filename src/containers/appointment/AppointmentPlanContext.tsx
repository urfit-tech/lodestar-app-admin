import React, { createContext } from 'react'

export type AppointmentPlanProps = {
  id: string
  title: string
  description: string | null
  duration: number
  listPrice: number
  sessions: {
    id: string
    startedAt: Date
    isEnrolled?: boolean
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
    title: 'XXOO諮詢',
    description: '這是一個很棒的課程\n這是一個很棒\n這是一個很棒的課程\n這是一個很棒的課程這是一個很棒的課程。',
    duration: 60,
    listPrice: 3000,
    sessions: [
      {
        id: 'session-1',
        startedAt: new Date('2019-12-01T13:00:00+0800'),
      },
      {
        id: 'session-2',
        startedAt: new Date('2019-12-01T13:30:00+0800'),
      },
      {
        id: 'session-3',
        startedAt: new Date('2019-12-01T14:00:00+0800'),
      },
      {
        id: 'session-4',
        startedAt: new Date('2019-12-01T14:30:00+0800'),
        isEnrolled: true,
      },
      {
        id: 'session-5',
        startedAt: new Date('2019-12-01T15:00:00+0800'),
        isEnrolled: true,
      },
      {
        id: 'session-6',
        startedAt: new Date('2019-12-01T15:30:00+0800'),
      },
      {
        id: 'session-7',
        startedAt: new Date('2019-12-01T16:00:00+0800'),
      },
      {
        id: 'session-8',
        startedAt: new Date('2019-12-01T16:30:00+0800'),
      },
      {
        id: 'session-9',
        startedAt: new Date('2019-12-01T17:00:00+0800'),
      },
      {
        id: 'session-10',
        startedAt: new Date('2019-12-01T17:30:00+0800'),
      },
      {
        id: 'session-11',
        startedAt: new Date('2019-12-02T14:00:00+0800'),
      },
      {
        id: 'session-12',
        startedAt: new Date('2019-12-02T14:30:00+0800'),
        isEnrolled: true,
      },
      {
        id: 'session-13',
        startedAt: new Date('2019-12-02T15:00:00+0800'),
      },
      {
        id: 'session-14',
        startedAt: new Date('2019-12-02T15:30:00+0800'),
      },
      {
        id: 'session-15',
        startedAt: new Date('2019-12-02T16:00:00+0800'),
      },
      {
        id: 'session-16',
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
