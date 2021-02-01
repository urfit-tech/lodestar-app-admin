import { SearchOutlined } from '@ant-design/icons'
import { Button, Checkbox, Input, Skeleton, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { SorterResult, SortOrder } from 'antd/lib/table/interface'
import AdminCard from 'lodestar-app-admin/src/components/admin/AdminCard'
import { AvatarImage } from 'lodestar-app-admin/src/components/common/Image'
import { useAuth } from 'lodestar-app-admin/src/contexts/AuthContext'
import { currencyFormatter } from 'lodestar-app-admin/src/helpers'
import { commonMessages } from 'lodestar-app-admin/src/helpers/translation'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { memberContractMessages } from '../helpers/translation'
import { useMemberContractCollection } from '../hooks'
import { DateRangeType, MemberContractProps, StatusType } from '../types/memberContract'
import MemberContractFieldSelector from './MemberContractFieldSelector'
import MemberContractFilterSelector from './MemberContractFilterSelector'
import MemberContractModal from './MemberContractModal'
import MemberName from './MemberName'

type ColorType = 'gray' | 'error' | 'warning' | 'success'

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
const StyledSubText = styled.div`
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.6px;
  color: var(--gray-dark);
`
const TableWrapper = styled.div`
  .ant-table-cell {
    white-space: nowrap;
  }
`

const fixedColumnKeys = ['agreedAt', 'revokedAt']

const MemberContractCollectionTable: React.FC<{
  variant: 'agreed' | 'revoked'
}> = ({ variant }) => {
  const { formatMessage } = useIntl()
  const { currentMemberId, currentUserRole } = useAuth()
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
    startedAt: moment().startOf('month').toDate(),
    endedAt: moment().endOf('month').toDate(),
  })
  const [sortOrder, setSortOrder] = useState<{
    agreedAt: SortOrder
    revokedAt: SortOrder
    startedAt: SortOrder
  }>({
    agreedAt: 'descend',
    revokedAt: null,
    startedAt: null,
  })
  const {
    loadingMemberContracts,
    errorMemberContracts,
    memberContracts,
    loadMoreMemberContracts,
    refetchMemberContracts,
  } = useMemberContractCollection({
    ...filter,
    sortOrder,
    isRevoked: variant === 'revoked',
    authorId: currentUserRole === 'general-member' ? currentMemberId : null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [activeMemberContractId, setActiveMemberContractId] = useState<string | null>(null)
  const [visibleFields, setVisibleFields] = useState<string[]>([
    'member',
    'studentCertification',
    'startedAt',
    'authorName',
    'price',
    'projectPlanName',
    'note',
    'status',
    'paymentMethod',
    'paymentNumber',
    'orderExecutors',
  ])

  if (loadingMemberContracts && errorMemberContracts) {
    return <Skeleton />
  }

  const activeMemberContract = memberContracts.find(v => v.id === activeMemberContractId)

  const getColumnSearchProps = ({
    onReset,
    onSearch,
  }: {
    onReset: (clearFilters: any) => void
    onSearch: (selectedKeys?: React.ReactText[], confirm?: () => void) => void
  }): ColumnProps<MemberContractProps> => ({
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

  const columns: ColumnProps<MemberContractProps>[] = [
    {
      title: formatMessage(memberContractMessages.label.agreedAt),
      dataIndex: 'agreedAt',
      key: 'agreedAt',
      sorter: true,
      render: agreedAt => moment(agreedAt).format('YYYY-MM-DD'),
    },
    variant === 'revoked'
      ? {
          title: formatMessage(memberContractMessages.label.revokedAt),
          dataIndex: 'revokedAt',
          key: 'revokedAt',
          sorter: true,
          render: revokedAt => moment(revokedAt).format('YYYY-MM-DD'),
        }
      : {
          title: formatMessage(memberContractMessages.label.status),
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
          render: (text, record, index) => {
            const status: {
              color: ColorType
              text: string
              time: Date | null
            } = record.loanCanceledAt
              ? {
                  color: 'gray',
                  text: formatMessage(commonMessages.ui.cancel),
                  time: record.loanCanceledAt,
                }
              : record.approvedAt
              ? record.refundAppliedAt
                ? {
                    color: 'error',
                    text: formatMessage(memberContractMessages.label.refundApply),
                    time: record.refundAppliedAt,
                  }
                : {
                    color: 'success',
                    text: formatMessage(memberContractMessages.status.approvedApproval),
                    time: record.approvedAt,
                  }
              : {
                  color: 'warning',
                  text: formatMessage(memberContractMessages.status.pendingApproval),
                  time: record.agreedAt,
                }
            return (
              <div className="d-flex align-items-center">
                <StyledDot color={status.color} className="mr-2" />
                <div>
                  <div>{status.text}</div>
                  <StyledSubText>{status.time && moment(status.time).format('YYYY-MM-DD')}</StyledSubText>
                </div>
              </div>
            )
          },
        },
    {
      title: '審核通過日期',
      key: 'approvedAt',
      render: (text, record, index) => (record.approvedAt ? moment(record.approvedAt).format('YYYY-MM-DD') : ''),
    },
    {
      title: '取消日期',
      key: 'loanCanceledAt',
      render: (text, record, index) =>
        record.loanCanceledAt ? moment(record.loanCanceledAt).format('YYYY-MM-DD') : '',
    },
    {
      title: '提出退費日期',
      key: 'refundAppliedAt',
      render: (text, record, index) =>
        record.refundAppliedAt ? moment(record.refundAppliedAt).format('YYYY-MM-DD') : '',
    },

    // member
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
      title: formatMessage(memberContractMessages.label.proofOfEnrollment),
      dataIndex: 'studentCertification',
      key: 'studentCertification',
      render: studentCertification => (studentCertification ? '有' : '無'),
    },
    {
      title: '承辦人',
      dataIndex: 'managerName',
      key: 'managerName',
      render: (text, record, index) => record.manager?.name || '',
    },

    // contract
    {
      title: '合約編號',
      dataIndex: 'id',
      key: 'contractId',
    },
    {
      title: formatMessage(memberContractMessages.label.serviceStartedAt),
      dataIndex: 'startedAt',
      key: 'startedAt',
      sorter: true,
      render: startedAt => moment(startedAt).format('YYYY-MM-DD HH:MM'),
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
    },
    {
      title: formatMessage(memberContractMessages.label.price),
      dataIndex: 'price',
      key: 'price',
      render: price => currencyFormatter(price),
    },
    {
      title: formatMessage(memberContractMessages.label.product),
      dataIndex: 'projectPlanName',
      key: 'projectPlanName',
    },
    {
      title: formatMessage(memberContractMessages.label.remarks),
      dataIndex: 'note',
      key: 'note',
    },

    // payment
    {
      title: formatMessage(memberContractMessages.label.paymentMethod),
      key: 'paymentMethod',
      render: (text, record, index) => record.paymentOptions?.paymentMethod,
    },
    {
      title: '期數',
      key: 'installmentPlan',
      render: (text, record, index) => record.paymentOptions?.installmentPlan,
    },
    {
      title: formatMessage(memberContractMessages.label.paymentNumber),
      key: 'paymentNumber',
      render: (text, record, index) => record.paymentOptions?.paymentNumber,
    },
    {
      title: formatMessage(memberContractMessages.label.revenueShare),
      dataIndex: 'orderExecutors',
      key: 'orderExecutors',
      render: (text, record, index) =>
        record.orderExecutors?.map(({ memberId, ratio }, index) => (
          <div>
            <MemberName key={index} memberId={memberId} />
            <span className="ml-2">{Math.floor(ratio * 100)}%</span>
          </div>
        )),
    },

    // marketing
    {
      title: '最後填單行銷活動',
      dataIndex: 'lastActivity',
      key: 'lastActivity',
    },
    {
      title: '最後填單廣告組合',
      dataIndex: 'lastAdPackage',
      key: 'lastAdPackage',
    },
    {
      title: '最後填單廣告素材',
      dataIndex: 'lastAdMaterial',
      key: 'lastAdMaterial',
    },
    {
      title: '會員建立日期',
      key: 'memberCreatedAt',
      render: (text, record, index) => moment(record.member.createdAt).format('YYYY-MM-DD HH:MM'),
    },
    {
      title: '首次填單日期',
      dataIndex: 'firstFilledAt',
      key: 'firstFilledAt',
    },
    {
      title: '最後填單日期',
      dataIndex: 'lastFilledAt',
      key: 'lastFilledAt',
    },
  ]

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <MemberContractFilterSelector
          dateRangeType={filter.dateRangeType}
          onSetDateRangeType={dateRangeType => {
            setFilter({ ...filter, dateRangeType })
          }}
          startedAt={filter.startedAt}
          endedAt={filter.endedAt}
          onSetRange={({ startedAt, endedAt }) => setFilter({ ...filter, startedAt, endedAt })}
        />
        <MemberContractFieldSelector value={visibleFields} onChange={value => setVisibleFields(value)} />
      </div>

      <AdminCard>
        <MemberContractModal
          isRevoked={variant === 'revoked'}
          memberContractId={activeMemberContract?.id}
          memberId={activeMemberContract?.member.id}
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
            loanCanceledAt: activeMemberContract?.loanCanceledAt,
            refundAppliedAt: activeMemberContract?.refundAppliedAt,
          }}
          paymentOptions={activeMemberContract?.paymentOptions}
          note={activeMemberContract?.note}
          orderExecutors={activeMemberContract?.orderExecutors}
          studentCertification={activeMemberContract?.studentCertification}
          onRefetch={refetchMemberContracts}
          renderTrigger={({ setVisible }) => (
            <TableWrapper>
              <Table<MemberContractProps>
                columns={columns.filter(
                  column =>
                    fixedColumnKeys.includes(column.key as string) || visibleFields.includes(column.key as string),
                )}
                dataSource={memberContracts}
                scroll={{ x: true }}
                rowKey={row => row.id}
                rowClassName="cursor-pointer"
                onRow={record => ({
                  onClick: () => {
                    setActiveMemberContractId(record.id)
                    setVisible(true)
                  },
                })}
                onChange={(pagination, filters, sorter) => {
                  const newSorter = sorter as SorterResult<MemberContractProps>
                  setSortOrder({
                    agreedAt: null,
                    revokedAt: null,
                    startedAt: null,
                    [newSorter.field as 'agreedAt' | 'revokedAt' | 'startedAt']: newSorter.order || null,
                  })
                }}
                pagination={false}
              />
            </TableWrapper>
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
