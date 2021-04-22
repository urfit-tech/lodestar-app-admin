import { Funnel } from '@ant-design/charts'
import { BarChartOutlined, FunnelPlotFilled } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Button, DatePicker, message, Popover, Table } from 'antd'
import gql from 'graphql-tag'
import { AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import AdminCard from 'lodestar-app-admin/src/components/admin/AdminCard'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import { useAuth } from 'lodestar-app-admin/src/contexts/AuthContext'
import moment from 'moment'
import { filter, flatten, groupBy, length, map, split, sum, toPairs } from 'ramda'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import CategorySelector from '../components/common/CategorySelector'
import hasura from '../hasura'

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
  isDemoInvited: boolean
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
  const { isAuthenticated } = useAuth()
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
    if (isAuthenticated && assignedMemberCollectionState.error) {
      message.error('載入錯誤')
    }
  }, [assignedMemberCollectionState.error, isAuthenticated])

  const sales = groupBy<AssignedMemberProps>(({ manager: sale }) => `${sale.id}_${sale.name}`)(assignedMemberCollection)

  const dataSource = map(([sale, memberList]) => {
    const [saleId, saleName] = split('_')(sale)
    const firstHandCount = length(
      filter(member => {
        return member.notes.length === 0
      }, memberList),
    )
    const hasAnsweredCurrentManager = (note: {
      authorId: string
      type: string | null
      status: string | null
      duration: number
    }) => note.authorId === saleId && note.type === 'outbound' && note.status === 'answered' && note.duration > 90

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
          const saleNotes = filter(hasAnsweredCurrentManager, member.notes)

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
      demoInvitedCount: length(filter(member => member.isDemoInvited, memberList)),
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
        <span>業務表現</span>
      </AdminPageTitle>

      <StyledFilter className="mb-4">
        <span>指派時間</span>
        <DatePicker.RangePicker
          defaultValue={[moment(condition.startedAt).startOf('day'), moment(condition.endedAt).endOf('day')]}
          onChange={range =>
            range?.[0] &&
            range[1] &&
            setCondition({
              ...condition,
              startedAt: range[0].startOf('day').toDate(),
              endedAt: range[1].endOf('day').toDate(),
            })
          }
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
          <Table.Column title="業務名稱" dataIndex="saleName" key="saleName" width="8rem" />

          <Table.ColumnGroup title="指派名單數">
            <Table.Column<Pick<RecordType, 'memberCount'>>
              key="firstHand"
              title="一手單"
              dataIndex="memberCount"
              render={({ firstHand }) => <span>{firstHand}</span>}
              sorter={(a, b) => a.memberCount.firstHand - b.memberCount.firstHand}
              width="6.5rem"
            />

            <Table.Column<Pick<RecordType, 'memberCount'>>
              key="secondHand"
              title="二手單"
              dataIndex="memberCount"
              render={({ secondHand }) => <span>{secondHand}</span>}
              sorter={(a, b) => a.memberCount.secondHand - b.memberCount.secondHand}
              width="6.5rem"
            />

            <Table.Column<Pick<RecordType, 'memberCount'>>
              key="total"
              title="總數"
              dataIndex="memberCount"
              render={({ total }) => <span>{total}</span>}
              sorter={(a, b) => a.memberCount.total - b.memberCount.total}
              width="5.5rem"
            />
          </Table.ColumnGroup>

          <Table.Column<Pick<RecordType, 'getThroughCount'>>
            key="getThroughCount"
            title="接通數"
            dataIndex="getThroughCount"
            sorter={(a, b) => a.getThroughCount - b.getThroughCount}
            width="6.5rem"
          />

          <Table.ColumnGroup title="初次接觸">
            <Table.Column<Pick<RecordType, 'notFirstRejectionCount'>>
              key="notFirstRejectionCount"
              title="成功開發數"
              dataIndex="notFirstRejectionCount"
              sorter={(a, b) => a.notFirstRejectionCount - b.notFirstRejectionCount}
              width="7rem"
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
              width="6.5rem"
            />
          </Table.ColumnGroup>

          <Table.Column<Pick<RecordType, 'contactingCount'>>
            key="contactingCount"
            title="正在開發數"
            dataIndex="contactingCount"
            sorter={(a, b) => a.contactingCount - b.contactingCount}
            width="6.5rem"
          />

          <Table.ColumnGroup title="示範">
            <Table.Column<Pick<RecordType, 'demoInvitedCount'>>
              key="demoInvitedCount"
              title="邀約數"
              dataIndex="demoInvitedCount"
              sorter={(a, b) => a.demoInvitedCount - b.demoInvitedCount}
              width="6.5rem"
            />
            <Table.Column<Pick<RecordType, 'demoCount'>>
              key="demoCount"
              title="示範數"
              dataIndex="demoCount"
              sorter={(a, b) => a.demoCount - b.demoCount}
              width="6.5rem"
            />

            <Table.Column<Pick<RecordType, 'memberCount' | 'demoCount'>>
              key="demoRate"
              title="示範率"
              dataIndex="demoCount"
              render={(demoCount, { memberCount }) => <span>{Math.floor((demoCount / memberCount.total) * 100)}%</span>}
              sorter={(a, b) => a.demoCount / a.memberCount.total - b.demoCount / b.memberCount.total}
              width="6.5rem"
            />
          </Table.ColumnGroup>

          <Table.ColumnGroup title="成交">
            <Table.Column key="agreedCount" title="成交數" dataIndex="agreedCount" width="6.5rem" />

            <Table.Column<Pick<RecordType, 'agreedCount' | 'memberCount'>>
              key="agreedRate"
              title="成交率"
              dataIndex="agreedCount"
              render={(agreedCount, { memberCount }) => (
                <span>{Math.floor((agreedCount / memberCount.total) * 100)}%</span>
              )}
              sorter={(a, b) => a.agreedCount / a.memberCount.total - b.agreedCount / b.memberCount.total}
              width="6.5rem"
            />
          </Table.ColumnGroup>

          <Table.Column<Pick<RecordType, 'laborEvaluationScore'>>
            key="laborEvaluationScore"
            title="LE 值"
            dataIndex="laborEvaluationScore"
            sorter={(a, b) => a.laborEvaluationScore - b.laborEvaluationScore}
            width="6rem"
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
            width="6.5rem"
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
  const { loading, error, data } = useQuery<hasura.GET_ASSIGNED_MEMBER, hasura.GET_ASSIGNED_MEMBERVariables>(
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
          member_notes(order_by: { created_at: asc }) {
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
          member_contracts_aggregate(where: { agreed_at: { _is_null: false } }, limit: 1) {
            aggregate {
              count
            }
          }
          member_notes_aggregate(where: { type: { _eq: "demo" } }, limit: 1) {
            aggregate {
              count
            }
          }
          member_tasks_aggregate(where: { category: { name: { _eq: "預約DEMO" } } }, limit: 1) {
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
          manager: v.manager as hasura.GET_ASSIGNED_MEMBER_member_manager,
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
          isDemoInvited: !!v.member_tasks_aggregate?.aggregate?.count,
          isDemoed: !!v.member_notes_aggregate?.aggregate?.count,
          isAgreed: !!v.member_contracts_aggregate?.aggregate?.count,
        }))

  return {
    loading,
    error,
    assignedMemberCollection,
  }
}
