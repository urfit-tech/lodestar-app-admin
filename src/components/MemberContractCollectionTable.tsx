import { SearchOutlined } from '@ant-design/icons'
import { Button, Checkbox, Input, Skeleton, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import AdminCard from 'lodestar-app-admin/src/components/admin/AdminCard'
import { AvatarImage } from 'lodestar-app-admin/src/components/common/Image'
import { commonMessages } from 'lodestar-app-admin/src/helpers/translation'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { memberContractMessages } from '../helpers/translation'
import { useMemberContract } from '../hooks'
import { DateRangeType, StatusType } from '../types'
import MemberContractFilterSelector from './MemberContractFilterSelector'
import MemberContractModal from './MemberContractModal'
import MemberName from './MemberName'

type ColorType = 'gray' | 'error' | 'warning' | 'success'

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
  authorName: string | null
  member: {
    name: string | null
    pictureUrl: string | null
    email: string | null
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

const StyledFilterButton = styled(Button)`
  height: 36px;
  width: 90px;
`
const StyledFilterInput = styled(Input)`
  width: 188px;
`
const StyledDot = styled.span<{ color: ColorType }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ color }) => `var(--${color})`};
`
const StyledSubText = styled.span`
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  color: var(--gray-dark);
`
const StyledExecutor = styled.span`
  &:nth-child(n + 2) {
    &:before {
      content: '/';
    }
  }
