import Icon, { PhoneOutlined, RedoOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Badge, Button, notification, Skeleton, Tabs } from 'antd'
import gql from 'graphql-tag'
import moment from 'moment'
import { prop, sortBy } from 'ramda'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminPageTitle } from '../../components/admin'
import SalesMemberInput from '../../components/common/SalesMemberInput'
import AdminLayout from '../../components/layout/AdminLayout'
import SalesLeadTable from '../../components/sale/SalesLeadTable'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import hasura from '../../hasura'
import { notEmpty } from '../../helpers'
import { salesMessages } from '../../helpers/translation'
import { useSales } from '../../hooks/sales'
import { Lead } from '../../types/sales'

const StyledManagerBlock = styled.div`
  width: 400px;
`

const SalesLeadPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId, currentMember } = useAuth()
  const [activeKey, setActiveKey] = useState('idled')
  const [saleId, setSaleId] = useState<string | undefined>()
  useMemberContractNotification()
  return (
    <AdminLayout>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <AdminPageTitle className="d-flex align-items-center mb-0">
          <Icon className="mr-3" component={() => <PhoneOutlined />} />
          <span>{formatMessage(salesMessages.salesLead)}</span>
        </AdminPageTitle>
        {currentMember?.role === 'app-owner' ? (
          <StyledManagerBlock className="d-flex flex-row align-items-center">
            <span className="flex-shrink-0">承辦人：</span>
            <SalesMemberInput value={saleId ? saleId : currentMember.id} onChange={value => setSaleId(value)} />
          </StyledManagerBlock>
        ) : currentMember?.role === 'general-member' ? (
          <div>承辦編號：{currentMember.id}</div>
        ) : null}
      </div>
      {currentMemberId ? (
        <SalesLeadTabs
          activeKey={activeKey}
          managerId={saleId ? saleId : currentMemberId}
          onActiveKeyChanged={setActiveKey}
        />
      ) : (
        <Skeleton active />
      )}
    </AdminLayout>
  )
}

