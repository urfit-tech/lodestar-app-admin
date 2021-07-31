import moment from 'moment'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'

type HeatmapValue = {
  date: Date
  count: number
}
const LearningHeatmap: React.VFC<{ values: HeatmapValue[] }> = ({ values }) => {
  return (
    <CalendarHeatmap
      style={{ height: '300px' }}
      startDate={moment().subtract(1, 'year').toDate()}
      endDate={moment().toDate()}
      values={values}
      titleForValue={(value?: HeatmapValue) => value && `${value.date}: ${value.count}`}
    />
  )
}

export default LearningHeatmap
