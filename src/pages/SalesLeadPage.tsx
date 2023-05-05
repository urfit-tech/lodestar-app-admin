import Icon, { PhoneOutlined, RedoOutlined } from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { Button, notification, Skeleton, Tabs } from 'antd'
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
import { useManagers } from '../hooks'
import { useManagerLeads } from '../hooks/sales'
import { Manager } from '../types/sales'
import ForbiddenPage from './ForbiddenPage'

const StyledManagerBlock = styled.div`
  width: 400px;
`

const SalesLeadPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { managers } = useManagers()
  const { currentMemberId, currentMember, permissions } = useAuth()
  const [activeKey, setActiveKey] = useState('starred')
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
        {permissions.SALES_LEAD_SELECTOR_ADMIN && manager ? (
          <StyledManagerBlock className="d-flex flex-row align-items-center">
            <span className="flex-shrink-0">承辦人：</span>
            <ManagerInput value={manager.id} onChange={value => setManagerId(value)} />
          </StyledManagerBlock>
        ) : currentMember?.role === 'general-member' ? (
          <div>承辦編號：{currentMember.id}</div>
        ) : null}
      </div>
      {manager && <SalesLeadTabs activeKey={activeKey} manager={manager} onActiveKeyChanged={setActiveKey} />}
    </AdminLayout>
  )
}

const SalesLeadTabs: React.VFC<{
  manager: Manager
  activeKey: string
  onActiveKeyChanged?: (activeKey: string) => void
}> = ({ activeKey, manager, onActiveKeyChanged }) => {
  const { formatMessage } = useIntl()
  const {
    loading,
    refetch,
    loadingMembers,
    refetchMembers,
    totalLeads,
    idledLeads,
    contactedLeads,
    answeredLeads,
    invitedLeads,
    presentedLeads,
    signedLeads,
    closedLeads,
  } = useManagerLeads(manager)

  if (loading || loadingMembers) {
    return <Skeleton active />
  }

  const starredLeads = totalLeads.filter(lead => lead.star === Number(manager.telephone))

  return (
    <Tabs
      activeKey={activeKey}
      onChange={onActiveKeyChanged}
      tabBarExtraContent={
        <Button
          onClick={() => {
            refetch?.()
            refetchMembers?.()
          }}
        >
          <RedoOutlined />
        </Button>
      }
    >
      <Tabs.TabPane
        key="starred"
        tab={
          <div>
            {formatMessage(salesMessages.starredLead)}
            <span>({starredLeads.length})</span>
          </div>
        }
      >
        {
          <SalesLeadTable
            variant="starred"
            manager={manager}
            leads={starredLeads}
            onRefetch={() => {
              refetch?.()
              refetchMembers?.()
            }}
          />
        }
      </Tabs.TabPane>

      <Tabs.TabPane
        key="total"
        tab={
          <div>
            {formatMessage(salesMessages.totalLead)}
            <span>({totalLeads.length})</span>
          </div>
        }
      >
        {
          <SalesLeadTable
            manager={manager}
            leads={totalLeads}
            onRefetch={() => {
              refetch?.()
              refetchMembers?.()
            }}
          />
        }
      </Tabs.TabPane>

      <Tabs.TabPane
        key="idled"
        tab={
          <div>
            {formatMessage(salesMessages.idledLead)}
            <span>({idledLeads.length})</span>
          </div>
        }
      >
        {
          <SalesLeadTable
            manager={manager}
            leads={idledLeads}
            onRefetch={() => {
              refetch?.()
              refetchMembers?.()
            }}
          />
        }
      </Tabs.TabPane>

      <Tabs.TabPane
        key="contacted"
        tab={
          <div>
            {formatMessage(salesMessages.contactedLead)}
            <span>({contactedLeads.length})</span>
          </div>
        }
      >
        {
          <SalesLeadTable
            manager={manager}
            leads={contactedLeads}
            onRefetch={() => {
              refetch?.()
              refetchMembers?.()
            }}
          />
        }
      </Tabs.TabPane>

      <Tabs.TabPane
        key="answered"
        tab={
          <div>
            {formatMessage(salesMessages.answeredLeads)}
            <span>({answeredLeads.length})</span>
          </div>
        }
      >
        <SalesLeadTable
          manager={manager}
          leads={answeredLeads}
          onRefetch={() => {
            refetch?.()
            refetchMembers?.()
          }}
        />
      </Tabs.TabPane>

      <Tabs.TabPane
        key="invited"
        tab={
          <div>
            {formatMessage(salesMessages.invitedLead)}
            <span>({invitedLeads.length})</span>
          </div>
        }
      >
        {
          <SalesLeadTable
            manager={manager}
            leads={invitedLeads}
            onRefetch={() => {
              refetch?.()
              refetchMembers?.()
            }}
          />
        }
      </Tabs.TabPane>

      <Tabs.TabPane
        key="presented"
        tab={
          <div>
            {formatMessage(salesMessages.presentedLead)}
            <span>({presentedLeads.length})</span>
          </div>
        }
      >
        {
          <SalesLeadTable
            manager={manager}
            leads={presentedLeads}
            onRefetch={() => {
              refetch?.()
              refetchMembers?.()
            }}
          />
        }
      </Tabs.TabPane>

      <Tabs.TabPane
        key="signed"
        tab={
          <div>
            {formatMessage(salesMessages.signedLead)}
            <span>({signedLeads.length})</span>
          </div>
        }
      >
        {
          <SalesLeadTable
            manager={manager}
            leads={signedLeads}
            onRefetch={() => {
              refetch?.()
              refetchMembers?.()
            }}
          />
        }
      </Tabs.TabPane>

      {closedLeads.length > 0 && (
        <Tabs.TabPane
          key="closed"
          tab={
            <div>
              {formatMessage(salesMessages.closedLead)}
              <span>({closedLeads.length})</span>
            </div>
          }
        >
          {
            <SalesLeadTable
              manager={manager}
              leads={closedLeads}
              onRefetch={() => {
                refetch?.()
                refetchMembers?.()
              }}
            />
          }
        </Tabs.TabPane>
      )}
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
