import { Funnel } from '@ant-design/charts'
import { BarChartOutlined, FunnelPlotFilled } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Button, DatePicker, message, Popover, Table } from 'antd'
import gql from 'graphql-tag'
import { AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import AdminCard from 'lodestar-app-admin/src/components/admin/AdminCard'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import moment from 'moment'
import { filter, flatten, groupBy, keys, length, map, split, sum, toPairs } from 'ramda'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import CategorySelector from '../components/common/CategorySelector'
import types from '../types'

type AssignedMemberProps = {
  id: string
  manager: {
    id: string
    name: string
  }
  notes: {
    id: string
    authorId: string
    type: string | null
    status: string | null
    duration: number
    rejectedAt: Date | null
  }[]
  contracts: {
    price: number
    orderExecutors: { ratio: number; memberId: string }[]
  }[]
  isDemoed: boolean
  isAgreed: boolean
}

const StyledFilter = styled.div`
  display: grid;
  grid-template-columns: 80px 300px;
  row-gap: 20px;
  line-height: 45px;
`

export default function SalesMemberCategoryPage() {
  const [condition, setCondition] = useState<{
    startedAt: Date | null
    endedAt: Date | null
    category: string | null
  }>({
    startedAt: moment().startOf('week').toDate(),
    endedAt: moment().endOf('week').toDate(),
    category: null,
  })
  const { assignedMemberCollection, ...assignedMemberCollectionState } = useAssignedMemberCollection(condition)

  useEffect(() => {
    if (assignedMemberCollectionState.error) {
      message.error('載入錯誤')
    }
  }, [assignedMemberCollectionState.error])

  const sales = groupBy<AssignedMemberProps>(({ manager: sale }) => `${sale.id}_${sale.name}`)(assignedMemberCollection)

  const dataSource = map(([sale, memberList]) => {
    const [saleId, saleName] = split('_')(sale)
    const firstHandCount = length(
      filter(member => {
        const noteSales = keys(groupBy(note => note.authorId, member.notes))

        return 1 >= noteSales.length
      }, memberList),
    )

    return {
      saleId,
      saleName,
      memberCount: {
        total: length(memberList),
        firstHand: firstHandCount,
        secondHand: length(memberList) - firstHandCount,
      },
      getThroughCount: length(
        filter(member => {
          const saleNotes = filter(note => note.authorId === saleId, member.notes)

          return length(saleNotes) > 0
        }, memberList),
      ),
      notFirstRejectionCount: length(
        filter(member => {
          const saleNotes = filter(note => note.authorId === saleId, member.notes)

          return length(saleNotes) > 0 && !saleNotes[0].rejectedAt
        }, memberList),
      ),
      contactingCount: length(
        filter(member => {
          const saleNotes = filter(note => note.authorId === saleId, member.notes)
          const saleRejectedNotes = filter(note => !!note.rejectedAt, saleNotes)

          return length(saleNotes) >= 1 && length(saleRejectedNotes) === 0
        }, memberList),
      ),
      demoCount: length(filter(member => member.isDemoed, memberList)),
      agreedCount: length(filter(member => member.isAgreed, memberList)),
      laborEvaluationScore: Math.floor(
        sum(
          flatten(
            map(
              member =>
                map(
                  ({ price, orderExecutors }) => price * (orderExecutors.find(v => v.memberId === saleId)?.ratio || 0),
                  member.contracts,
                ),
              memberList,
            ),
          ),
        ) / moment(condition.endedAt).diff(condition.startedAt, 'days'),
      ),
    }
  }, toPairs(sales))

  type RecordType = typeof dataSource[number]

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <BarChartOutlined className="mr-3" />
        <span>領域表現</span>
      </AdminPageTitle>

      <StyledFilter className="mb-4">
        <span>指派時間</span>
        <DatePicker.RangePicker
          defaultValue={[moment(condition.startedAt), moment(condition.endedAt)]}
          onChange={range => {
            const [startedAt, endedAt] = range ? map(time => (time ? time.toDate() : null), range) : [null, null]

            setCondition({
              ...condition,
              startedAt,
              endedAt,
            })
          }}
        />

        <span>會員分類</span>
        <CategorySelector class="member" onChange={category => setCondition({ ...condition, category })} />
      </StyledFilter>

      <AdminCard>
        <Table<RecordType>
          loading={assignedMemberCollectionState.loading}
          dataSource={dataSource}
          rowKey="saleId"
          scroll={{ x: 1000, y: 400 }}
          bordered
          pagination={false}
        >
          <Table.Column title="業務名稱" dataIndex="saleName" key="saleName" />

          <Table.ColumnGroup title="指派名單數">
            <Table.Column<Pick<RecordType, 'memberCount'>>
              key="firstHand"
              title="一手單"
              dataIndex="memberCount"
              render={({ firstHand }) => <span>{firstHand}</span>}
              sorter={(a, b) => a.memberCount.firstHand - b.memberCount.firstHand}
            />

            <Table.Column<Pick<RecordType, 'memberCount'>>
              key="secondHand"
              title="二手單"
              dataIndex="memberCount"
              render={({ secondHand }) => <span>{secondHand}</span>}
              sorter={(a, b) => a.memberCount.secondHand - b.memberCount.secondHand}
            />

            <Table.Column<Pick<RecordType, 'memberCount'>>
              key="total"
              title="總數"
              dataIndex="memberCount"
              render={({ total }) => <span>{total}</span>}
              sorter={(a, b) => a.memberCount.total - b.memberCount.total}
            />
          </Table.ColumnGroup>

          <Table.Column<Pick<RecordType, 'getThroughCount'>>
            key="getThroughCount"
            title="接通數"
            dataIndex="getThroughCount"
            sorter={(a, b) => a.getThroughCount - b.getThroughCount}
          />

          <Table.ColumnGroup title="初次接觸">
            <Table.Column<Pick<RecordType, 'notFirstRejectionCount'>>
              key="notFirstRejectionCount"
              title="成功開發數"
              dataIndex="notFirstRejectionCount"
              sorter={(a, b) => a.notFirstRejectionCount - b.notFirstRejectionCount}
            />

            <Table.Column<Pick<RecordType, 'memberCount' | 'notFirstRejectionCount'>>
              key="notFirstRejectionRate"
              title="開發率"
              dataIndex="notFirstRejectionCount"
              render={(notFirstRejectionCount, { memberCount }) => (
                <span>{Math.floor((notFirstRejectionCount / memberCount.total) * 100)}%</span>
              )}
              sorter={(a, b) =>
                a.notFirstRejectionCount / a.memberCount.total - b.notFirstRejectionCount / b.memberCount.total
              }
            />
          </Table.ColumnGroup>

          <Table.Column<Pick<RecordType, 'contactingCount'>>
            key="contactingCount"
            title="正在開發數"
            dataIndex="contactingCount"
            sorter={(a, b) => a.contactingCount - b.contactingCount}
          />

          <Table.ColumnGroup title="示範">
            <Table.Column<Pick<RecordType, 'demoCount'>>
              key="demoCount"
              title="示範數"
              dataIndex="demoCount"
              sorter={(a, b) => a.demoCount - b.demoCount}
            />

            <Table.Column<Pick<RecordType, 'memberCount' | 'demoCount'>>
              key="demoRate"
              title="示範率"
              dataIndex="demoCount"
              render={(demoCount, { memberCount }) => <span>{Math.floor((demoCount / memberCount.total) * 100)}%</span>}
              sorter={(a, b) => a.demoCount / a.memberCount.total - b.demoCount / b.memberCount.total}
            />
          </Table.ColumnGroup>

          <Table.ColumnGroup title="成交">
            <Table.Column key="agreedCount" title="成交數" dataIndex="agreedCount" />

            <Table.Column<Pick<RecordType, 'agreedCount' | 'memberCount'>>
              key="agreedRate"
              title="成交率"
              dataIndex="agreedCount"
              render={(agreedCount, { memberCount }) => (
                <span>{Math.floor((agreedCount / memberCount.total) * 100)}%</span>
              )}
              sorter={(a, b) => a.agreedCount / a.memberCount.total - b.agreedCount / b.memberCount.total}
            />
          </Table.ColumnGroup>

          <Table.Column<Pick<RecordType, 'laborEvaluationScore'>>
            key="laborEvaluationScore"
            title="LE 值"
            dataIndex="laborEvaluationScore"
            sorter={(a, b) => a.laborEvaluationScore - b.laborEvaluationScore}
          />

          <Table.Column<RecordType>
            key="chart"
            title="轉化圖"
            render={(_, record) => (
              <Popover
                trigger="click"
                content={
                  <Funnel
                    data={[
                      {
                        stage: '指派名單數',
                        number: record.memberCount.total,
                      },
                      {
                        stage: '接通數',
                        number: record.getThroughCount,
                      },
                      {
                        stage: '成功開發數',
                        number: record.notFirstRejectionCount,
                      },
                      {
                        stage: '正在開發數',
                        number: record.contactingCount,
                      },
                      {
                        stage: '示範數',
                        number: record.demoCount,
                      },
                      {
                        stage: '成交數',
                        number: record.agreedCount,
                      },
                    ]}
                    width={320}
                    height={320}
                    padding={20}
                    xField="stage"
                    yField="number"
                    isTransposed={false}
                    legend={false}
                  />
                }
                placement="topRight"
              >
                <Button type="text" icon={<FunnelPlotFilled />} />
              </Popover>
            )}
          />
        </Table>
      </AdminCard>
    </AdminLayout>
  )
}

