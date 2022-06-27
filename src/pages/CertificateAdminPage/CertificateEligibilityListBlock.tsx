import { SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Button, Input, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import moment from 'moment'
import React, { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import AdminCard from '../../components/admin/AdminCard'
import { AvatarImage } from '../../components/common/Image'
import MemberImportModal from '../../components/member/MemberImportModal'
import hasura from '../../hasura'
import pageMessages from '../translation'

const TableWrapper = styled.div`
  overflow-x: auto;
  th {
    white-space: nowrap;
  }
  td {
    color: var(--gray-darker);
  }
`
const StyledMemberName = styled.span`
  color: var(--gray-darker);
  font-size: 16px;
  white-space: nowrap;
`

type MemberCertificate = {
  id: string
  memberId: string
  name: string
  email: string
  avatarUrl: string | null
  number: string
  deliveredAt: Date | null
  expiredAt: Date | null
}

const CertificateEligibilityListBlock: React.FC = () => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)

  const [fieldFilter, setFieldFilter] = useState<{
    name?: string
    email?: string
    number?: string
    deliveredAt?: string
    expiredAt?: string
  }>({})

  const {
    loading: loadingMemberCertificates,
    memberCertificates,
    error,
    refetch,
    loadMoreMemberCertificates,
  } = useMemberTemplate({
    ...fieldFilter,
  })

  const searchInputRef = useRef<Input | null>(null)
  const setFilter = (columnId: string, value: string | null, isProperty?: boolean) => {
    if (isProperty) {
      setFieldFilter(filter => ({ ...filter, properties: { [columnId]: value ?? undefined } }))
    } else {
      setFieldFilter(filter => ({
        ...filter,
        [columnId]: value ?? undefined,
      }))
    }
  }

  const getColumnSearchProps: (
    field: keyof typeof fieldFilter,
    isProperty?: boolean,
  ) => ColumnProps<MemberCertificate> = (columnId, isProperty) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-2">
        <Input
          ref={searchInputRef}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => {
            confirm()
            setFilter(columnId, selectedKeys[0] as string, isProperty)
          }}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <div>
          <Button
            type="primary"
            onClick={() => {
              confirm()
              setFilter(columnId, selectedKeys[0] as string, isProperty)
            }}
            icon={<SearchOutlined />}
            size="small"
            className="mr-2"
            style={{ width: 90 }}
          >
            {formatMessage(pageMessages['*'].search)}
          </Button>
          <Button
            onClick={() => {
              clearFilters && clearFilters()
              setFilter(columnId, null, isProperty)
            }}
            size="small"
            style={{ width: 90 }}
          >
            {formatMessage(pageMessages['*'].reset)}
          </Button>
        </div>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilterDropdownVisibleChange: visible => visible && setTimeout(() => searchInputRef.current?.select(), 100),
  })

  const columns: ColumnProps<MemberCertificate>[] = [
    {
      title: formatMessage(pageMessages['*'].memberName),
      dataIndex: 'name',
      key: 'name',
      render: (text, record, index) => (
        <div className="d-flex align-items-center">
          <AvatarImage size="32px" src={record.avatarUrl} className="mr-3" />
          <StyledMemberName>{record.name}</StyledMemberName>
        </div>
      ),
      ...getColumnSearchProps('name'),
    },
    {
      title: formatMessage(pageMessages['*'].memberEmail),
      dataIndex: 'email',
      key: 'email',
      ...getColumnSearchProps('email'),
    },
    {
      title: formatMessage(pageMessages['*'].certificateNumber),
      dataIndex: 'number',
      key: 'number',
      ...getColumnSearchProps('number'),
    },
    {
      title: formatMessage(pageMessages['*'].deliveryDate),
      dataIndex: 'deliveredAt',
      key: 'deliveredAt',
      render: (text, record, index) => (record.deliveredAt ? moment(record.deliveredAt).format('YYYY-MM-DD') : ''),
      sorter: (a, b) => (a.deliveredAt ? a.deliveredAt.getTime() : 0) - (b.deliveredAt ? b.deliveredAt.getTime() : 0),
    },
    {
      title: formatMessage(pageMessages['*'].expiryDate),
      dataIndex: 'expiredAt',
      key: 'expiredAt',
      render: (text, record, index) => (record.expiredAt ? moment(record.expiredAt).format('YYYY-MM-DD') : '永久有效'),
      sorter: (a, b) => (a.expiredAt ? a.expiredAt.getTime() : 0) - (b.expiredAt ? b.expiredAt.getTime() : 0),
    },
  ]

  // error status
  if (error) {
    return <>{formatMessage(pageMessages['*'].fetchDataError)}</>
  }

  return (
    <>
      <div className="d-flex justify-content-end mb-4">
        <MemberImportModal />
      </div>

      <AdminCard className="mb-5">
        <TableWrapper>
          <Table<MemberCertificate>
            columns={columns}
            rowKey="id"
            loading={loadingMemberCertificates}
            dataSource={memberCertificates}
            pagination={false}
            rowClassName={() => 'cursor-pointer'}
            onRow={record => ({
              onClick: () => window.open(`${process.env.PUBLIC_URL}/members/${record.memberId}`, '_blank'),
            })}
          />
        </TableWrapper>

        {!loadingMemberCertificates && loadMoreMemberCertificates && (
          <div className="text-center mt-4">
            <Button
              loading={loading}
              onClick={() => {
                setLoading(true)
                loadMoreMemberCertificates().finally(() => setLoading(false))
              }}
            >
              {formatMessage(pageMessages['*'].showMore)}
            </Button>
          </div>
        )}
      </AdminCard>
    </>
  )
}

