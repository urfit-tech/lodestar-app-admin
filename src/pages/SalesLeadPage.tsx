import Icon, { CheckOutlined, DownOutlined, PhoneOutlined, RedoOutlined } from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { Center } from '@chakra-ui/layout'
import { Button, Dropdown, Menu, notification, Skeleton, Spin, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminPageTitle } from '../components/admin'
import MemberSelector from '../components/form/MemberSelector'
import AdminLayout from '../components/layout/AdminLayout'
import SalesLeadTable from '../components/sale/SalesLeadTable'
import hasura from '../hasura'
import { salesMessages } from '../helpers/translation'
import { useManagerLeads, useManagers } from '../hooks/sales'
import { Manager } from '../types/sales'
import ForbiddenPage from './ForbiddenPage'

const StyledManagerBlock = styled.div`
  width: 400px;
`

const SalesLeadPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { currentMemberId, currentMember, permissions } = useAuth()
  const { managers } = useManagers(
    (Boolean(permissions.SALES_LEAD_SELECTOR_ADMIN) === true &&
      Boolean(permissions.SALES_LEAD_SAME_DIVISION_SELECTOR) === true) ||
      Boolean(permissions.SALES_LEAD_SAME_DIVISION_SELECTOR),
  )
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
        {(permissions.SALES_LEAD_SELECTOR_ADMIN || permissions.SALES_LEAD_SAME_DIVISION_SELECTOR) && manager ? (
          <StyledManagerBlock className="d-flex flex-row align-items-center">
            <span className="flex-shrink-0">承辦人：</span>
            <MemberSelector
              members={managers}
              value={manager.id}
              onChange={value => typeof value === 'string' && setManagerId(value)}
            />
          </StyledManagerBlock>
        ) : currentMember ? (
          <div>承辦編號：{currentMember.id}</div>
        ) : null}
      </div>
      {manager ? (
        <SalesLeadTabs activeKey={activeKey} manager={manager} onActiveKeyChanged={setActiveKey} />
      ) : (
        <Skeleton active />
      )}
    </AdminLayout>
  )
}