const SalesLeadTabs: React.VFC<{
  activeKey: string
  managerId: string
  onActiveKeyChanged?: (activeKey: string) => void
}> = ({ activeKey, managerId, onActiveKeyChanged }) => {
  const { formatMessage } = useIntl()
  const { sales } = useSales(managerId)
  const { loading, refetch, idledLeads, contactedLeads, invitedLeads, presentedLeads, paidLeads, closedLeads } =
    useSalesLeads(managerId)

  if (loading || !sales) {
    return <Skeleton active />
  }
  return (
    <Tabs
      activeKey={activeKey}
      onChange={onActiveKeyChanged}
      tabBarExtraContent={
        <Button onClick={() => refetch?.()}>
          <RedoOutlined />
        </Button>
      }
    >
      <Tabs.TabPane
        key="idled"
        tab={
          <Badge
            size="small"
            offset={[10, -10]}
            count={idledLeads.filter(lead => lead.notified).length}
            overflowCount={999}
          >
            {formatMessage(salesMessages.idledLead)}
            <span>({idledLeads.length})</span>
          </Badge>
        }
      >
        {<SalesLeadTable sales={sales} leads={idledLeads} onRefetch={refetch} />}
      </Tabs.TabPane>

      <Tabs.TabPane
        key="contacted"
        tab={
          <Badge
            size="small"
            offset={[10, -10]}
            count={contactedLeads.filter(lead => lead.notified).length}
            overflowCount={999}
          >
            {formatMessage(salesMessages.contactedLead)}
            <span>({contactedLeads.length})</span>
          </Badge>
        }
      >
        {<SalesLeadTable sales={sales} leads={contactedLeads} onRefetch={refetch} />}
      </Tabs.TabPane>

      <Tabs.TabPane
        key="invited"
        tab={
          <Badge
            size="small"
            offset={[10, -10]}
            count={invitedLeads.filter(lead => lead.notified).length}
            overflowCount={999}
          >
            {formatMessage(salesMessages.invitedLead)}
            <span>({invitedLeads.length})</span>
          </Badge>
        }
      >
        {<SalesLeadTable sales={sales} leads={invitedLeads} onRefetch={refetch} />}
      </Tabs.TabPane>

      <Tabs.TabPane
        key="presented"
        tab={
          <Badge
            size="small"
            offset={[10, -10]}
            count={presentedLeads.filter(lead => lead.notified).length}
            overflowCount={999}
          >
            {formatMessage(salesMessages.presentedLead)}
            <span>({presentedLeads.length})</span>
          </Badge>
        }
      >
        {<SalesLeadTable sales={sales} leads={presentedLeads} onRefetch={refetch} />}
      </Tabs.TabPane>

      <Tabs.TabPane
        key="paid"
        tab={
          <Badge
            size="small"
            offset={[10, -10]}
            count={paidLeads.filter(lead => lead.notified).length}
            overflowCount={999}
          >
            {formatMessage(salesMessages.paidLead)}
            <span>({paidLeads.length})</span>
          </Badge>
        }
      >
        {<SalesLeadTable sales={sales} leads={paidLeads} onRefetch={refetch} />}
      </Tabs.TabPane>

      {closedLeads.length > 0 && (
        <Tabs.TabPane
          key="closed"
          tab={
            <Badge
              size="small"
              offset={[10, -10]}
              count={closedLeads.filter(lead => lead.notified).length}
              overflowCount={999}
            >
              {formatMessage(salesMessages.closedLead)}
              <span>({closedLeads.length})</span>
            </Badge>
          }
        >
          {<SalesLeadTable sales={sales} leads={closedLeads} onRefetch={refetch} />}
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
      pollInterval: 30000,
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
const useSalesLeads = (managerId: string) => {
  const { id: appId } = useApp()
  const { data, error, loading, refetch } = useQuery<hasura.GET_SALES_LEADS, hasura.GET_SALES_LEADSVariables>(
    GET_SALES_LEADS,
    {
      variables: { appId, managerId },
      context: {
        important: true,
      },
      pollInterval: 5 * 60 * 1000,
    },
  )
  const convertToLead = (v: hasura.GET_SALES_LEADS_lead_status): Lead | null => {
    const notified =
      v.paid <= 0 &&
      v.member &&
      (!v.recent_contacted_at ||
        !v.recent_tasked_at ||
        (v.recent_contacted_at && moment(v.recent_contacted_at) <= moment().startOf('day').subtract(3, 'weeks')) ||
        (v.recent_tasked_at && moment(v.recent_tasked_at) <= moment().startOf('day').subtract(3, 'days')))
    return v.member && v.member.member_phones.length > 0
      ? {
          id: v.member.id,
          star: v.member.star,
          name: v.member.name,
          email: v.member.email,
          createdAt: moment(v.member.created_at).toDate(),
          phones: v.member.member_phones.map(_v => _v.phone),
          categoryNames: v.member.member_categories.map(_v => _v.category.name),
          paid: v.paid,
          status: v.status as Lead['status'],
          notified,
        }
      : null
  }

  const leads = sortBy(prop('id'))(data?.lead_status.map(convertToLead).filter(notEmpty) || [])
  return {
    loading,
    error,
    refetch,
    idledLeads: leads.filter(lead => lead.status === 'IDLED'),
    contactedLeads: leads.filter(lead => lead.status === 'CONTACTED'),
    invitedLeads: leads.filter(lead => lead.status === 'INVITED'),
    presentedLeads: leads.filter(lead => lead.status === 'PRESENTED'),
    paidLeads: leads.filter(lead => lead.status === 'PAID'),
    closedLeads: leads.filter(lead => lead.status === 'CLOSED'),
  }
}

const GET_SALES_LEADS = gql`
  query GET_SALES_LEADS($appId: String!, $managerId: String!) {
    lead_status(where: { member: { app_id: { _eq: $appId }, manager_id: { _eq: $managerId } } }) {
      member {
        id
        name
        email
        star
        created_at
        assigned_at
        member_phones {
          phone
        }
        member_categories {
          category {
            name
          }
        }
      }
      status
      paid
      recent_contacted_at
      recent_tasked_at
    }
  }
`

export default SalesLeadPage
