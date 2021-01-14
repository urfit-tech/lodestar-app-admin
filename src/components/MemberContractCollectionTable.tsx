import { SearchOutlined } from '@ant-design/icons'
import { Button, Input, Skeleton, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { commonMessages } from 'lodestar-app-admin/src/helpers/translation'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { memberContractMessages } from '../helpers/translation'
import { useMemberContract } from '../hooks'
import MemberContractModal from './MemberContractModal'

const StyledFilterButton = styled(Button)`
  height: 36px;
  width: 90px;
`
const StyledFilterInput = styled(Input)`
  width: 188px;
`

type ColorType = 'gray' | 'warning' | 'success' | 'error'
const StyledDot = styled.span<{ color: ColorType }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ color }) => `var(--${color})`};
`
const StyledTime = styled.span`
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  color: var(--gray-dark);
`

type DataSourceProps = {
  id: string
  agreedAt: Date | null
  revokedAt: Date | null
  loanCancelAt: Date | null
  approvedAt: Date | null
  refundAppliedAt: Date | null
  status: {
    color: ColorType
    text: string
    time: Date | null
  }
  startedAt: Date
  authorId: string
  member: {
    id: string
    name: string
    pictureUrl: string | null
    email: string
  }
  price: number | null
  projectPlanName: string | null
  paymentMethod: string | null
  paymentNumber: string | null
  note: string | null
  orderExecutors:
    | {
        ratio: number
        memberId: string
      }[]
    | null
  hasStudentCertification: boolean
}

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

  const dataSource: DataSourceProps[] = memberContracts.map(v => ({
    id: v.id,
    agreedAt: v.agreedAt,
    revokedAt: v.revokedAt,
    status: v.loanCanceledAt
      ? {
          color: 'gray',
          text: formatMessage(commonMessages.ui.cancel),
          time: v.loanCanceledAt,
        }
      : v.approvedAt
      ? v.refundAppliedAt
        ? {
            color: 'error',
            text: formatMessage(memberContractMessages.label.refundApplyAt),
            time: v.refundAppliedAt,
          }
        : {
            color: 'success',
            text: formatMessage(memberContractMessages.status.approvedApproval),
            time: v.approvedAt,
          }
      : {
          color: 'warning',
          text: formatMessage(memberContractMessages.status.pendingApproval),
          time: v.agreedAt,
        },
    loanCancelAt: v.loanCanceledAt,
    approvedAt: v.approvedAt,
    refundAppliedAt: v.refundAppliedAt,
    startedAt: v.startedAt,
    authorId: v.authorId,
    member: v.member,
    price: v.price,
    projectPlanName: v.projectPlanName,
    paymentMethod: v.paymentOptions?.paymentMethod || null,
    paymentNumber: v.paymentOptions?.paymentNumber || null,
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
          render: (status, record) => {
            console.log(status.time, record.projectPlanName)
            return (
              <div className="d-flex flex-row align-items-center">
                <StyledDot color={status.color} className="mr-2" />
                <div className="d-flex flex-column">
                  <div>{status.text}</div>
                  <StyledTime>{status.time && moment(status.time).format('YYYY-MM-DD')}</StyledTime>
                </div>
              </div>
            )
          },
        },
    {
      title: formatMessage(memberContractMessages.label.serviceStartedAt),
      dataIndex: 'startedAt',
      key: 'startedAt',
      sorter: (a, b) => 1,
      render: startedAt => <span>{moment(startedAt).format('YYYY-MM-DD HH:MM')}</span>,
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
      title: formatMessage(memberContractMessages.label.price),
      dataIndex: 'price',
      key: 'price',
      render: price => <span>NT$ {price.toLocaleString('zh-TW')}</span>,
    },
    {
      title: formatMessage(memberContractMessages.label.product),
      dataIndex: 'projectPlanName',
      key: 'projectPlanName',
      render: projectPlanName => <span>{projectPlanName}</span>,
    },
    {
      title: formatMessage(memberContractMessages.label.paymentMethod),
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: paymentMethod => <span>{paymentMethod}</span>,
    },
    {
      title: formatMessage(memberContractMessages.label.paymentNumber),
      dataIndex: 'paymentNumber',
      key: 'paymentNumber',
      render: paymentNumber => <span>{paymentNumber}</span>,
    },
    {
      title: formatMessage(memberContractMessages.label.remarks),
      dataIndex: 'note',
      key: 'note',
      render: note => <span>{note}</span>,
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
      render: hasStudentCertification => <span>{hasStudentCertification ? '有' : '無'}</span>,
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
        isRevoked={variant === 'revoked'}
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
          loanCancelAt: activeMemberContract.loanCanceledAt,
          refundApplyAt: activeMemberContract.refundAppliedAt,
        }}
        paymentOptions={activeMemberContract.paymentOptions}
        note={activeMemberContract.note}
        orderExecutors={activeMemberContract.orderExecutors}
        studentCertification={activeMemberContract.studentCertification}
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

export default MemberContractCollectionTable
