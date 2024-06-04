import { SearchOutlined } from '@ant-design/icons'
import { Input, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { CustomRatioImage } from 'lodestar-app-element/src/components/common/Image'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import hasura from '../../hasura'
import { useMembershipCardCollection } from '../../hooks/membershipCard'
import EmptyCover from '../../images/default/empty-cover.png'
import { MembershipCardColumn } from '../../types/membershipCard'
import MembershipCardPageMessages from './translation'

const StyledTitle = styled.div`
  color: var(--gray-darker);
  line-height: 24px;
  letter-spacing: 0.2px;
  cursor: pointer;
`

const filterIcon = (filtered: boolean) => <SearchOutlined style={{ color: filtered ? 'var(--primary)' : undefined }} />

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
      title: formatMessage(MembershipCardPageMessages.page.titleColumn),
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
      title: formatMessage(MembershipCardPageMessages.page.validityPeriod),
      width: '30%',
      render: (_, record) => {
        return <div>{record.expiredData}</div>
      },
    },
    {
      key: 'eligibilityList',
      title: formatMessage(MembershipCardPageMessages.page.eligibilityList),
      width: '20%',
      render: (_, record) => <div>{record.sku}</div>,
    },
  ]

  if (error) {
    return <div>{formatMessage(MembershipCardPageMessages.page.fetchDataError)}</div>
  }

  return <Table<MembershipCardColumn> loading={loading} rowKey="id" columns={columns} dataSource={membershipCards} />
}

export default MembershipCardCollectionTable