const SalesLeadTabs: React.VFC<{
  manager: Manager
  activeKey: string
  onActiveKeyChanged: (activeKey: string) => void
}> = ({ activeKey, manager, onActiveKeyChanged }) => {
  const [refetchLoading, setRefetchLoading] = useState(true)
  const [demoTabState, setDemoTabState] = useState<'invited' | 'presented' | null>(null)
  const [contactedTabState, setContactedTabState] = useState<'answered' | 'contacted' | null>(null)
  const { formatMessage } = useIntl()
  const {
    refetch,
    refetchMembers,
    followedLeads,
    totalLeads,
    idledLeads,
    contactedLeads,
    answeredLeads,
    invitedLeads,
    presentedLeads,
    signedLeads,
    closedLeads,
    completedLeads,
    loading,
    loadingMembers,
  } = useManagerLeads(manager)

  useEffect(() => {
    if (!loading && !loadingMembers) {
      setRefetchLoading(false)
    } else {
      setRefetchLoading(true)
    }
  }, [loading, loadingMembers])

  return (
    <Tabs
      activeKey={activeKey}
      onChange={onActiveKeyChanged}
      tabBarExtraContent={
        <Button
          onClick={async () => {
            await refetchMembers?.()
            await refetch?.()
          }}
        >
          <RedoOutlined />
        </Button>
      }
    >
      <Tabs.TabPane
        key="followed"
        tab={
          <div>
            {formatMessage(salesMessages.followedLead)}
            <span>({refetchLoading ? <Spin size="small" /> : followedLeads.length})</span>
          </div>
        }
      >
        {
          <SalesLeadTable
            variant="followed"
            manager={manager}
            leads={followedLeads}
            onRefetch={async () => {
              await refetchMembers?.()
              await refetch?.()
            }}
            isLoading={refetchLoading}
          />
        }
      </Tabs.TabPane>

      <Tabs.TabPane
        key="total"
        tab={
          <div>
            {formatMessage(salesMessages.totalLead)}
            <span>({refetchLoading ? <Spin size="small" /> : totalLeads.length})</span>
          </div>
        }
      >
        {
          <SalesLeadTable
            manager={manager}
            leads={totalLeads}
            onRefetch={async () => {
              await refetchMembers?.()
              await refetch?.()
            }}
            isLoading={refetchLoading}
          />
        }
      </Tabs.TabPane>

      <Tabs.TabPane
        key="idled"
        tab={
          <div>
            {formatMessage(salesMessages.idledLead)}
            <span>({refetchLoading ? <Spin size="small" /> : idledLeads.length})</span>
          </div>
        }
      >
        {
          <SalesLeadTable
            manager={manager}
            leads={idledLeads}
            onRefetch={async () => {
              await refetchMembers?.()
              await refetch?.()
            }}
            isLoading={refetchLoading}
          />
        }
      </Tabs.TabPane>

      <Tabs.TabPane
        key="called"
        tab={
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item onClick={() => setContactedTabState('contacted')}>
                  <Center>
                    {'contacted' === contactedTabState && <CheckOutlined className="mr-1" />}
                    {formatMessage(salesMessages.contactedLead)}
                    <span>({contactedLeads.length})</span>
                  </Center>
                </Menu.Item>
                <Menu.Item onClick={() => setContactedTabState('answered')}>
                  <Center>
                    {'answered' === contactedTabState && <CheckOutlined className="mr-1" />}
                    {formatMessage(salesMessages.answeredLeads)}
                    <span>({answeredLeads.length})</span>
                  </Center>
                </Menu.Item>
              </Menu>
            }
          >
            <Center onClick={() => setContactedTabState(null)}>
              {formatMessage(salesMessages.calledLead)}
              <span>({refetchLoading ? <Spin size="small" /> : contactedLeads.length + answeredLeads.length})</span>
              <DownOutlined className="mr-0 ml-1" />
            </Center>
          </Dropdown>
        }
      >
        {null === contactedTabState && (
          <SalesLeadTable
            manager={manager}
            leads={[...contactedLeads, ...answeredLeads]}
            onRefetch={async () => {
              await refetchMembers?.()
              await refetch?.()
            }}
            isLoading={refetchLoading}
          />
        )}
        {'contacted' === contactedTabState && (
          <SalesLeadTable
            manager={manager}
            leads={contactedLeads}
            onRefetch={async () => {
              await refetchMembers?.()
              await refetch?.()
            }}
            isLoading={refetchLoading}
          />
        )}
        {'answered' === contactedTabState && (
          <SalesLeadTable
            manager={manager}
            leads={answeredLeads}
            onRefetch={async () => {
              await refetchMembers?.()
              await refetch?.()
            }}
            isLoading={refetchLoading}
          />
        )}
      </Tabs.TabPane>

      <Tabs.TabPane
        key="demo"
        tab={
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item onClick={() => setDemoTabState('invited')}>
                  <Center>
                    {'invited' === demoTabState && <CheckOutlined className="mr-1" />}
                    {formatMessage(salesMessages.invitedLead)}
                    <span>({invitedLeads.length})</span>
                  </Center>
                </Menu.Item>
                <Menu.Item onClick={() => setDemoTabState('presented')}>
                  <Center>
                    {'presented' === demoTabState && <CheckOutlined className="mr-1" />}
                    {formatMessage(salesMessages.presentedLead)}
                    <span>({presentedLeads.length})</span>
                  </Center>
                </Menu.Item>
              </Menu>
            }
          >
            <Center onClick={() => setDemoTabState(null)}>
              {formatMessage(salesMessages.demoReservation)}
              <span>({refetchLoading ? <Spin size="small" /> : invitedLeads.length + presentedLeads.length})</span>
              <DownOutlined className="mr-0 ml-1" />
            </Center>
          </Dropdown>
        }
      >
        {null === demoTabState && (
          <SalesLeadTable
            manager={manager}
            leads={[...invitedLeads, ...presentedLeads]}
            onRefetch={async () => {
              await refetchMembers?.()
              await refetch?.()
            }}
            isLoading={refetchLoading}
          />
        )}
        {'invited' === demoTabState && (
          <SalesLeadTable
            manager={manager}
            leads={invitedLeads}
            onRefetch={async () => {
              await refetchMembers?.()
              await refetch?.()
            }}
            isLoading={refetchLoading}
          />
        )}
        {'presented' === demoTabState && (
          <SalesLeadTable
            manager={manager}
            leads={presentedLeads}
            onRefetch={async () => {
              await refetchMembers?.()
              await refetch?.()
            }}
            isLoading={refetchLoading}
          />
        )}
      </Tabs.TabPane>

      <Tabs.TabPane
        key="completed"
        tab={
          <div>
            {formatMessage(salesMessages.completedLead)}
            <span>({refetchLoading ? <Spin size="small" /> : completedLeads.length})</span>
          </div>
        }
      >
        {
          <SalesLeadTable
            variant="completed"
            manager={manager}
            leads={completedLeads}
            onRefetch={async () => {
              await refetchMembers?.()
              await refetch?.()
            }}
            isLoading={refetchLoading}
          />
        }
      </Tabs.TabPane>

      <Tabs.TabPane
        key="signed"
        tab={
          <div>
            {formatMessage(salesMessages.signedLead)}
            <span>({refetchLoading ? <Spin size="small" /> : signedLeads.length})</span>
          </div>
        }
      >
        {
          <SalesLeadTable
            manager={manager}
            leads={signedLeads}
            onRefetch={async () => {
              await refetchMembers?.()
              await refetch?.()
            }}
            isLoading={refetchLoading}
          />
        }
      </Tabs.TabPane>

      {closedLeads.length > 0 && (
        <Tabs.TabPane
          key="closed"
          tab={
            <div>
              {formatMessage(salesMessages.closedLead)}
              <span>({refetchLoading ? <Spin size="small" /> : closedLeads.length})</span>
            </div>
          }
        >
          {
            <SalesLeadTable
              manager={manager}
              leads={closedLeads}
              onRefetch={async () => {
                await refetchMembers?.()
                await refetch?.()
              }}
              isLoading={refetchLoading}
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
