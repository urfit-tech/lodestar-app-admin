import Icon, { PhoneOutlined } from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { notification, Skeleton } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminPageTitle } from '../components/admin'
import MemberSelector from '../components/form/MemberSelector'
import AdminLayout from '../components/layout/AdminLayout'
import SalesLeadTabs, { SelectedLeadStatusCategory } from '../components/sale/SalesLeadTabs'
import hasura from '../hasura'
import { salesMessages } from '../helpers/translation'
import { useManagers } from '../hooks/sales'
import ForbiddenPage from './ForbiddenPage'
import pageMessages from './translation'

const StyledManagerBlock = styled.div`
  width: 400px;
`

export const StyledLine = styled.div`
  width: 100%;
  height: 1px;
  background-color: #e9e9e9;
  margin: 2px 0;
`

const SalesLeadManagerSelectorStatus = () => {
  const { permissions } = useAuth()
  if (
    Boolean(permissions.SALES_LEAD_SAME_DIVISION_SELECTOR) === true &&
    Boolean(permissions.SALES_LEAD_SELECTOR_ADMIN) === false
  ) {
    return 'onlySameDivision'
  } else {
    return 'default'
  }
}

const SalesLeadPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { currentMemberId, currentMember, permissions } = useAuth()
  const { managers } = useManagers(SalesLeadManagerSelectorStatus())
  const [activeKey, setActiveKey] = useState('FOLLOWED')
  const [managerId, setManagerId] = useState<string | null>(currentMemberId)
  useMemberContractNotification()
  const [selectedLeadStatusCategory, setSelectedLeadStatusCategory] = useState<SelectedLeadStatusCategory | null>(null)

  const manager =
    managers.find(manager => manager.id === managerId) || (permissions.SALES_LEAD_ADMIN ? managers?.[0] : null)

  const currentMemberIsManager = managers.some(manager => manager.id === currentMemberId)

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
        {(permissions.SALES_LEAD_SELECTOR_ADMIN || permissions.SALES_LEAD_SAME_DIVISION_SELECTOR) && manager ? (
          <StyledManagerBlock className="d-flex flex-row align-items-center">
            <span className="flex-shrink-0">{formatMessage(pageMessages.SalesLeadPage.agent)}：</span>
            <MemberSelector
              members={managers}
              value={manager.id}
              onChange={value => {
                typeof value === 'string' && setManagerId(value)
                setSelectedLeadStatusCategory(null)
              }}
            />
          </StyledManagerBlock>
        ) : currentMember ? (
          <div>
            {formatMessage(pageMessages.SalesLeadPage.agentId)}：{currentMember.id}
          </div>
        ) : null}
      </div>
      {manager ? (
        <SalesLeadTabs
          activeKey={activeKey}
          manager={manager}
          currentMemberIsManager={currentMemberIsManager}
          onActiveKeyChanged={setActiveKey}
          selectedLeadStatusCategory={selectedLeadStatusCategory}
          onSelectedLeadStatusCategoryChange={selectedLeadStatusCategory =>
            setSelectedLeadStatusCategory(selectedLeadStatusCategory)
          }
        />
      ) : (
        <Skeleton active />
      )}
    </AdminLayout>
  )
}

const useMemberContractNotification = () => {
  const { formatMessage } = useIntl()
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
        message: `${v.names.join('、')} ${formatMessage(pageMessages.SalesLeadPage.got)} ${new Intl.NumberFormat(
          'zh',
        ).format(v.totalPrice)}`,
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
  }, [data, formatMessage])
}

export default SalesLeadPage
