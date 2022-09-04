// organize-imports-ignore
import FullCalendar from '@fullcalendar/react'
import listPlugin from '@fullcalendar/list'
import dayGridPlugin from '@fullcalendar/daygrid'
import zhTWLocale from '@fullcalendar/core/locales/zh-tw'
import moment from 'moment'
import { categoryColors, StyledCategoryDot, StyledEventTime } from '../../components/task/MemberTaskAdminBlock'

const VenueUsageCalendar: React.VFC = () => {
  const venueUsage = [
    {
      id: '3982031-231',
      name: '11樓B01',
      activity: {
        id: '1',
        title: '高三國文集中營',
      },
      dueAt: '2022-08-10T12:50:00.296+00:00',
    },
    {
      id: '520981-231',
      name: '11樓B02',
      activity: {
        id: '2',
        title: '高一數學特訓班',
      },
      dueAt: '2022-08-17T16:20:00.296+00:00',
    },
    {
      id: '0951-281',
      name: '11樓B03',
      activity: {
        id: '3',
        title: '高二英文職考班',
      },
      dueAt: '2022-08-20T06:20:00.296+00:00',
    },
    {
      id: '77241-131',
      name: '12樓B01',
      activity: {
        id: '4',
        title: '高四理化實驗中心',
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
          `${e.event.title}於${moment(venueUsage.find(v => v.id === e.event.id)?.dueAt).format(
            'YYYY-MM-DD HH:mm',
          )}開始!`,
        )
      }}
      datesSet={dateInfo => console.log(dateInfo)}
    />
  )
}

export default VenueUsageCalendar
