import { useQuery } from '@apollo/react-hooks'
import { DatePicker, Table } from 'antd'
import gql from 'graphql-tag'
import AdminCard from 'lodestar-app-admin/src/components/admin/AdminCard'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import moment from 'moment'
import { filter, flatten, groupBy, keys, length, map, split, sum, toPairs } from 'ramda'
import { useState } from 'react'
import { CategorySelector } from '../../components/common/CategorySelector'
import types from '../../types'

type AssignedMember = {
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

export function SalesMemberCategoryPage() {
  const [filters, setFilters] = useState<{
    startedAt: Date | null
    endedAt: Date | null
    category: string | null
  }>({
    startedAt: moment().startOf('month').toDate(),
    endedAt: moment().endOf('month').toDate(),
    category: null,
  })
  const { assignedMemberCollection, ...assignedMember } = useAssignedMemberCollection(filters)

  const sales = groupBy<AssignedMember>(({ manager: sale }) => `${sale.id}_${sale.name}`)(assignedMemberCollection)

  return (
    <AdminLayout>
      <DatePicker.RangePicker
        defaultValue={[moment(filters.startedAt), moment(filters.endedAt)]}
        onChange={range => {
          const [startedAt, endedAt] = range ? map(time => (time ? time.toDate() : null), range) : [null, null]

          setFilters({
            ...filters,
            startedAt,
            endedAt,
          })
        }}
      />

      <CategorySelector class="member" onChange={category => setFilters({ ...filters, category })} />

      <AdminCard>
        <Table
          rowKey="saleId"
          rowClassName="text-center"
          loading={assignedMember.loading || !!assignedMember.error}
          dataSource={map(([sale, memberList]) => {
            const [saleId, saleName] = split('_')(sale)
            const firstHandCount = length(
              filter(member => length(keys(groupBy(note => note.authorId, member.notes))) < 2, memberList),
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
                filter(member => length(filter(note => note.authorId === saleId, member.notes)) > 0, memberList),
              ),
              notFirstRejectionCount: length(
                filter(member => !filter(note => note.authorId === saleId, member.notes)[0]?.rejectedAt, memberList),
              ),
              contactedCount: length(
                filter(
                  member => !length(filter(note => note.authorId === saleId && !!note.rejectedAt, member.notes)),
                  memberList,
                ),
              ),
              demoCount: length(filter(member => member.isDemoed, memberList)),
              agreedCount: length(filter(member => member.isAgreed, memberList)),
              laborEvaluationScore: Math.floor(
                sum(
                  flatten(
                    map(
                      member =>
                        map(
                          ({ price, orderExecutors }) =>
                            price * (orderExecutors.find(v => v.memberId === saleId)?.ratio || 0),
                          member.contracts,
                        ),
                      memberList,
                    ),
                  ),
                ) / moment(filters.endedAt).diff(filters.startedAt, 'days'),
              ),
            }
          }, toPairs(sales))}
        >
          <Table.Column title="業務名稱" dataIndex="saleName" key="saleName" />
          <Table.ColumnGroup title="指派名單數">
            <Table.Column
              key="firstHand"
              title="一手單"
              dataIndex="memberCount"
              render={({ firstHand }) => <span>{firstHand}</span>}
            />
            <Table.Column
              key="secondHand"
              title="二手單"
              dataIndex="memberCount"
              render={({ secondHand }) => <span>{secondHand}</span>}
            />
            <Table.Column
              key="total"
              title="總數"
              dataIndex="memberCount"
              render={({ total }) => <span>{total}</span>}
            />
          </Table.ColumnGroup>
          <Table.ColumnGroup title="初次接觸">
            <Table.Column title="成功開發數" dataIndex="notFirstRejectionCount" key="notFirstRejectionCount" />
            <Table.Column
              key="notFirstRejectionRate"
              title="開發率"
              dataIndex="notFirstRejectionCount"
              render={(notFirstRejectionCount, record: { memberCount: { total: number } }) => (
                <span>{(notFirstRejectionCount / record.memberCount.total) * 100}%</span>
              )}
            />
          </Table.ColumnGroup>
          <Table.Column title="正在開發數" dataIndex="contactedCount" key="contactedCount" />
          <Table.ColumnGroup title="示範">
            <Table.Column title="示範數" dataIndex="demoCount" key="demoCount" />
            <Table.Column
              key="demoRate"
              title="示範率"
              dataIndex="demoCount"
              render={(demoCount, record: { memberCount: { total: number } }) => (
                <span>{(demoCount / record.memberCount.total) * 100}%</span>
              )}
            />
          </Table.ColumnGroup>
          <Table.ColumnGroup title="成交">
            <Table.Column title="成交數" dataIndex="agreedCount" key="agreedCount" />
            <Table.Column
              key="agreedRate"
              title="成交率"
              dataIndex="agreedCount"
              render={(agreedCount, record: { memberCount: { total: number } }) => (
                <span>{(agreedCount / record.memberCount.total) * 100}%</span>
              )}
            />
          </Table.ColumnGroup>
          <Table.Column title="LE 值" key="laborEvaluationScore" dataIndex="laborEvaluationScore" />
        </Table>
      </AdminCard>
    </AdminLayout>
  )
}

function useAssignedMemberCollection(filters: {
  startedAt: Date | null
  endedAt: Date | null
  category: string | null
}) {
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
      variables: filters,
      context: {
        important: true,
      },
    },
  )

  const assignedMemberCollection: AssignedMember[] =
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
            orderExecutors: w.values.orderExecutors.map((x: { ratio: number; member_id: string }) => ({
              ratio: x.ratio,
              memberId: x.member_id,
            })),
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
