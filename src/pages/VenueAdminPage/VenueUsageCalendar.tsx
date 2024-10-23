// organize-imports-ignore
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import zhTWLocale from '@fullcalendar/core/locales/zh-tw'
import moment from 'moment'
import { categoryColors, StyledCategoryDot, StyledEventTime } from '../../components/task/MemberTaskAdminBlock'
import { useIntl } from 'react-intl'
import pageMessages from '../translation'

const VenueUsageCalendar: React.VFC = () => {
  const { formatMessage } = useIntl()
  const venueUsage = [
    {
      id: '3982031-231',
      name: formatMessage(pageMessages.VenueUsageCalendar.floor11RoomB01),
      activity: {
        id: '1',
        title: formatMessage(pageMessages.VenueUsageCalendar.highThreeChineseCamp),
      },
      dueAt: '2022-08-10T12:50:00.296+00:00',
    },
    {
      id: '520981-231',
      name: formatMessage(pageMessages.VenueUsageCalendar.floor11RoomB02),
      activity: {
        id: '2',
        title: formatMessage(pageMessages.VenueUsageCalendar.highOneMathTrainingClass),
      },
      dueAt: '2022-08-17T16:20:00.296+00:00',
    },
    {
      id: '0951-281',
      name: formatMessage(pageMessages.VenueUsageCalendar.floor11RoomB03),
      activity: {
        id: '3',
        title: formatMessage(pageMessages.VenueUsageCalendar.highTwoEnglishTestClass),
      },
      dueAt: '2022-08-20T06:20:00.296+00:00',
    },
    {
      id: '77241-131',
      name: formatMessage(pageMessages.VenueUsageCalendar.floor12RoomB01),
      activity: {
        id: '4',
        title: formatMessage(pageMessages.VenueUsageCalendar.highFourPhysicsChemLab),
      },
      dueAt: '2022-08-14T14:55:00.296+00:00',
    },
  ]
  return (
    <FullCalendar
      plugins={[dayGridPlugin, listPlugin]}
      locales={[zhTWLocale]}
      headerToolbar={{
        left: 'title',
        right: 'dayGridDay dayGridWeek dayGridMonth listWeek today prev next',
      }}
      initialView="dayGridMonth"
      eventContent={arg => (
        <div className="fc-event-title">
          <StyledCategoryDot color={arg.event.extendedProps.dotColor} className="mx-1" />
          <StyledEventTime>{arg.timeText}</StyledEventTime>
          {arg.event.title}
        </div>
      )}
      events={venueUsage
        .filter(venueUsage => venueUsage.dueAt)
        .map(venueUsage => {
          return {
            id: venueUsage.id,
            title: `${venueUsage.name}(${venueUsage.activity.title})`,
            start: moment(venueUsage.dueAt).format(),
            dotColor: categoryColors[Math.floor(Math.random() * 10)],
          }
        })}
      eventClick={e => {
        alert(
          formatMessage(pageMessages.VenueUsageCalendar.eventStartAlert, {
            eventTitle: e.event.title,
            startTime: moment(venueUsage.find(v => v.id === e.event.id)?.dueAt).format('YYYY-MM-DD HH:mm'),
          }),
        )
      }}
      datesSet={dateInfo => console.log(dateInfo)}
    />
  )
}

export default VenueUsageCalendar
