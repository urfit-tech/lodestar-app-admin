import { SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Button, Input, Skeleton, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import { commonMessages } from 'lodestar-app-admin/src/helpers/translation'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { memberContractMessages } from '../helpers/translation'
import { MemberContractProps } from '../types'
import types from '../types.d'
import MemberContractModal from './MemberContractModal'

const StyledFilterButton = styled(Button)`
  height: 36px;
  width: 90px;
`
const StyledFilterInput = styled(Input)`
  width: 188px;
`

type DataSourceProps = any

const MemberContractCollectionTable: React.FC<{
  variant: 'agreed' | 'revoked'
}> = ({ variant }) => {
  const { formatMessage } = useIntl()
  const [filterCondition, setFilterCondition] = useState()
  const { loadingMemberContracts, errorMemberContracts, memberContracts, loadMoreMemberContracts } = useMemberContract(
    variant,
  ) // TODO: filterCondition + variant
  const [isLoading, setIsLoading] = useState(false)
  const [activeMemberContractId, setActiveMemberContractId] = useState<string | null>(null)

  const [filter, setFilter] = useState<{
    name: string | null
    field: string | null
    speciality: string | null
  }>({
    name: null,
    field: null,
    speciality: null,
  })

  const dataSource: DataSourceProps = memberContracts.map(v => ({
    agreedAt: v.agreedAt,
    revokedAt: v.revokedAt,
    status: v.loanCancelAt
      ? {
          text: formatMessage(memberContractMessages.label.loanCancelAt),
          time: v.loanCancelAt,
        }
      : v.approvedAt
      ? v.refundApplyAt
        ? { text: formatMessage(memberContractMessages.label.refundApplyAt), time: v.refundApplyAt }
        : { text: formatMessage(memberContractMessages.status.approvedApproval), time: v.approvedAt }
      : { text: formatMessage(memberContractMessages.status.pendingApproval), time: null },
    startedAt: v.startedAt,
    authorId: v.authorId,
    member: v.member,
    price: v.price,
    projectPlanName: v.projectPlanName,
    paymentMethod: v.paymentOptions?.paymentMethod,
    paymentNumber: v.paymentOptions?.paymentNumber,
    note: v.note,
    orderExecutors: v.orderExecutors,
    hasStudentCertification: !!v.studentCertification,
  }))

  const activeMemberContract = memberContracts.find(v => v.id === activeMemberContractId) || memberContracts[0]

  // TODO: extract getColumnSearchProps & column
  const getColumnSearchProps = ({
    onReset,
    onSearch,
  }: {
    onReset: (clearFilters: any) => void
    onSearch: (selectedKeys?: React.ReactText[], confirm?: () => void) => void
  }): ColumnProps<DataSourceProps> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-2">
        <StyledFilterInput
          autoFocus
          value={selectedKeys?.[0]}
          onChange={e => setSelectedKeys?.(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => onSearch(selectedKeys, confirm)}
          className="mb-2 d-block"
        />
        <StyledFilterButton
          className="mr-2"
          type="primary"
          size="small"
          onClick={() => onSearch(selectedKeys, confirm)}
        >
          {formatMessage(commonMessages.ui.search)}
        </StyledFilterButton>
        <StyledFilterButton size="small" onClick={() => onReset(clearFilters)}>
          {formatMessage(commonMessages.ui.reset)}
        </StyledFilterButton>
      </div>
    ),
    filterIcon: <SearchOutlined />,
  })
  const columns: ColumnProps<DataSourceProps>[] = [
    {
      title: formatMessage(memberContractMessages.label.agreedAt),
      dataIndex: 'agreedAt',
      key: 'agreedAt',
      sorter: (a, b) => 1,
      render: agreedAt => (
        <div className="d-flex align-items-center justify-content-start">
          <span className="pl-1">{moment(agreedAt).format('YYYY-MM-DD')}</span>
        </div>
      ),
    },
    variant === 'revoked'
      ? {
          title: formatMessage(memberContractMessages.label.revokedAt),
          dataIndex: 'revokedAt',
          key: 'revokedAt',
          sorter: (a, b) => 1,
          render: name => (
            <div className="d-flex align-items-center justify-content-start">
              <span className="pl-1">{name}</span>
            </div>
          ),
        }
      : {
          title: formatMessage(memberContractMessages.label.status),
          dataIndex: 'status',
          key: 'status',
          filters: [
            {
              text: formatMessage(memberContractMessages.status.approvedApproval),
              value: formatMessage(memberContractMessages.status.approvedApproval),
            },
            {
              text: formatMessage(memberContractMessages.status.applyRefund),
              value: formatMessage(memberContractMessages.status.applyRefund),
            },
            {
              text: formatMessage(memberContractMessages.status.pendingApproval),
              value: formatMessage(memberContractMessages.status.pendingApproval),
            },
            {
              text: formatMessage(commonMessages.ui.cancel),
              value: formatMessage(commonMessages.ui.cancel),
            },
          ],
          onFilter: value => true,
          render: status => (
            <div className="d-flex align-items-center justify-content-start">
              <span className="pl-1">
                {status.text} {status.time}
              </span>
            </div>
          ),
        },
    {
      title: formatMessage(memberContractMessages.label.serviceStartedAt),
      dataIndex: 'startedAt',
      key: 'startedAt',
      sorter: (a, b) => 1,
      render: startedAt => (
        <div className="d-flex align-items-center justify-content-start">
          <span className="pl-1">{moment(startedAt).format('YYYY-MM-DD')}</span>
        </div>
      ),
    },
    {
      title: formatMessage(memberContractMessages.label.contractCreator),
      dataIndex: 'authorId',
      key: 'authorId',
      ...getColumnSearchProps({
        onReset: clearFilters => {
          clearFilters()
          setFilter({ ...filter, name: null })
        },
        onSearch: ([searchText] = []) =>
          setFilter({
            ...filter,
            name: searchText as string,
          }),
      }),
      render: authorId => (
        <div className="d-flex align-items-center justify-content-start">
          <span className="pl-1">{authorId}</span>
        </div>
      ),
    },
    {
      title: `${formatMessage(memberContractMessages.label.studentName)} / Email`,
      dataIndex: 'member',
      key: 'member',
      ...getColumnSearchProps({
        onReset: clearFilters => {
          clearFilters()
          setFilter({ ...filter, name: null })
        },
        onSearch: ([searchText] = []) =>
          setFilter({
            ...filter,
            name: searchText as string,
          }),
      }),
      render: member => (
        <div className="d-flex align-items-center justify-content-start">
          <span className="pl-1">{member.name}</span>
        </div>
      ),
    },
    {
      title: formatMessage(memberContractMessages.label.agreedAt),
      dataIndex: 'price',
      key: 'price',

      render: price => (
        <div className="d-flex align-items-center justify-content-start">
          <span className="pl-1">{price}</span>
        </div>
      ),
    },
    {
      title: formatMessage(memberContractMessages.label.product),
      dataIndex: 'projectPlanName',
      key: 'projectPlanName',
      render: projectPlanName => (
        <div className="d-flex align-items-center justify-content-start">
          <span className="pl-1">{projectPlanName}</span>
        </div>
      ),
    },
    {
      title: formatMessage(memberContractMessages.label.paymentMethod),
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: paymentMethod => (
        <div className="d-flex align-items-center justify-content-start">
          <span className="pl-1">{paymentMethod}</span>
        </div>
      ),
    },
    {
      title: formatMessage(memberContractMessages.label.paymentNumber),
      dataIndex: 'paymentNumber',
      key: 'paymentNumber',
      render: paymentNumber => (
        <div className="d-flex align-items-center justify-content-start">
          <span className="pl-1">{paymentNumber}</span>
        </div>
      ),
    },
    {
      title: formatMessage(memberContractMessages.label.remarks),
      dataIndex: 'note',
      key: 'note',
      render: note => (
        <div className="d-flex align-items-center justify-content-start">
          <span className="pl-1">{note}</span>
        </div>
      ),
    },
    {
      title: formatMessage(memberContractMessages.label.revenueShare),
      dataIndex: 'orderExecutors',
      key: 'orderExecutors',
      render: orderExecutors => (
        <div className="d-flex align-items-center justify-content-start">
          <span className="pl-1">{orderExecutors.memberId}</span>
        </div>
      ),
    },
    {
      title: formatMessage(memberContractMessages.label.proofOfEnrollment),
      dataIndex: 'hasStudentCertification',
      key: 'hasStudentCertification',

      render: hasStudentCertification => (
        <div className="d-flex align-items-center justify-content-start">
          <span className="pl-1">{hasStudentCertification}</span>
        </div>
      ),
    },
  ]

  if (loadingMemberContracts) {
    return <Skeleton />
  }

  if (!activeMemberContract) {
    return (
      <Table columns={columns} dataSource={dataSource} scroll={{ x: columns.length * 16 * 12 }} pagination={false} />
    )
  }

  return (
    <>
      <MemberContractModal
        memberContractId={activeMemberContract.id}
        member={activeMemberContract.invoice}
        purchasedItem={{
          projectPlanName: activeMemberContract.projectPlanName,
          price: activeMemberContract.price,
          coinAmount: activeMemberContract.coinAmount,
          couponCount: activeMemberContract.couponCount,
          appointmentCreatorId: activeMemberContract.appointmentCreatorId,
          referralMemberId: activeMemberContract.referralMemberId,
          startedAt: activeMemberContract.startedAt,
          endedAt: activeMemberContract.endedAt,
        }}
        status={{
          approvedAt: activeMemberContract.approvedAt,
          loanCancelAt: activeMemberContract.loanCancelAt,
          refundApplyAt: activeMemberContract.refundApplyAt,
        }}
        paymentOptions={activeMemberContract.paymentOptions}
        note={activeMemberContract.note}
        orderExecutors={activeMemberContract.orderExecutors}
        renderTrigger={({ setVisible }) => (
          <Table
            columns={columns}
            dataSource={dataSource}
            scroll={{ x: columns.length * 16 * 12 }}
            onRow={record => ({
              onClick: () => {
                setActiveMemberContractId(record.id)
                setVisible(true)
              },
            })}
            pagination={false}
          />
        )}
      />
      {loadMoreMemberContracts && (
        <div className="text-center mt-4">
          <Button
            loading={isLoading}
            onClick={() => {
              setIsLoading(true)
              loadMoreMemberContracts()
                .catch()
                .finally(() => setIsLoading(false))
            }}
          >
            {formatMessage(commonMessages.ui.showMore)}
          </Button>
        </div>
      )}
    </>
  )
}

