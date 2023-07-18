import Icon, { PhoneOutlined, RedoOutlined } from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { Button, notification, Spin, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminPageTitle } from '../components/admin'
import ManagerInput from '../components/common/ManagerInput'
import AdminLayout from '../components/layout/AdminLayout'
import SalesLeadTable from '../components/sale/SalesLeadTable'
import hasura from '../hasura'
import { salesMessages } from '../helpers/translation'
import {
  useActiveContractMemberIds,
  useManagers,
  useMemberTasks,
  useValidManagerMemberIds,
  useSalesLeadMemberCount,
} from '../hooks/sales'
import { Manager } from '../types/sales'
import ForbiddenPage from './ForbiddenPage'

const StyledManagerBlock = styled.div`
  width: 400px;
`

const SalesLeadPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { loading, managers } = useManagers()
  const { currentMemberId, currentMember, permissions } = useAuth()
  const [activeKey, setActiveKey] = useState('followed')
  const [managerId, setManagerId] = useState<string | null>(currentMemberId)
  useMemberContractNotification()

  const manager =
    managers.find(manager => manager.id === managerId) || (permissions.SALES_LEAD_ADMIN ? managers?.[0] : null)

  if (!enabledModules.sales || (!permissions.SALES_LEAD_ADMIN && !permissions.SALES_LEAD_NORMAL && !manager)) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <AdminPageTitle className="d-flex align-items-center mb-0">
          <Icon className="mr-3" component={() => <PhoneOutlined />} />
          <span>{formatMessage(salesMessages.salesLead)}</span>
        </AdminPageTitle>
        {loading ? (
          <Spin />
        ) : permissions.SALES_LEAD_SELECTOR_ADMIN && manager ? (
          <StyledManagerBlock className="d-flex flex-row align-items-center">
            <span className="flex-shrink-0">承辦人：</span>
            <ManagerInput value={manager.id} onChange={value => setManagerId(value)} />
          </StyledManagerBlock>
        ) : currentMember ? (
          <div>承辦編號：{currentMember.id}</div>
        ) : null}
      </div>
      {manager ? (
        <SalesLeadTabs activeKey={activeKey} manager={manager} onActiveKeyChanged={setActiveKey} />
      ) : (
        <div className="pt-2">
          <Spin />
        </div>
      )}
    </AdminLayout>
  )
}

