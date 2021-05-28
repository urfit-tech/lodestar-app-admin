import { ExportOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Button, Select, Skeleton, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import gql from 'graphql-tag'
import { AdminBlock, AdminBlockTitle } from 'lodestar-app-admin/src/components/admin'
import { AvatarImage } from 'lodestar-app-admin/src/components/common/Image'
import { dateFormatter, downloadCSV, toCSV } from 'lodestar-app-admin/src/helpers'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import styled from 'styled-components'
import hasura from '../../hasura'

const StyledMemberName = styled.div`
  color: var(--gray-darker);
  line-height: 1.5;
  letter-spacing: 0.2px;
`
const StyledMemberEmail = styled.div`
  color: var(--gray-dark);
  font-size: 12px;
  letter-spacing: 0.6px;
`
const StyledTableWrapper = styled.div`
  th,
  td {
    white-space: nowrap;
  }
`

type EnrolledMemberProps = {
  id: string
  name: string
  email: string
  pictureUrl: string | null
  remainingCoins: number
  availableCouponsCount: number
  lastMemberNote: {
    id: string
    author: {
      id: string
      name: string
      email: string
    }
    createdAt: Date
  } | null
  endedAt: Date
}

const ExpiringSoonMembersBlock: React.VFC = () => {
  const [expiredAt, setExpiredAt] = useState(moment().add(1, 'weeks').endOf('day'))

  const handleChange = (value: string) => {
    switch (value) {
      case 'one-week':
        setExpiredAt(moment().add(1, 'weeks').endOf('day'))
        break
      case 'two-weeks':
        setExpiredAt(moment().add(2, 'weeks').endOf('day'))
        break
      case 'one-month':
        setExpiredAt(moment().add(1, 'months').endOf('day'))
        break
      case 'two-months':
        setExpiredAt(moment().add(2, 'months').endOf('day'))
        break
      case 'three-months':
        setExpiredAt(moment().add(3, 'months').endOf('day'))
        break
    }
  }

  return (
    <AdminBlock>
      <AdminBlockTitle>即將到期的私塾學員</AdminBlockTitle>

      <Select<string> className="mb-4" style={{ width: '100%' }} onChange={handleChange}>
        <Select.Option value="one-week">一週內</Select.Option>
        <Select.Option value="two-weeks">兩週內</Select.Option>
        <Select.Option value="one-month">一個月內</Select.Option>
        <Select.Option value="two-months">兩個月內</Select.Option>
        <Select.Option value="three-months">三個月內</Select.Option>
      </Select>

      <ResultBlock expiredAt={expiredAt} />
    </AdminBlock>
  )
}

const ResultBlock: React.VFC<{
  expiredAt: Moment
}> = ({ expiredAt }) => {
  const { loadingMembers, errorMembers, members } = useExpiringSoonMembers(expiredAt)
  if (loadingMembers) {
    return <Skeleton active />
  }

  if (errorMembers) {
    return <div>讀取錯誤</div>
  }

  const handleExport = () => {
    const data: string[][] = [
      ['學員姓名', '學員信箱', '剩餘點數', '剩餘諮詢次數', '專案到期日', '上次聯繫人員', '上次聯繫時間'],
      ...members.map(member => [
        member.name,
        member.email,
        `${member.remainingCoins}`,
        `${member.availableCouponsCount}`,
        dateFormatter(member.endedAt),
        member.lastMemberNote?.author.name || '',
        member.lastMemberNote ? dateFormatter(member.lastMemberNote.createdAt) : '',
      ]),
    ]
    downloadCSV(`expiring-soon-${expiredAt.format('YYYYMMDD')}.csv`, toCSV(data))
  }

  const columns: ColumnsType<EnrolledMemberProps> = [
    {
      key: 'name',
      title: '學員姓名',
      render: (_, record) => (
        <div className="d-flex align-items-center">
          <AvatarImage size="36px" src={record.pictureUrl} className="flex-shrink-0 mr-2" />
          <div className="flex-grow-1">
            <StyledMemberName>{record.name}</StyledMemberName>
            <StyledMemberEmail>{record.email}</StyledMemberEmail>
          </div>
        </div>
      ),
    },
    {
      key: 'coins',
      title: '剩餘點數',
      render: (_, record) => record.remainingCoins,
    },
    {
      key: 'coupons',
      title: '剩餘諮詢次數',
      render: (_, record) => record.availableCouponsCount,
    },
    {
      key: 'endedAt',
      title: '專案到期日',
      render: (_, record) => (
        <>
          <span>{dateFormatter(record.endedAt)}</span>
          <br />
          <span>剩下約 {moment(record.endedAt).diff(moment(), 'days')} 天</span>
        </>
      ),
    },
    {
      key: 'lastContactMember',
      title: '上次聯繫人員',
      render: (_, record) => record.lastMemberNote?.author.name,
    },
    {
      key: 'lastContactAt',
      title: '上次聯繫時間',
      render: (_, record) =>
        record.lastMemberNote?.createdAt ? (
          <>
            <span>{dateFormatter(record.lastMemberNote.createdAt)}</span>
            <br />
            <span>{moment(record.lastMemberNote.createdAt).fromNow()}</span>
          </>
        ) : null,
    },
  ]

  return (
    <StyledTableWrapper>
      <Button type="primary" icon={<ExportOutlined />} onClick={handleExport}>
        匯出
      </Button>
      <Table<EnrolledMemberProps>
        rowKey="id"
        rowClassName="no-wrap"
        columns={columns}
        dataSource={members}
        pagination={false}
        scroll={{ x: true }}
      />
    </StyledTableWrapper>
  )
}

const useExpiringSoonMembers = (expiredAt: Moment) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_EXPIRING_SOON_MEMBERS,
    hasura.GET_EXPIRING_SOON_MEMBERSVariables
  >(
    gql`
      query GET_EXPIRING_SOON_MEMBERS($expiredAt: timestamptz!) {
        project_plan_enrollment(
          where: { project_plan: { title: { _like: "%私塾方案%" } }, ended_at: { _lte: $expiredAt } }
          order_by: [{ ended_at: asc }]
        ) {
          member {
            id
            name
            username
            email
            picture_url
            coin_statuses_aggregate {
              aggregate {
                sum {
                  remaining
                }
              }
            }
            coupons_aggregate(
              where: {
                status: { outdated: { _eq: false }, used: { _eq: false } }
                coupon_code: { coupon_plan: { title: { _eq: "學米諮詢券" } } }
              }
            ) {
              aggregate {
                count
              }
            }
            member_notes(order_by: [{ created_at: desc }], limit: 1) {
              id
              author {
                id
                name
                email
              }
              created_at
            }
          }
          started_at
          ended_at
        }
      }
    `,
    {
      variables: {
        expiredAt,
      },
    },
  )

  const members: EnrolledMemberProps[] =
    data?.project_plan_enrollment.map(v => ({
      id: v.member?.id || '',
      name: v.member?.name || v.member?.username || '',
      email: v.member?.email || '',
      pictureUrl: v.member?.picture_url || null,
      remainingCoins: v.member?.coin_statuses_aggregate.aggregate?.sum?.remaining || 0,
      availableCouponsCount: v.member?.coupons_aggregate.aggregate?.count || 0,
      lastMemberNote: v.member?.member_notes[0]
        ? {
            id: v.member.member_notes[0].id,
            author: {
              id: v.member.member_notes[0].author.id,
              name: v.member.member_notes[0].author.name,
              email: v.member.member_notes[0].author.email,
            },
            createdAt: new Date(v.member.member_notes[0].created_at),
          }
        : null,
      endedAt: new Date(v.ended_at),
    })) || []

  return {
    loadingMembers: loading,
    errorMembers: error,
    members,
    refetchMembers: refetch,
  }
}

export default ExpiringSoonMembersBlock