const useAssignedMemberCollection = (filter: {
  startedAt: Date | null
  endedAt: Date | null
  category: string | null
}) => {
  const { loading, error, data } = useQuery<types.GET_ASSIGNED_MEMBER, types.GET_ASSIGNED_MEMBERVariables>(
    gql`
      query GET_ASSIGNED_MEMBER($startedAt: timestamptz!, $endedAt: timestamptz!, $category: String) {
        member(
          where: {
            assigned_at: { _gte: $startedAt, _lte: $endedAt }
            member_categories: { category: { name: { _eq: $category } } }
            manager_id: { _is_null: false }
          }
        ) {
          id
          manager {
            id
            name
          }
          member_notes(
            where: { type: { _eq: "outbound" }, status: { _eq: "answered" }, duration: { _gt: 90 } }
            order_by: { created_at: asc }
          ) {
            id
            author_id
            type
            status
            duration
            created_at
            rejected_at
          }
          member_contracts(where: { agreed_at: { _is_null: false } }) {
            id
            values
          }
          member_contracts_aggregate(where: { agreed_at: { _is_null: false } }) {
            aggregate {
              count
            }
          }
          member_tasks_aggregate(where: { category: { name: { _eq: "預約DEMO" } } }) {
            aggregate {
              count
            }
          }
        }
      }
    `,
    {
      variables: filter,
      context: {
        important: true,
      },
    },
  )

  const assignedMemberCollection: AssignedMemberProps[] =
    loading || !!error || !data
      ? []
      : data.member.map(v => ({
          id: v.id,
          manager: v.manager as types.GET_ASSIGNED_MEMBER_member_manager,
          notes: v.member_notes.map(w => ({
            id: w.id,
            authorId: w.author_id,
            type: w.type,
            status: w.status,
            duration: w.duration,
            rejectedAt: w.rejected_at ? new Date(w.rejected_at) : null,
          })),
          contracts: v.member_contracts.map(w => ({
            price: w.values.price || 0,
            orderExecutors:
              w.values.orderExecutors?.map((x: { ratio: number; member_id: string }) => ({
                ratio: x.ratio,
                memberId: x.member_id,
              })) || [],
          })),
          isDemoed: !!v.member_tasks_aggregate?.aggregate?.count,
          isAgreed: !!v.member_contracts_aggregate?.aggregate?.count,
        }))

  return {
    loading,
    error,
    assignedMemberCollection,
  }
}