const SalesLeadTabs: React.VFC<{
  manager: Manager
  activeKey: string
  onActiveKeyChanged?: (activeKey: string) => void
}> = ({ activeKey, manager, onActiveKeyChanged }) => {
  const [refetchLoading, setRefetchLoading] = useState(false)
  const { formatMessage } = useIntl()

  const {
    loading: loadingActiveContractMemberIds,
    activeContractMemberIds,
    refetch: refetchActiveContractMemberIds,
  } = useActiveContractMemberIds(manager.id)

  const {
    loading: loadingValidManagerMemberIds,
    validManagerMemberIds,
    refetch: refetchValidManagerMemberIds,
  } = useValidManagerMemberIds(manager.id)

  const {
    loading: loadingMemberTasks,
    memberTasks,
    refetch: refetchMemberTasks,
  } = useMemberTasks(validManagerMemberIds)

  const {
    loadingTotalSalesLeadMemberAggregate,
    loadingFollowedSalesLeadMemberAggregate,
    loadingClosedSalesLeadMemberAggregate,
    loadingCompletedSalesLeadMemberAggregate,
    loadingSignedSalesLeadMemberAggregate,
    loadingPresentedSalesLeadMemberAggregate,
    loadingInvitedSalesLeadMemberAggregate,
    loadingAnsweredSalesLeadMemberAggregate,
    loadingContactedSalesLeadMemberAggregate,
    loadingIdledSalesLeadMemberAggregate,
    totalSalesLeadMemberAggregate,
    followedSalesLeadMemberAggregate,
    closedSalesLeadMemberAggregate,
    completedSalesLeadMemberAggregate,
    signedSalesLeadMemberAggregate,
    presentedSalesLeadMemberAggregate,
    invitedSalesLeadMemberAggregate,
    answeredSalesLeadMemberAggregate,
    contactedSalesLeadMemberAggregate,
    idledSalesLeadMemberAggregate,
    refetchTotalSalesLeadMembersAggregate,
    refetchFollowedSalesLeadMemberAggregate,
    refetchClosedSalesLeadMemberAggregate,
    refetchCompletedSalesLeadMemberAggregate,
    refetchSignedSalesLeadMemberAggregate,
    refetchPresentedSalesLeadMemberAggregate,
    refetchInvitedSalesLeadMemberAggregate,
    refetchAnsweredSalesLeadMemberAggregate,
    refetchContactedSalesLeadMemberAggregate,
    refetchIdledSalesLeadMemberAggregate,
  } = useSalesLeadMemberCount(manager.id, activeContractMemberIds, validManagerMemberIds, memberTasks)

  const salesLeadTabs = [
    {
      status: 'followed',
      message: formatMessage(salesMessages.followedLead),
      aggregate: followedSalesLeadMemberAggregate,
      loadingAggregate: loadingFollowedSalesLeadMemberAggregate,
      condition: {
        manager_id: { _eq: manager.id },
        member_phones: { phone: { _is_null: false } },
        followed_at: { _is_null: false },
      },
      refetch: refetchFollowedSalesLeadMemberAggregate,
    },
    {
      status: 'total',
      message: formatMessage(salesMessages.totalLead),
      loadingAggregate: loadingTotalSalesLeadMemberAggregate,
      aggregate: totalSalesLeadMemberAggregate,
      condition: {
        manager_id: { _eq: manager.id },
        member_phones: { phone: { _is_null: false } },
      },
      refetch: refetchTotalSalesLeadMembersAggregate,
    },
    {
      status: 'idled',
      message: formatMessage(salesMessages.idledLead),
      loadingAggregate: loadingIdledSalesLeadMemberAggregate,
      aggregate: idledSalesLeadMemberAggregate,
      condition: {
        manager_id: { _eq: manager.id },
        member_phones: { phone: { _is_null: false } },
        followed_at: { _is_null: true },
        star: { _gte: -999 },
        closed_at: { _is_null: true },
        completed_at: { _is_null: true },
        id: {
          _nin: validManagerMemberIds?.filter(
            validManagerMemberId =>
              memberTasks.some(memberTask => memberTask.memberId === validManagerMemberId) ||
              activeContractMemberIds?.some(activeContractMemberId => activeContractMemberId === validManagerMemberId),
          ),
        },
        last_member_note_answered: { _is_null: true },
        last_member_note_called: { _is_null: true },
      },
      refetch: refetchIdledSalesLeadMemberAggregate,
    },
    {
      status: 'contacted',
      message: formatMessage(salesMessages.contactedLead),
      loadingAggregate: loadingContactedSalesLeadMemberAggregate,
      aggregate: contactedSalesLeadMemberAggregate,
      condition: {
        manager_id: { _eq: manager.id },
        member_phones: { phone: { _is_null: false } },
        followed_at: { _is_null: true },
        star: { _gte: -999 },
        closed_at: { _is_null: true },
        completed_at: { _is_null: true },
        id: {
          _nin: validManagerMemberIds?.filter(
            validManagerMemberId =>
              memberTasks.some(memberTask => memberTask.memberId === validManagerMemberId) ||
              activeContractMemberIds?.some(activeContractMemberId => activeContractMemberId === validManagerMemberId),
          ),
        },
        last_member_note_answered: { _is_null: true },
        last_member_note_called: { _is_null: false },
      },
      refetch: refetchContactedSalesLeadMemberAggregate,
    },
    {
      status: 'answered',
      message: formatMessage(salesMessages.answeredLeads),
      loadingAggregate: loadingAnsweredSalesLeadMemberAggregate,
      aggregate: answeredSalesLeadMemberAggregate,
      condition: {
        manager_id: { _eq: manager.id },
        member_phones: { phone: { _is_null: false } },
        followed_at: { _is_null: true },
        star: { _gte: -999 },
        closed_at: { _is_null: true },
        completed_at: { _is_null: true },
        id: {
          _nin: validManagerMemberIds?.filter(
            validManagerMemberId =>
              memberTasks.some(memberTask => memberTask.memberId === validManagerMemberId) ||
              activeContractMemberIds?.some(activeContractMemberId => activeContractMemberId === validManagerMemberId),
          ),
        },
        last_member_note_answered: { _is_null: false },
      },
      refetch: refetchAnsweredSalesLeadMemberAggregate,
    },
    {
      status: 'invited',
      message: formatMessage(salesMessages.invitedLead),
      loadingAggregate: loadingInvitedSalesLeadMemberAggregate,
      aggregate: invitedSalesLeadMemberAggregate,
      condition: {
        manager_id: { _eq: manager.id },
        member_phones: { phone: { _is_null: false } },
        followed_at: { _is_null: true },
        star: { _gte: -999 },
        closed_at: { _is_null: true },
        completed_at: { _is_null: true },
        id: {
          _nin: activeContractMemberIds,
          _in: validManagerMemberIds?.filter(validManagerMemberId =>
            memberTasks
              .filter(memberTask => memberTask.status !== 'done')
              .some(memberTask => memberTask.memberId === validManagerMemberId),
          ),
        },
      },
      refetch: refetchInvitedSalesLeadMemberAggregate,
    },
    {
      status: 'presented',
      message: formatMessage(salesMessages.presentedLead),
      loadingAggregate: loadingPresentedSalesLeadMemberAggregate,
      aggregate: presentedSalesLeadMemberAggregate,
      condition: {
        manager_id: { _eq: manager.id },
        member_phones: { phone: { _is_null: false } },
        followed_at: { _is_null: true },
        star: { _gte: -999 },
        closed_at: { _is_null: true },
        completed_at: { _is_null: true },
        id: {
          _nin: activeContractMemberIds,
          _in: validManagerMemberIds?.filter(validManagerMemberId =>
            memberTasks
              .filter(memberTask => memberTask.status === 'done')
              .some(memberTask => memberTask.memberId === validManagerMemberId),
          ),
        },
      },
      refetch: refetchPresentedSalesLeadMemberAggregate,
    },
    {
      status: 'completed',
      message: formatMessage(salesMessages.completedLead),
      loadingAggregate: loadingCompletedSalesLeadMemberAggregate,
      aggregate: completedSalesLeadMemberAggregate,
      condition: {
        manager_id: { _eq: manager.id },
        member_phones: { phone: { _is_null: false } },
        followed_at: { _is_null: true },
        star: { _gte: -999 },
        closed_at: { _is_null: true },
        completed_at: { _is_null: false },
      },
      refetch: refetchCompletedSalesLeadMemberAggregate,
    },
    {
      status: 'signed',
      message: formatMessage(salesMessages.signedLead),
      loadingAggregate: loadingSignedSalesLeadMemberAggregate,
      aggregate: signedSalesLeadMemberAggregate,
      condition: {
        manager_id: { _eq: manager.id },
        member_phones: { phone: { _is_null: false } },
        followed_at: { _is_null: true },
        star: { _gte: -999 },
        closed_at: { _is_null: true },
        completed_at: { _is_null: true },
        id: {
          _in: activeContractMemberIds,
        },
      },
      refetch: refetchSignedSalesLeadMemberAggregate,
    },
    {
      status: 'closed',
      message: formatMessage(salesMessages.closedLead),
      loadingAggregate: loadingClosedSalesLeadMemberAggregate,
      aggregate: closedSalesLeadMemberAggregate,
      condition: {
        manager_id: { _eq: manager.id },
        member_phones: { phone: { _is_null: false } },
        followed_at: { _is_null: true },
        star: { _gte: -999 },
        closed_at: { _is_null: false },
      },
      refetch: refetchClosedSalesLeadMemberAggregate,
    },
  ]

  useEffect(() => {
    if (
      !loadingTotalSalesLeadMemberAggregate &&
      !loadingFollowedSalesLeadMemberAggregate &&
      !loadingClosedSalesLeadMemberAggregate &&
      !loadingCompletedSalesLeadMemberAggregate &&
      !loadingSignedSalesLeadMemberAggregate &&
      !loadingPresentedSalesLeadMemberAggregate &&
      !loadingInvitedSalesLeadMemberAggregate &&
      !loadingAnsweredSalesLeadMemberAggregate &&
      !loadingContactedSalesLeadMemberAggregate &&
      !loadingIdledSalesLeadMemberAggregate
    ) {
      setRefetchLoading(false)
    }
  }, [
    loadingAnsweredSalesLeadMemberAggregate,
    loadingClosedSalesLeadMemberAggregate,
    loadingCompletedSalesLeadMemberAggregate,
    loadingContactedSalesLeadMemberAggregate,
    loadingFollowedSalesLeadMemberAggregate,
    loadingIdledSalesLeadMemberAggregate,
    loadingInvitedSalesLeadMemberAggregate,
    loadingPresentedSalesLeadMemberAggregate,
    loadingSignedSalesLeadMemberAggregate,
    loadingTotalSalesLeadMemberAggregate,
  ])

  if (loadingActiveContractMemberIds || loadingMemberTasks || loadingValidManagerMemberIds) {
    return (
      <div className="pt-2">
        <Spin />
      </div>
    )
  }

  return (
    <Tabs
      activeKey={activeKey}
      onChange={onActiveKeyChanged}
      tabBarExtraContent={
        <Button
          onClick={() => {
            refetchActiveContractMemberIds()
            refetchValidManagerMemberIds()
            refetchMemberTasks()
            refetchTotalSalesLeadMembersAggregate()
            refetchFollowedSalesLeadMemberAggregate()
            refetchClosedSalesLeadMemberAggregate()
            refetchCompletedSalesLeadMemberAggregate()
            refetchSignedSalesLeadMemberAggregate()
            refetchPresentedSalesLeadMemberAggregate()
            refetchInvitedSalesLeadMemberAggregate()
            refetchAnsweredSalesLeadMemberAggregate()
            refetchContactedSalesLeadMemberAggregate()
            refetchIdledSalesLeadMemberAggregate()
            setRefetchLoading(true)
          }}
        >
          <RedoOutlined />
        </Button>
      }
    >
      {salesLeadTabs.map(salesLeadTab => (
        <Tabs.TabPane
          key={salesLeadTab.status}
          tab={
            <div>
              {salesLeadTab.message}
              <span className="ml-1">{salesLeadTab.loadingAggregate ? <Spin /> : salesLeadTab.aggregate}</span>
            </div>
          }
        >
          {(
            salesLeadTab.loadingAggregate ? (
              <div>
                <Spin />
              </div>
            ) : (
              salesLeadTab.status !== 'closed' || (salesLeadTab.status === 'closed' && salesLeadTab.aggregate > 0)
            )
          ) ? (
            <SalesLeadTable
              variant={
                salesLeadTab.status === 'followed'
                  ? 'followed'
                  : salesLeadTab.status === 'completed'
                  ? 'completed'
                  : undefined
              }
              manager={manager}
              condition={salesLeadTab.condition}
              aggregate={salesLeadTab.aggregate}
              onRefetch={() => {
                refetchActiveContractMemberIds()
                refetchValidManagerMemberIds()
                refetchMemberTasks()
                refetchTotalSalesLeadMembersAggregate()
                refetchFollowedSalesLeadMemberAggregate()
                refetchClosedSalesLeadMemberAggregate()
                refetchCompletedSalesLeadMemberAggregate()
                refetchSignedSalesLeadMemberAggregate()
                refetchPresentedSalesLeadMemberAggregate()
                refetchInvitedSalesLeadMemberAggregate()
                refetchAnsweredSalesLeadMemberAggregate()
                refetchContactedSalesLeadMemberAggregate()
                refetchIdledSalesLeadMemberAggregate()
              }}
              refetchLoading={refetchLoading}
              onRefetchLoading={(status: boolean) => setRefetchLoading(status)}
            />
          ) : null}
        </Tabs.TabPane>
      ))}
    </Tabs>
  )
}

