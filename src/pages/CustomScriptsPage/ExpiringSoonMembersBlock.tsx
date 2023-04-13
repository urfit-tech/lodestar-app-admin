import { ExportOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/client'
import { Button, Select, Skeleton, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-tw'
import relativeTime from 'dayjs/plugin/relativeTime'
import gql from 'graphql-tag'
import { groupBy, values } from 'ramda'
import React, { useState } from 'react'
import styled from 'styled-components'
import { AdminBlock, AdminBlockTitle } from '../../components/admin'
import { AvatarImage } from '../../components/common/Image'
import hasura from '../../hasura'
import { dateFormatter, downloadCSV, toCSV } from '../../helpers'
import { useAppCustom } from '../../hooks'

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
  const [expiredAt, setExpiredAt] = useState(dayjs().add(1, 'weeks').endOf('day'))
  dayjs.extend(relativeTime)

  const handleChange = (value: string) => {
    switch (value) {
      case 'one-week':
        setExpiredAt(dayjs().add(1, 'day').endOf('day'))
        break
      case 'two-weeks':
        setExpiredAt(dayjs().add(2, 'weeks').endOf('day'))
        break
      case 'one-month':
        setExpiredAt(dayjs().add(1, 'months').endOf('day'))
        break
      case 'two-months':
        setExpiredAt(dayjs().add(2, 'months').endOf('day'))
        break
      case 'three-months':
        setExpiredAt(dayjs().add(3, 'months').endOf('day'))
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
  expiredAt: dayjs.Dayjs
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
          <span>剩下約 {dayjs(record.endedAt).diff(dayjs(), 'days')} 天</span>
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
            <span>{dayjs(record.lastMemberNote.createdAt).locale('zh-tw').fromNow()}</span>
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

const useExpiringSoonMembers = (expiredAt: dayjs.Dayjs) => {
  const appCustom = useAppCustom()
  const title = appCustom.contractProjectPlan.title

  const { data: contractProjectPlanData } = useQuery<hasura.GET_CONTRACT_PROJECT_PLAN>(gql`
    query GET_CONTRACT_PROJECT_PLAN {
      project_plan(where: { title: { _like: "%${title}%" } }) {
        id
      }
    }
  `)

  const contractProjectPlanIDs = contractProjectPlanData?.project_plan.map(v => `ProjectPlan_${v.id}`) || []

  const { loading, data, error, refetch } = useQuery<
    hasura.GET_EXPIRING_SOON_MEMBERS,
    hasura.GET_EXPIRING_SOON_MEMBERSVariables
  >(
    gql`
      query GET_EXPIRING_SOON_MEMBERS($orderProducts: [String!]!, $expiredAt: timestamptz!) {
        member_order_status(
          where: {
            product_id: { _in: $orderProducts }
            order_product_delivered_at: { _lte: "now()" }
            order_product_ended_at: { _gte: "now()", _lte: $expiredAt }
          }
          order_by: { order_product_ended_at: asc }
        ) {
          author_email
          author_id
          author_name
          coin_remaining
          coupon_count
          coupon_plan_title
          member_email
          member_id
          member_name
          member_note_created_at
          member_note_id
          order_id
          order_product_delivered_at
          order_product_ended_at
          order_product_id
          member_picture_url
          product_id
          member_username
        }
      }
    `,
    { variables: { orderProducts: contractProjectPlanIDs, expiredAt } },
  )
  const members: EnrolledMemberProps[] = values(groupBy(v => v.order_product_id, data?.member_order_status || [])).map(
    v =>
      v.reduce((accu, curr) => {
        return {
          id: curr.member_id || '',
          name: curr.member_name || curr.member_username || '',
          email: curr.member_email || '',
          pictureUrl: curr.member_picture_url || null,
          remainingCoins: curr.coin_remaining || 0,
          availableCouponsCount:
            (curr.coupon_plan_title === appCustom.contractCoupon.title
              ? curr.coupon_count
              : accu?.availableCouponsCount) || 0,
          lastMemberNote: !!curr.member_note_id
            ? {
                id: curr.member_note_id,
                author: {
                  id: curr.author_id || '',
                  name: curr.author_name || '',
                  email: curr.author_email || '',
                },
                createdAt: new Date(curr.member_note_created_at),
              }
            : null,
          endedAt: new Date(curr.order_product_ended_at),
        }
      }, {} as EnrolledMemberProps),
  )

  return {
    loadingMembers: loading,
    errorMembers: error,
    members,
    refetchMembers: refetch,
  }
}

export default ExpiringSoonMembersBlock
