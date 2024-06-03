import { SearchOutlined } from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { Input, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import dayjs from 'dayjs'
import { CustomRatioImage } from 'lodestar-app-element/src/components/common/Image'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import hasura from '../../hasura'
import EmptyCover from '../../images/default/empty-cover.png'
import pageMessages from '../translation'

const StyledTitle = styled.div`
  color: var(--gray-darker);
  line-height: 24px;
  letter-spacing: 0.2px;
  cursor: pointer;
`

const filterIcon = (filtered: boolean) => <SearchOutlined style={{ color: filtered ? 'var(--primary)' : undefined }} />

type MembershipCardColumn = {
  id: string
  title: string
  template: string
  sku: string
  expiredType: string
  expiredData: string
  backgroundImage: string | null
}

const MembershipCardCollectionTable: React.VFC<{
  condition: hasura.GetMembershipCardCollectionVariables['condition']
}> = ({ condition }) => {
  const { formatMessage } = useIntl()
  const [searchName, setSearchName] = useState<string | null>(null)
  const { loading, error, membershipCards } = useMembershipCardCollection({
    ...condition,
    title: searchName ? { _ilike: `%${searchName}%` } : undefined,
  })

  const columns: ColumnProps<MembershipCardColumn>[] = [
    {
      key: 'title',
      title: formatMessage(pageMessages['*'].title),
      width: '50%',
      render: (_, record) => (
        <Link
          className="d-flex align-items-center justify-content-between"
          to={`/membership-card/${record.id}?tab=setting`}
        >
          <CustomRatioImage className="mr-4" width="60px" ratio={0.7} src={record.backgroundImage || EmptyCover} />
          <StyledTitle className="flex-grow-1">{record.title}</StyledTitle>
        </Link>
      ),
      filterDropdown: () => (
        <div className="p-2">
          <Input
            autoFocus
            value={searchName || ''}
            onChange={e => {
              searchName && setSearchName('')
              setSearchName(e.target.value)
            }}
          />
        </div>
      ),
      filterIcon,
    },
    {
      key: 'validityPeriod',
      title: '效期',
      width: '30%',
      render: (_, record) => {
        console.log(JSON.stringify(record))
        return <div>{record.expiredData}</div>
      },
    },
    {
      key: 'eligibilityList',
      title: '料號',
      width: '20%',
      render: (_, record) => <div>{record.sku}</div>,
    },
  ]

  if (error) {
    return <div>{formatMessage(pageMessages['*'].fetchDataError)}</div>
  }

  return <Table<MembershipCardColumn> loading={loading} rowKey="id" columns={columns} dataSource={membershipCards} />
}

const useMembershipCardCollection = (condition: hasura.GetMembershipCardCollectionVariables['condition']) => {
  const extendedCondition = {
    ...condition,
    deleted_at: { _is_null: true },
  }

  console.log(JSON.stringify(extendedCondition))

  const { loading, error, data } = useQuery<
    hasura.GetMembershipCardCollection,
    hasura.GetMembershipCardCollectionVariables
  >(GetMembershipCardCollection, {
    variables: {
      condition: extendedCondition,
    },
  })

  const formatExpiredData = (card: hasura.GetMembershipCardCollection['card'][0]): string => {
    const expiryType = card.expiry_type || 'fixed'
    if (expiryType === 'fixed') {
      const startDate = card.fixed_start_date ? dayjs(card.fixed_start_date).format('YYYY-MM-DD') : '即日起'
      const endDate = card.fixed_end_date ? dayjs(card.fixed_end_date).format('YYYY-MM-DD') : '無使用期限'
      return `${startDate} ~ ${endDate}`
    }
    if (expiryType === 'relative') {
      const periodAmount = card.relative_period_amount
      const periodType = card.relative_period_type
      let periodTypeText = ''
      if (periodType === 'Y') {
        periodTypeText = '年內'
      } else if (periodType === 'M') {
        periodTypeText = '月內'
      } else if (periodType === 'D') {
        periodTypeText = '日內'
      }
      return `${periodAmount}${periodTypeText}`
    }
    return ''
  }

  const extractBackgroundImage = (template: string): string | null => {
    const backgroundImageRegex = /background-image:\s*url\(([^)]+)\)/i
    const match = template.match(backgroundImageRegex)
    return match ? match[1] : null
  }

  const membershipCards: {
    id: string
    title: string
    template: string
    sku: string
    expiredType: string
    expiredData: string
    backgroundImage: string | null
  }[] =
    data?.card.map(v => ({
      id: v.id,
      title: v.title || '',
      template: v.template || '',
      sku: v.sku || '',
      expiredType: v.expiry_type || 'fixed',
      expiredData: formatExpiredData(v),
      backgroundImage: extractBackgroundImage(v.template || ''),
    })) || []

  return {
    loading,
    error,
    membershipCards,
  }
}

const GetMembershipCardCollection = gql`
  query GetMembershipCardCollection($condition: card_bool_exp!) {
    card(where: $condition) {
      app_id
      creator_id
      description
      sku
      template
      title
      id
      fixed_start_date
      fixed_end_date
      relative_period_type
      relative_period_amount
      expiry_type
    }
  }
`

export default MembershipCardCollectionTable
