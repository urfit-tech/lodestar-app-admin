import { SearchOutlined } from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { Button, Checkbox, Input, Spin, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { SorterResult, SortOrder } from 'antd/lib/table/interface'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import { map, toPairs } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import AdminCard from '../../components/admin/AdminCard'
import { AvatarImage } from '../../components/common/Image'
import MemberNameLabel from '../../components/common/MemberNameLabel'
import MemberPropertyLabel from '../../components/common/MemberPropertyLabel'
import hasura from '../../hasura'
import { currencyFormatter } from '../../helpers'
import { commonMessages, memberContractMessages } from '../../helpers/translation'
import { useMemberContractCollection, useMemberContractPriceAmount } from '../../hooks'
import { DateRangeType, MemberContractProps, StatusType } from '../../types/memberContract'
import ExportContractCollectionButton from './ExportContractCollectionButton'
import MemberContractFieldSelector from './MemberContractFieldSelector'
import MemberContractFilterSelector from './MemberContractFilterSelector'
import MemberContractModal from './MemberContractModal'

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

const StyledContractAmountBlock = styled.div`
  display: flex;
  gap: 1.25%;
  overflow-x: auto;
  margin-bottom: 24px;
  padding-bottom: 12px;
`

export const MemberContractCollectionBlock: React.FC<{
  variant: 'agreed' | 'revoked'
}> = ({ variant }) => {
  const { formatMessage } = useIntl()
  const { currentMemberId, currentUserRole, permissions } = useAuth()
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
    // loadMoreMemberContracts,
    refetchMemberContracts,
  } = useMemberContractCollection({
    ...filter,
    sortOrder,
    isRevoked: variant === 'revoked',
  })
  const { memberContractPriceAmount } = useMemberContractPriceAmount({
    dateRangeType: filter.dateRangeType,
    startedAt: filter.startedAt,
    endedAt: filter.endedAt,
    memberId: permissions.READ_GROUP_CONTRACT_ALL ? currentMemberId : null,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [activeMemberContractId, setActiveMemberContractId] = useState<string | null>(null)
  const [visibleFields, setVisibleFields] = useState<string[]>([
    'agreedAt',
    'revokedAt',
    'member',
    'studentCertification',
    'startedAt',
    'authorName',
    'price',
    'projectPlanName',
    'note',
    'status',
    'recognizePerformance',
    'paymentMethod',
    'paymentNumber',
    'orderExecutors',
  ])

  const { data } = useQuery<hasura.GetUserPermissionGroupMembers, hasura.GetUserPermissionGroupMembersVariables>(
    gql`
      query GetUserPermissionGroupMembers($memberId: String!) {
        member_permission_group(where: { member_id: { _eq: $memberId } }) {
          permission_group_id
          permission_group {
            name
            permission_group_members {
              member_id
            }
          }
        }
      }
    `,
    {
      variables: {
        memberId: currentMemberId as string,
      },
    },
  )

  const permissionGroupsMembers =
    data?.member_permission_group.flatMap(v => v.permission_group.permission_group_members.map(w => w.member_id)) || []

  const displayMemberContracts = permissions.CONTRACT_VALUE_VIEW_ADMIN
    ? memberContracts
    : permissions.READ_GROUP_CONTRACT_ALL
    ? memberContracts.filter(mc => permissionGroupsMembers.includes(mc?.authorId ?? ''))
    : permissions.CONTRACT_VALUE_VIEW_NORMAL
    ? memberContracts.filter(
        mc =>
          mc.authorId === currentMemberId || mc.orderExecutors?.map(v => v.memberId)?.includes(currentMemberId || ''),
      )
    : []

  const activeMemberContract = displayMemberContracts.find(mc => mc.id === activeMemberContractId)

  const priceAmountList = map(([status, amount]) => {
    const statusConverter = {
      pending: {
        color: 'warning',
        text: formatMessage(memberContractMessages.status.pendingApproval),
      },
      approved: {
        color: 'success',
        text: formatMessage(memberContractMessages.status.approvedApproval),
      },
      'refund-applied': {
        color: 'error',
        text: formatMessage(memberContractMessages.label.refundApply),
      },
      revoked: {
        color: 'gray-darker',
        text: formatMessage(memberContractMessages.status.contractTermination),
      },
      'loan-canceled': {
        color: 'gray',
        text: formatMessage(commonMessages.ui.cancel),
      },
    }

    return {
      ...statusConverter[status],
      amount,
    }
  }, toPairs(memberContractPriceAmount))

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
            } = record.approvedAt
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
              : record.loanCanceledAt
              ? {
                  color: 'gray',
                  text: formatMessage(commonMessages.ui.cancel),
                  time: record.loanCanceledAt,
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
      title: '經銷單位',
      dataIndex: 'dealer',
      key: 'dealer',
      render: (_, record, text) => record.dealer,
    },
    {
      title: formatMessage(memberContractMessages.label.price),
      dataIndex: 'price',
      key: 'price',
      render: price => currencyFormatter(price),
    },
    {
      title: formatMessage(memberContractMessages.label.recognizePerformance),
      key: 'recognizePerformance',
      render: (text, record, index) => currencyFormatter(record.orderOptions?.recognizePerformance),
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
    { title: '代幣', key: 'coin', dataIndex: 'coinAmount' },
    { title: '諮詢次數', key: 'appointment', dataIndex: 'couponCount' },
    { title: '指定業師', key: 'appointmentCreator', render: (_, record, text) => record.appointmentCreatorName },
    { title: '介紹人', key: 'referralMember', render: (_, record, text) => record.referral.name },

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
        record.orderExecutors?.map(({ memberId, ratio }, index) => {
          return (
            <div key={memberId}>
              <MemberPropertyLabel memberId={memberId} propertyName="組別" suffix={'-'} />
              <MemberNameLabel memberId={memberId} />
              <span className="ml-2">{Math.floor(ratio * 100)}%</span>
            </div>
          )
        }),
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
      render: (text, record, index) => moment(record.firstFilledAt).format('YYYY-MM-DD HH:MM'),
    },
    {
      title: '最後填單日期',
      dataIndex: 'lastFilledAt',
      key: 'lastFilledAt',
      render: (text, record, index) => moment(record.lastFilledAt).format('YYYY-MM-DD HH:MM'),
    },
    {
      title: '來源網址',
      dataIndex: 'sourceUrl',
      key: 'sourceUrl',
    },
  ]

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <MemberContractFilterSelector
          dateRangeType={filter.dateRangeType}
          onSetDateRangeType={dateRangeType => setFilter({ ...filter, dateRangeType })}
          startedAt={filter.startedAt}
          endedAt={filter.endedAt}
          onSetRange={({ startedAt, endedAt }) => setFilter({ ...filter, startedAt, endedAt })}
        />
        <div>
          <MemberContractFieldSelector value={visibleFields} onChange={value => setVisibleFields(value)} />

          {!permissions.READ_GROUP_CONTRACT_ALL && (
            <ExportContractCollectionButton
              visibleFields={visibleFields}
              columns={columns}
              filter={filter}
              sortOrder={sortOrder}
              isRevoked={variant === 'revoked'}
              authorId={currentUserRole === 'general-member' ? currentMemberId : null}
            />
          )}
        </div>
      </div>

      <StyledContractAmountBlock>
        {priceAmountList.map(v => (
          <MemberContractAmountCard
            key={v.text}
            color={v.color}
            text={v.text}
            amount={v.amount}
            loading={!!(loadingMemberContracts || errorMemberContracts)}
          />
        ))}
      </StyledContractAmountBlock>

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
            appointmentCouponCount: activeMemberContract?.appointmentCouponCount,
            appointmentCreatorName: activeMemberContract?.appointmentCreatorName,
            referral: activeMemberContract?.referral,
            startedAt: activeMemberContract?.startedAt,
            endedAt: activeMemberContract?.endedAt,
          }}
          rebateGift={activeMemberContract?.rebateGift}
          dealer={activeMemberContract?.dealer}
          status={{
            approvedAt: activeMemberContract?.approvedAt,
            loanCanceledAt: activeMemberContract?.loanCanceledAt,
            refundAppliedAt: activeMemberContract?.refundAppliedAt,
          }}
          orderOptions={activeMemberContract?.orderOptions}
          paymentOptions={activeMemberContract?.paymentOptions}
          note={activeMemberContract?.note}
          orderExecutors={activeMemberContract?.orderExecutors || []}
          studentCertification={activeMemberContract?.studentCertification}
          studentAttachments={activeMemberContract?.attachments}
          onSuccess={() => {
            setIsLoading(true)
            refetchMemberContracts().finally(() => setIsLoading(false))
          }}
          renderTrigger={({ setVisible }) => (
            <TableWrapper>
              <Table<MemberContractProps>
                columns={columns.filter(column => visibleFields.includes(column.key as string))}
                loading={loadingMemberContracts || !!errorMemberContracts || isLoading}
                dataSource={displayMemberContracts}
                scroll={{ x: true }}
                rowKey={row => row.id}
                rowClassName={
                  permissions.CONTRACT_VALUE_VIEW_ADMIN || permissions.CONTRACT_VALUE_VIEW_NORMAL
                    ? 'cursor-pointer'
                    : undefined
                }
                onRow={record => ({
                  onClick:
                    permissions.CONTRACT_VALUE_VIEW_ADMIN || permissions.CONTRACT_VALUE_VIEW_NORMAL
                      ? () => {
                          setActiveMemberContractId(record.id)
                          setVisible(true)
                        }
                      : undefined,
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

        {/* {loadMoreMemberContracts && (
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
        )} */}
      </AdminCard>
    </>
  )
}

const StyledCard = styled.div`
  display: grid;
  grid-template-rows: 14px 20px;
  row-gap: clamp(18px, 32%, 40px);
  border-radius: 4px;
  min-width: 196px;
  width: 19%;
  aspect-ratio: 2;
  padding: 22px 16px;
  background-color: #ffffff;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
`

const StyledCardTitle = styled.h4<{ color: string }>`
  &:before {
    content: '';
    display: inline-block;
    margin-right: 8px;
    border-radius: 50%;
    width: 8px;
    height: 8px;
    background: var(--${({ color }) => color});
  }

  display: flex;
  align-items: center;
  margin: 0;
  font-family: NotoSansCJKtc;
  font-size: clamp(14px, 1vw, 20px);
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.18px;
  color: var(--gray-darker);
  background-color: white;
`

const StyledPrice = styled.span`
  font-family: Roboto;
  font-size: clamp(20px, 1.4vw, 30px);
  font-weight: bold;
  line-height: 1;
  letter-spacing: 0.77px;
  color: var(--gray-darker);
`

const MemberContractAmountCard: React.FC<{
  color: string
  text: string
  amount: number
  loading?: boolean
}> = ({ color, text, amount, loading }) => {
  return (
    <StyledCard>
      <StyledCardTitle color={color}>{text}</StyledCardTitle>
      {loading ? <Spin size="small" /> : <StyledPrice>{currencyFormatter(amount)}</StyledPrice>}
    </StyledCard>
  )
}
