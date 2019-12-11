import moment from 'moment'
import groupBy from 'ramda/es/groupBy'
import React, { useContext } from 'react'
import AppointmentSessionCollection, {
  DeleteSessionEvent,
  EmptyBlock,
} from '../../components/appointment/AppointmentSessionCollection'
import AppointmentPlanContext from './AppointmentPlanContext'

const AppointmentPlanSessionBlock: React.FC = () => {
  const { appointmentPlan } = useContext(AppointmentPlanContext)

  if (!appointmentPlan) {
    return null
  }

  const handleDelete: DeleteSessionEvent = ({ id }) => {
    console.log(`delete appointment session: ${id}`)
  }

  const sessionCollections = groupBy(
    session => `${session.startedAt.getFullYear()}${session.startedAt.getMonth() + 1}${session.startedAt.getDate()}`,
    appointmentPlan.sessions,
  )

  return (
    <>
      {appointmentPlan.sessions.length === 0 ? (
        <EmptyBlock>目前還沒有建立任何時段</EmptyBlock>
      ) : (
        Object.values(sessionCollections).map(sessions => (
          <AppointmentSessionCollection
            key={moment(sessions[0].startedAt).format('YYYY-MM-DD(dd)')}
            sessions={sessions.map(session => ({
              id: session.id,
              startedAt: session.startedAt,
              isEnrolled: session.isEnrolled,
              onDelete: handleDelete,
            }))}
          />
        ))
      )}
    </>
  )
}

export default AppointmentPlanSessionBlock
