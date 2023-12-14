import { gql, useQuery } from '@apollo/client'
import { Breadcrumb, DatePicker, Slider, Timeline } from 'antd'
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

  const isValidLog = (log: ProgramContentLog) => log.ended_at - log.started_at > 1

  // sort Logs desc first
  const sortedLogs = (data?.program_content_log || [])
    .filter(isValidLog)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  type ProgramContentLog = hasura.GET_HISTORY['program_content_log'][number]

  const mergedLogs = sortedLogs
    .reduce<ProgramContentLog[]>((accumulatedLogs, currentLog) => {
      const lastLog = accumulatedLogs[accumulatedLogs.length - 1]

      if (lastLog && lastLog.program_content.id === currentLog.program_content.id) {
        // Merge consecutive logs with the same program_content ID.
        // Update the last log to have the earliest 'started_at' and the latest 'ended_at'.
        const updatedLog = {
          ...lastLog,
          started_at: Math.min(lastLog.started_at, currentLog.started_at),
          ended_at: Math.max(lastLog.ended_at, currentLog.ended_at),
        }
        accumulatedLogs[accumulatedLogs.length - 1] = updatedLog
      } else {
        // If not consecutive, add the current log as a new entry.
        accumulatedLogs.push({ ...currentLog })
      }
      return accumulatedLogs
    }, [])
    .filter(isValidLog)

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
        {!loading && mergedLogs.length === 0 ? (
          <div>No history.</div>
        ) : (
          <Timeline pending={loading ? 'Loading...' : null}>
            {mergedLogs.map(v => (
              <Timeline.Item key={v.id}>
                <span className="mr-2">{moment(v.created_at).format('MM-DD HH:mm')}</span>
                <div className="row">
                  <div className="col-12 col-lg-6">
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
                    <div>
                      {v.program_content.duration > 0
                        ? `${Math.round(((v.ended_at - v.started_at) / v.program_content.duration) * 100)}% watched`
                        : '0% watched'}
                    </div>
                  </div>
                  <div className="col-12 col-lg-6">
                    <Slider
                      range
                      max={Math.round(v.program_content.duration)}
                      defaultValue={[v.started_at, v.ended_at]}
                      disabled
                      tipFormatter={v => v && new Date(v * 1000).toISOString().substr(11, 8)}
                      marks={{
                        0: '00:00:00',
                        [v.program_content.duration]: new Date(v.program_content.duration * 1000)
                          .toISOString()
                          .substr(11, 8),
                      }}
                    />
                  </div>
                </div>
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
        duration
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
