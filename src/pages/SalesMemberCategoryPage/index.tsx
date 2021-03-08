import { DatePicker } from 'antd'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import moment from 'moment'
import { map } from 'ramda'
import { useState } from 'react'
import { CategorySelector } from '../../components/common/CategorySelector'

export function SalesMemberCategoryPage() {
  const [filter, setFilter] = useState<{
    startedAt: Date | null
    endedAt: Date | null
    category: string | null
  }>({
    startedAt: moment().startOf('month').toDate(),
    endedAt: moment().endOf('month').toDate(),
    category: null,
  })

  return (
    <AdminLayout>
      <DatePicker.RangePicker
        defaultValue={[moment(filter.startedAt), moment(filter.endedAt)]}
        onChange={range => {
          const [startedAt, endedAt] = range ? map(time => (time ? time.toDate() : null), range) : [null, null]

          setFilter({
            ...filter,
            startedAt,
            endedAt,
          })
        }}
      />

      <CategorySelector class="member" onChange={category => setFilter({ ...filter, category })} />

      {/* <Tabs>
        <Tabs.TabPane></Tabs.TabPane>
        <Tabs.TabPane></Tabs.TabPane>
        <Tabs.TabPane></Tabs.TabPane>
      </Tabs> */}
    </AdminLayout>
  )
}