`

const MemberContractCollectionTable: React.FC<{
  variant: 'agreed' | 'revoked'
}> = ({ variant }) => {
  const { formatMessage } = useIntl()
  const [filter, setFilter] = useState<{
    authorName: string | null
    memberNameAndEmail: string | null
    status: StatusType[]
    dateRangeType: DateRangeType
    startedAt: Date | null
    endedAt: Date | null
  }>({
    authorName: null,
    memberNameAndEmail: null,
    status: [],
    dateRangeType: 'agreed_at',
    startedAt: moment(1997).startOf('month').toDate(),
    endedAt: moment().endOf('month').toDate(),
  })
  const { loadingMemberContracts, errorMemberContracts, memberContracts, loadMoreMemberContracts } = useMemberContract({
    ...filter,
    isRevoked: variant === 'revoked',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [activeMemberContractId, setActiveMemberContractId] = useState<string | null>(null)

  if (loadingMemberContracts && errorMemberContracts) {
    return <Skeleton />
  }

  const activeMemberContract = memberContracts.find(v => v.id === activeMemberContractId)

  const select = (
    <MemberContractFilterSelector
      dateRangeType={filter.dateRangeType}
      onSetDateRangeType={dateRangeType => {
        setFilter({ ...filter, dateRangeType })
      }}
      startedAt={filter.startedAt}
      endedAt={filter.endedAt}
      onSetRange={({ startedAt, endedAt }) => {
        setFilter({ ...filter, startedAt, endedAt })
      }}
      className="mb-4"
    />
  )

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
            text: formatMessage(memberContractMessages.label.refundApply),
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
    authorName: v.authorName,
    member: v.member,
    price: v.price,
    projectPlanName: v.projectPlanName,
    paymentMethod: v.paymentOptions?.paymentMethod || null,
    paymentNumber: v.paymentOptions?.paymentNumber || null,
    note: v.note,
    orderExecutors: v.orderExecutors,
    hasStudentCertification: !!v.studentCertification,
  }))

  const getColumnSearchProps = ({
    onReset,
    onSearch,
  }: {
    onReset: (clearFilters: any) => void
    onSearch: (selectedKeys?: React.ReactText[], confirm?: () => void) => void
  }): ColumnProps<DataSourceProps> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
      return (
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
      )
    },
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
          render: revokedAt => (
            <div className="d-flex align-items-center justify-content-start">
              <span className="pl-1">{moment(revokedAt).format('YYYY-MM-DD')}</span>
            </div>
          ),
        }
      : {
          title: formatMessage(memberContractMessages.label.status),
          dataIndex: 'status',
          key: 'status',
          filterDropdown: () => {
            const statuses = [
              {
                text: formatMessage(memberContractMessages.status.pendingApproval),
                value: 'pending',
              },
              {
                text: formatMessage(memberContractMessages.status.approvedApproval),
                value: 'approved',
              },
              {
                text: formatMessage(memberContractMessages.status.applyRefund),
                value: 'refund-applied',
              },
              {
                text: formatMessage(commonMessages.ui.cancel),
                value: 'loan-canceled',
              },
            ]
            return (
              <div>
                <Checkbox.Group
                  value={filter.status}
                  onChange={value => setFilter({ ...filter, status: value as StatusType[] })}
                >
                  {statuses.map(v => (
                    <Checkbox key={v.value} value={v.value} className="d-block mx-2 mb-2">
                      {v.text}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
                <div className="p-2 text-right">
                  <Button size="small" onClick={() => setFilter({ ...filter, status: [] })}>
                    {formatMessage(commonMessages.ui.reset)}
                  </Button>
                </div>
              </div>
            )
          },
          render: (status, record) => {
            return (
              <div className="d-flex flex-row align-items-center">
                <StyledDot color={status.color} className="mr-2" />
                <div className="d-flex flex-column">
                  <div>{status.text}</div>
                  <StyledSubText>{status.time && moment(status.time).format('YYYY-MM-DD')}</StyledSubText>
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
      dataIndex: 'authorName',
      key: 'authorName',
      ...getColumnSearchProps({
        onReset: clearFilters => {
          clearFilters()
          setFilter({ ...filter, authorName: null })
        },
        onSearch: ([searchText] = []) =>
          setFilter({
            ...filter,
            authorName: searchText as string,
          }),
      }),
      render: authorName => <span>{authorName}</span>,
    },
    {
      title: `${formatMessage(memberContractMessages.label.studentName)} / Email`,
      dataIndex: 'member',
      key: 'member',
      ...getColumnSearchProps({
        onReset: clearFilters => {
          clearFilters()
          setFilter({ ...filter, memberNameAndEmail: null })
        },
        onSearch: ([searchText] = []) =>
          setFilter({
            ...filter,
            memberNameAndEmail: searchText as string,
          }),
      }),
      render: member => (
        <div className="d-flex align-items-center">
          <AvatarImage size="36px" src={member.pictureUrl} shape="circle" className="mr-3" />
          <div className="d-flex flex-column">
            <span>{member.name}</span>
            <StyledSubText>{member.email}</StyledSubText>
          </div>
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
      render: orderExecutors =>
        orderExecutors.map((v: { memberId: string; ratio: number }) => (
          <StyledExecutor>
            <MemberName memberId={v.memberId} />
            <span>{v.ratio}</span>
          </StyledExecutor>
        )),
    },
    {
      title: formatMessage(memberContractMessages.label.proofOfEnrollment),
      dataIndex: 'hasStudentCertification',
      key: 'hasStudentCertification',
      render: hasStudentCertification => <span>{hasStudentCertification ? '有' : '無'}</span>,
    },
  ]

  return (
    <>
      {select}
      <AdminCard>
        <MemberContractModal
          isRevoked={variant === 'revoked'}
          memberContractId={activeMemberContract?.id}
          member={activeMemberContract?.invoice}
          purchasedItem={{
            projectPlanName: activeMemberContract?.projectPlanName,
            price: activeMemberContract?.price,
            coinAmount: activeMemberContract?.coinAmount,
            couponCount: activeMemberContract?.couponCount,
            appointmentCreatorName: activeMemberContract?.appointmentCreatorName,
            referral: activeMemberContract?.referral,
            startedAt: activeMemberContract?.startedAt,
            endedAt: activeMemberContract?.endedAt,
          }}
          status={{
            approvedAt: activeMemberContract?.approvedAt,
            loanCancelAt: activeMemberContract?.loanCanceledAt,
            refundApplyAt: activeMemberContract?.refundAppliedAt,
          }}
          paymentOptions={activeMemberContract?.paymentOptions}
          note={activeMemberContract?.note}
          orderExecutors={activeMemberContract?.orderExecutors}
          studentCertification={activeMemberContract?.studentCertification}
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
      </AdminCard>
    </>
  )
}

export default MemberContractCollectionTable
