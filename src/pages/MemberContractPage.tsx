import Icon, { SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Button, Input, Skeleton, Table, Tabs } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import { AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import AdminCard from 'lodestar-app-admin/src/components/admin/AdminCard'
import AdminModal, { AdminModalProps } from 'lodestar-app-admin/src/components/admin/AdminModal'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import { commonMessages, memberMessages, orderMessages } from 'lodestar-app-admin/src/helpers/translation'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { ReactComponent as UserCopyIcon } from '../images/icons/user-copy.svg'
import types from '../types'

const StyledIcon = styled(Icon)`
  font-size: 24px;
`
const StyledFilterButton = styled(Button)`
  height: 36px;
  width: 90px;
`
const StyledFilterInput = styled(Input)`
  width: 188px;
`

const messages = defineMessages({
  agreedAt: { id: 'member.label.agreedAt', defaultMessage: '簽署日期' },
  revokedAt: { id: 'member.label.revokedAt', defaultMessage: '解約日期' },
  status: { id: 'member.label.status', defaultMessage: '狀態' },
  serviceStartedAt: { id: 'member.label.serviceStartedAt', defaultMessage: '服務開始' },
  contractCreator: { id: 'member.label.contractCreator', defaultMessage: '合約建立者' },
  studentName: { id: 'member.label.studentName', defaultMessage: '學員姓名' },
  product: { id: 'member.label.product', defaultMessage: '產品' },
  paymentMethod: { id: 'member.label.paymentMethod', defaultMessage: '付款方式' },
  remarks: { id: 'member.label.remarks', defaultMessage: '備註' },
  revenueShare: { id: 'member.label.remarks', defaultMessage: '業務分潤' },
  proofOfEnrollment: { id: 'member.label.proofOfEnrollment', defaultMessage: '學生證明' },
  applyRefund: { id: 'member.status.applyRefund', defaultMessage: '提出退費' },
  pendingApproval: { id: 'member.status.pendingApproval', defaultMessage: '審核中' },
  approvedApproval: { id: 'member.status.approvedApproval', defaultMessage: '審核通過' },
  memberContracts: { id: 'common.menu.memberContracts', defaultMessage: '合約資料管理' },
  agreed: { id: 'member.label.agreed', defaultMessage: '已簽約' },
  revoked: { id: 'member.label.revoked', defaultMessage: '已解約' },
  memberContract: { id: 'member.label.memberContract', defaultMessage: '合約資料' },
  memberContractId: { id: 'member.label.memberContractId', defaultMessage: '合約編號' },
  purchasedItem: { id: 'member.label.purchasedItemId', defaultMessage: '購買項目' },
  appointmentCreator: { id: 'member.label.appointmentCreator', defaultMessage: '指定業師' },
  referralMember: { id: 'member.label.referralMember', defaultMessage: '推薦人' },
  servicePeriod: { id: 'member.label.servicePeriod', defaultMessage: '服務期間' },
  approvedAt: { id: 'member.label.approvedAt', defaultMessage: '審核通過日期' },
  loanCancelAt: { id: 'member.label.loanCancelAt', defaultMessage: '取消日期' },
  refundApplyAt: { id: 'member.label.refundApplyAt', defaultMessage: '提出退費日期' },
  payment: { id: 'member.label.payment', defaultMessage: '付款' },
  installmentPlan: { id: 'member.label.installmentPlan', defaultMessage: '期數' },
  paymentNumber: { id: 'member.label.paymentNumber', defaultMessage: '金流編號' },
  note: { id: 'member.label.note', defaultMessage: '備註' },
  executors: { id: 'member.label.executors', defaultMessage: '承辦人' },
})

type MemberContractProps = {
  id: string
  authorId: string
  member: {
    id: string
    name: string
    pictureUrl: string | null
    email: string
  }
  startedAt: Date
  agreedAt: Date
  approvedAt: Date | null
  loanCancelAt: Date | null
  refundApplyAt: Date | null
  revokedAt: Date
  referralMemberId: string | null
  appointmentCreatorId: string | null
  studentCertification: string | null
}

const MemberContractPage: React.FC = () => {
  const { formatMessage } = useIntl()

  const tabContents: {
    key: 'agreed' | 'revoked'
    tab: string
  }[] = [
    {
      key: 'agreed',
      tab: formatMessage(messages.agreed),
    },
    {
      key: 'revoked',
      tab: formatMessage(messages.revoked),
    },
  ]

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <StyledIcon className="mr-3" component={() => <UserCopyIcon />} />
        <span>{formatMessage(messages.memberContracts)}</span>
      </AdminPageTitle>
      <Tabs>
        {tabContents.map(v => (
          <Tabs.TabPane key={v.key} tab={v.tab}>
            <AdminCard>
              <MemberContractCollectionAdminTable variant={v.key} />
            </AdminCard>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

const MemberContractCollectionAdminTable: React.FC<{
  variant: 'agreed' | 'revoked'
}> = ({ variant }) => {
  const { formatMessage } = useIntl()
  const { loadingMemberContracts, errorMemberContracts, memberContracts, loadMoreMemberContracts } = useMemberContract(
    variant,
  )
  const [isLoading, setIsLoading] = useState(false)

  const [filter, setFilter] = useState<{
    name: string | null
    field: string | null
    speciality: string | null
  }>({
    name: null,
    field: null,
    speciality: null,
  })

  // const dataSource = memberContracts

  const getColumnSearchProps = ({
    onReset,
    onSearch,
  }: {
    onReset: (clearFilters: any) => void
    onSearch: (selectedKeys?: React.ReactText[], confirm?: () => void) => void
  }): ColumnProps<MemberContractProps> => ({
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

  const columns: ColumnProps<MemberContractProps>[] = [
    {
      title: formatMessage(messages.agreedAt),
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
          title: formatMessage(messages.revokedAt),
          dataIndex: 'name',
          key: 'revokedAt',
          sorter: (a, b) => 1,
          render: (name, record) => (
            <div className="d-flex align-items-center justify-content-start">
              <span className="pl-1">{name}</span>
            </div>
          ),
        }
      : {
          title: formatMessage(messages.status),
          dataIndex: 'status',
          key: 'status',
          filters: [
            {
              text: formatMessage(messages.approvedApproval),
              value: formatMessage(messages.approvedApproval),
            },
            {
              text: formatMessage(messages.applyRefund),
              value: formatMessage(messages.applyRefund),
            },
            {
              text: formatMessage(messages.pendingApproval),
              value: formatMessage(messages.pendingApproval),
            },
            {
              text: formatMessage(commonMessages.ui.cancel),
              value: formatMessage(commonMessages.ui.cancel),
            },
          ],
          onFilter: (value, record) => true,
          render: (name, record) => (
            <div className="d-flex align-items-center justify-content-start">
              <span className="pl-1">{name}</span>
            </div>
          ),
        },
    {
      title: formatMessage(messages.serviceStartedAt),
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => 1,
      render: (name, record) => (
        <div className="d-flex align-items-center justify-content-start">
          <span className="pl-1">{name}</span>
        </div>
      ),
    },
    {
      title: formatMessage(messages.contractCreator),
      dataIndex: 'name',
      key: 'name',
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
      render: (name, record) => (
        <div className="d-flex align-items-center justify-content-start">
          <span className="pl-1">{name}</span>
        </div>
      ),
    },
    {
      title: `${formatMessage(messages.studentName)} / Email`,
      dataIndex: 'name',
      key: 'name',
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
      render: (name, record) => (
        <div className="d-flex align-items-center justify-content-start">
          <span className="pl-1">{name}</span>
        </div>
      ),
    },
    {
      title: formatMessage(messages.agreedAt),
      dataIndex: 'name',
      key: 'name',

      render: (name, record) => (
        <div className="d-flex align-items-center justify-content-start">
          <span className="pl-1">{name}</span>
        </div>
      ),
    },
    {
      title: formatMessage(messages.product),
      dataIndex: 'name',
      key: 'name',

      render: (name, record) => (
        <div className="d-flex align-items-center justify-content-start">
          <span className="pl-1">{name}</span>
        </div>
      ),
    },
    {
      title: formatMessage(messages.paymentMethod),
      dataIndex: 'name',
      key: 'name',

      render: (name, record) => (
        <div className="d-flex align-items-center justify-content-start">
          <span className="pl-1">{name}</span>
        </div>
      ),
    },
    {
      title: formatMessage(messages.remarks),
      dataIndex: 'name',
      key: 'name',

      render: (name, record) => (
        <div className="d-flex align-items-center justify-content-start">
          <span className="pl-1">{name}</span>
        </div>
      ),
    },
    {
      title: formatMessage(messages.revenueShare),
      dataIndex: 'name',
      key: 'name',

      render: (name, record) => (
        <div className="d-flex align-items-center justify-content-start">
          <span className="pl-1">{name}</span>
        </div>
      ),
    },
    {
      title: formatMessage(messages.proofOfEnrollment),
      dataIndex: 'name',
      key: 'name',

      render: (name, record) => (
        <div className="d-flex align-items-center justify-content-start">
          <span className="pl-1">{name}</span>
        </div>
      ),
    },
  ]

  if (loadingMemberContracts) {
    return <Skeleton />
  }

  return (
    <>
      <MemberContractModal
        renderTrigger={({ setVisible }) => (
          <Table
            columns={columns}
            dataSource={memberContracts}
            scroll={{ x: columns.length * 16 * 12 }}
            onRow={() => ({
              onClick: () => setVisible(true),
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
              loadMoreMemberContracts().finally(() => setIsLoading(false))
            }}
          >
            {formatMessage(commonMessages.ui.showMore)}
          </Button>
        </div>
      )}
    </>
  )
}

const StyledAreaTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
  color: var(--gray-darker);
`
// {
// memberContractId: string
// invoice: {
//   name: string
//   email: string
//   phone: string
// }
// isRevoked: boolean
// status: {
//   approvedAt: Date | null
//   loanCancelAt: Date | null
//   refundApplyAt: Date | null
// }
// payment: {
//   method: string
//   number: string
//   installmentPlan: number
// }
// note: string
// orderExecutors: {
//   memberId: string
//   ratio: number
// }[]
// } &
const MemberContractModal: React.FC<AdminModalProps> = ({ ...props }) => {
  const { formatMessage } = useIntl()
  return (
    <AdminModal title={formatMessage(messages.memberContract)} {...props}>
      <div className="row">
        <div className="col-4 row">
          <div className="col-12">
            <StyledAreaTitle>{formatMessage(memberMessages.label.target)}</StyledAreaTitle>
          </div>
          <div className="col-12">
            <StyledAreaTitle>{formatMessage(messages.memberContractId)}</StyledAreaTitle>
          </div>
        </div>
        <div className="col-8">
          <StyledAreaTitle>{formatMessage(messages.purchasedItem)}</StyledAreaTitle>
          {formatMessage(messages.product)}
          {formatMessage(commonMessages.label.funds)}
          {formatMessage(messages.appointmentCreator)}
          {formatMessage(messages.referralMember)}
          {formatMessage(messages.servicePeriod)}
        </div>
      </div>
      <StyledAreaTitle>{formatMessage(memberMessages.label.status)}</StyledAreaTitle>
      <div className="row">
        <div className="col-4">{formatMessage(messages.approvedAt)}</div>
        <div className="col-4">{formatMessage(messages.loanCancelAt)}</div>
        <div className="col-4">{formatMessage(messages.refundApplyAt)}</div>
      </div>
      <StyledAreaTitle>{formatMessage(messages.payment)}</StyledAreaTitle>
      <div className="row">
        <div className="col-4">
          <StyledAreaTitle>{formatMessage(orderMessages.label.paymentLogDetails)}</StyledAreaTitle>
        </div>
        <div className="col-3">
          <StyledAreaTitle>{formatMessage(messages.installmentPlan)}</StyledAreaTitle>
        </div>
        <div className="col-4">
          <StyledAreaTitle>{formatMessage(messages.paymentNumber)}</StyledAreaTitle>
        </div>
      </div>
      <StyledAreaTitle>{formatMessage(memberMessages.label.note)}</StyledAreaTitle>
      <div className="row">
        <div className="col-12"></div>
      </div>
      <StyledAreaTitle>{formatMessage(messages.revenueShare)}</StyledAreaTitle>
      <div className="row">
        <div className="col-4">{formatMessage(memberMessages.label.manager)}</div>
        <div className="col-3"></div>
      </div>

      {/* {isRevoked ? <div></div> : <div></div>} */}
    </AdminModal>
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
          agreed_at
          revoked_at
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
          agreedAt: new Date(v.agreed_at),
          approvedAt: v.options.approvedAt ? new Date(v.options.approved_at) : null,
          loanCancelAt: v.options.loanCancelAt ? new Date(v.options.loanCancelAt) : null,
          refundApplyAt: v.options.refundApplyAt ? new Date(v.options.refundApplyAt) : null,
          revokedAt: new Date(v.revoked_at),
          referralMemberId: v.options?.referralMemberId || null,
          appointmentCreatorId: v.options?.appointmentCreatorId || null,
          studentCertification: v.options?.studentCertification || null,
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

export default MemberContractPage
