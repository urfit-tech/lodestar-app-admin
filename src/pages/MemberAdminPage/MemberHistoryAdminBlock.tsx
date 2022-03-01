import { useQuery } from '@apollo/react-hooks'
import { Breadcrumb, DatePicker, Timeline } from 'antd'
import gql from 'graphql-tag'
import moment, { Moment } from 'moment'
import { RangeValue } from 'rc-picker/lib/interface'
import React, { useState } from 'react'
import { AdminBlock } from '../../components/admin'
import hasura from '../../hasura'

const MemberHistoryAdminBlock: React.VFC<{ memberId: string }> = ({ memberId }) => {
  const [dateRange, setDateRange] = useState<RangeValue<Moment>>([moment().subtract(7, 'days'), null])
  const { loading, data } = useQuery<hasura.GET_HISTORY, hasura.GET_HISTORYVariables>(GET_HISTORY, {
    variables: {
      memberId,
      startedAt: dateRange?.[0],
      endedAt: dateRange?.[1],
    },
  })
  const logs = data?.program_content_log.filter(v => v.ended_at - v.started_at > 1) || []
  return (
    <>
      <DatePicker.RangePicker
        className="mb-3"
        value={dateRange}
        ranges={{
          'Last 7 days': [moment().subtract(7, 'days'), null],
          'Last 2 weeks': [moment().subtract(2, 'week').startOf('week'), moment().subtract(2, 'week').endOf('week')],
          'Last month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
          'This month': [moment().startOf('month'), moment().endOf('month')],
        }}
        onChange={dates => setDateRange(dates)}
      />
      <AdminBlock>
        {!loading && logs.length === 0 ? (
          <div>No history.</div>
        ) : (
          <Timeline pending={loading ? 'Loading...' : null}>
            {logs.map(v => (
              <Timeline.Item key={v.id}>
                <span className="mr-2">{moment(v.created_at).format('MM-DD HH:mm')}</span>
                <Breadcrumb>
                  <Breadcrumb.Item>
                    <a
                      href={`/programs/${v.program_content.program_content_section.program.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {v.program_content.program_content_section.program.title}
                    </a>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    <a
                      href={`/programs/${v.program_content.program_content_section.program.id}/contents`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {v.program_content.program_content_section.title}
                    </a>
                  </Breadcrumb.Item>
                  <Breadcrumb.Item>
                    <a
                      href={`/programs/${v.program_content.program_content_section.program.id}/contents/${v.program_content.id}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {v.program_content.title}
                    </a>
                  </Breadcrumb.Item>
                </Breadcrumb>
                <small>
                  {new Date(v.started_at * 1000).toISOString().substr(11, 8)} ~{' '}
                  {new Date(v.ended_at * 1000).toISOString().substr(11, 8)}
                </small>
              </Timeline.Item>
            ))}
          </Timeline>
        )}
      </AdminBlock>
    </>
  )
}

const GET_HISTORY = gql`
  query GET_HISTORY($memberId: String!, $startedAt: timestamptz, $endedAt: timestamptz) {
    program_content_log(
      where: { member_id: { _eq: $memberId }, created_at: { _gte: $startedAt, _lt: $endedAt } }
      order_by: { created_at: desc }
    ) {
      id
      created_at
      program_content {
        id
        title
        program_content_section {
          title
          program {
            id
            title
          }
        }
      }
      started_at
      ended_at
    }
  }
`

export default MemberHistoryAdminBlock