const useMemberContract = ({}) => {
  const condition: types.GET_MEMBER_CONTRACTVariables['condition'] = {}
  const { loading, data, error, refetch, fetchMore } = useQuery<
    types.GET_MEMBER_CONTRACT,
    types.GET_MEMBER_CONTRACTVariables
  >(
    gql`
      query GET_MEMBER_CONTRACT($condition: member_contract_bool_exp, $limit: Int) {
        member_contract(where: $condition, limit: $limit) {
          id
          author_id
          member {
            id
            name
            picture_url
            email
          }
          started_at
          ended_at
          agreed_at
          revoked_at
          values
          options
        }
        member_contract_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
      }
    `,
    {
      variables: {
        condition,
        limit: 5,
      },
    },
  )

  const memberContracts: MemberContractProps[] =
    loading || error || !data
      ? []
      : data.member_contract.map(v => ({
          id: v.id,
          authorId: v.author_id,
          member: {
            id: v.member.id,
            name: v.member.name,
            pictureUrl: v.member.picture_url,
            email: v.member.email,
          },
          startedAt: new Date(v.started_at),
          endedAt: new Date(v.ended_at),
          agreedAt: new Date(v.agreed_at),
          revokedAt: new Date(v.revoked_at),
          approvedAt: v.options.approvedAt ? new Date(v.options.approved_at) : null,
          loanCancelAt: v.options.loanCancelAt ? new Date(v.options.loanCancelAt) : null,
          refundApplyAt: v.options.refundApplyAt ? new Date(v.options.refundApplyAt) : null,
          referralMemberId: v.options?.referralMemberId || null,
          appointmentCreatorId: v.options?.appointmentCreatorId || null,
          studentCertification: v.options?.studentCertification || null,
          invoice: v.values?.invoice || null,
          projectPlanName: v.values?.projectPlanName || null,
          price: v.values?.price || null,
          coinAmount: v.values?.coinAmount || null,
          paymentOptions: {
            paymentMethod: v.values.paymentOptions?.paymentMethod || '',
            paymentNumber: v.values.paymentOptions?.paymentNumber || '',
            installmentPlan: v.values.paymentOptions?.installmentPlan || 0,
          },
          note: v.options?.note || null,
          orderExecutors:
            v.values?.orderExecutors?.map((v: { ratio: number; member_id: string }) => ({
              ratio: v.ratio,
              memberId: v.member_id,
            })) || [],
          couponCount: v.values?.coupons.length || null,
        }))

  const loadMoreMemberContracts =
    (data?.member_contract_aggregate.aggregate?.count || 0) >= memberContracts.length
      ? () =>
          fetchMore({
            variables: {
              condition: { ...condition, started_at: { _lt: data?.member_contract.slice(-1)[0]?.started_at } },
              limit: 5,
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              return Object.assign({}, prev, {
                member_contract: [...prev.member_contract, ...fetchMoreResult.member_contract],
              })
            },
          })
      : undefined

  return {
    loadingMemberContracts: loading,
    errorMemberContracts: error,
    memberContracts,
    refetchMemberContracts: refetch,
    loadMoreMemberContracts,
  }
}

export default MemberContractCollectionTable