const useMemberContractNotification = () => {
  const { data } = useQuery<hasura.GET_TODAY_MEMBER_CONTRACT, hasura.GET_TODAY_MEMBER_CONTRACTVariables>(
    gql`
      query GET_TODAY_MEMBER_CONTRACT($today: timestamptz!) {
        order_executor_sharing(where: { created_at: { _gte: $today } }) {
          created_at
          order_id
          executor {
            name
          }
          total_price
          order_log {
            order_products(where: { price: { _gte: 10000 } }) {
              name
            }
          }
        }
      }
    `,
    {
      variables: { today: moment().startOf('day') },
    },
  )
  useEffect(() => {
    const notifications =
      data?.order_executor_sharing.reduce((accum, v) => {
        if (!v.order_id) {
          return accum
        }
        if (!accum[v.order_id]) {
          accum[v.order_id] = {
            names: [],
            products: [],
            createdAt: new Date(),
            totalPrice: 0,
          }
        }
        accum[v.order_id].createdAt = v.created_at
        accum[v.order_id].totalPrice = v.total_price
        v.executor?.name && accum[v.order_id].names.push(v.executor.name)
        accum[v.order_id].products = v.order_log?.order_products.map(v => v.name) || []
        return accum
      }, {} as { [orderId: string]: { createdAt: Date; totalPrice: number; names: string[]; products: string[] } }) ||
      {}
    Object.values(notifications).forEach(v => {
      notification.success({
        duration: 0,
        message: `${v.names.join('、')} 喜提 ${new Intl.NumberFormat('zh').format(v.totalPrice)}`,
        description: (
          <div>
            {v.products.map(product => (
              <div key={product}>{product}</div>
            ))}
            <small>{moment(v.createdAt).format('HH:mm:ss')}</small>
          </div>
        ),
      })
    })
  }, [data])
}

export default SalesLeadPage