const useMemberTemplate = (filter?: { name?: string; email?: string; number?: string }) => {
  const condition: hasura.GET_MEMBER_CERTIFICATEVariables['condition'] = {
    member:
      filter?.name || filter?.email
        ? {
            name: filter?.name ? { _like: `%${filter.name}%` } : undefined,
            email: filter?.email ? { _like: `%${filter.email}%` } : undefined,
          }
        : undefined,
    number: filter?.number ? { _like: `%${filter.number}%` } : undefined,
  }

  const { loading, error, data, refetch, fetchMore } = useQuery<
    hasura.GET_MEMBER_CERTIFICATE,
    hasura.GET_MEMBER_CERTIFICATEVariables
  >(
    gql`
      query GET_MEMBER_CERTIFICATE($condition: member_certificate_bool_exp, $limit: Int) {
        member_certificate_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
        member_certificate(where: $condition, limit: $limit) {
          id
          member {
            id
            email
            name
            picture_url
          }
          number
          delivered_at
          expired_at
        }
      }
    `,
    {
      variables: {
        condition,
        limit: 10,
      },
    },
  )
  const memberCertificates: MemberCertificate[] =
    data?.member_certificate.map(v => ({
      id: v.id,
      memberId: v.member?.id || '',
      name: v.member?.name || '',
      email: v.member?.email || '',
      avatarUrl: v.member?.picture_url || null,
      number: v.number,
      deliveredAt: new Date(v.delivered_at),
      expiredAt: v.expired_at ? new Date(v.expired_at) : null,
    })) || []

  const loadMore = () =>
    fetchMore({
      variables: {
        condition: {
          ...condition,
          id: { _gt: data?.member_certificate.slice(-1)[0]?.id },
        },
        limit: 10,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev
        }
        return {
          member_certificate_aggregate: fetchMoreResult.member_certificate_aggregate,
          member_certificate: [...prev.member_certificate, ...fetchMoreResult.member_certificate],
        }
      },
    })

  return {
    loading,
    error,
    memberCertificates,
    refetch,
    loadMoreMemberCertificates: (data?.member_certificate_aggregate.aggregate?.count || 0) > 10 ? loadMore : undefined,
  }
}

export default CertificateEligibilityListBlock
