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
import AddListModal from '../components/sale/AddListModal'
import ManagerListModal from '../components/sale/ManagerListModal'
import SalesLeadTable from '../components/sale/SalesLeadTable'
import hasura from '../hasura'
import { salesMessages } from '../helpers/translation'
import { useLeadStatusCategory, useManagerLeads, useManagers } from '../hooks/sales'
import { LeadStatus, Manager } from '../types/sales'
import ForbiddenPage from './ForbiddenPage'

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
  const [selectedLeadStatusCategory, setSelectedLeadStatusCategory] = useState<{ id: string; name: string } | null>(
    null,
  )
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
  const [isOpenAddListModal, setIsOpenAddListModal] = useState(false)
  const [isOpenManagerListModal, setIsOpenManagerListModal] = useState(false)
  const [listStatus, setListStatus] = useState<LeadStatus>('FOLLOWED')
  const {
    leadStatusCategories,
    refetchLeadStatusCategory,
    handleAddLeadStatusCategory,
    handleManagerLeadStatusCategory,
  } = useLeadStatusCategory(manager.id)

  const handleOpenAddListModal = (status: LeadStatus) => {
    setIsOpenAddListModal(true)
    setListStatus(status)
  }

  const handleOpenManagerListModal = (status: LeadStatus) => {
    setIsOpenManagerListModal(true)
    setListStatus(status)
  }

  useEffect(() => {
    if (!loading && !loadingMembers) {
      setRefetchLoading(false)
    } else {
      setRefetchLoading(true)
    }
  }, [loading, loadingMembers])

  const followLeadStatusCategoryLists = followedLeads.filter(lead =>
    selectedLeadStatusCategory
      ? selectedLeadStatusCategory.id === lead.leadStatusCategoryId
      : !lead.leadStatusCategoryId,
  )

  return (
    <>
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
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    onClick={() => {
                      setSelectedLeadStatusCategory(null)
                    }}
                  >
                    {!selectedLeadStatusCategory && <CheckOutlined className="mr-1" />}
                    {formatMessage(salesMessages.followedLead) + formatMessage(salesMessages.list)}
                    <span>({followedLeads.filter(lead => !lead.leadStatusCategoryId).length})</span>
                  </Menu.Item>
                  {leadStatusCategories.map(category => (
                    <Menu.Item
                      key={category.id}
                      onClick={() => {
                        setSelectedLeadStatusCategory({ id: category.id, name: category.listName })
                      }}
                    >
                      {selectedLeadStatusCategory?.id === category.id && <CheckOutlined className="mr-1" />}
                      {category.listName}
                      <span>({followedLeads.filter(lead => category.id === lead.leadStatusCategoryId).length})</span>
                    </Menu.Item>
                  ))}
                  <StyledLine />
                  <Menu.Item onClick={() => handleOpenAddListModal('FOLLOWED')}>
                    {formatMessage(salesMessages.addList)}
                  </Menu.Item>
                  {leadStatusCategories.length > 0 && (
                    <Menu.Item onClick={() => handleOpenManagerListModal('FOLLOWED')}>
                      {formatMessage(salesMessages.managerList)}
                    </Menu.Item>
                  )}
                </Menu>
              }
            >
              <Center onClick={() => setContactedTabState(null)}>
                {formatMessage(salesMessages.followedLead)}
                <span>({refetchLoading ? <Spin size="small" /> : followedLeads.length})</span>
                <DownOutlined className="mr-0 ml-1" />
              </Center>
            </Dropdown>
          }
        >
          <SalesLeadTable
            title={`${
              selectedLeadStatusCategory?.name ||
              formatMessage(salesMessages.followedLead) + formatMessage(salesMessages.list)
            }(${followLeadStatusCategoryLists.length})`}
            variant="followed"
            manager={manager}
            leads={followLeadStatusCategoryLists}
            onRefetch={async () => {
              await refetchMembers?.()
              await refetch?.()
            }}
            isLoading={refetchLoading}
            followedLeads={followedLeads}
          />
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
              followedLeads={followedLeads}
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
              followedLeads={followedLeads}
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
              followedLeads={followedLeads}
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
              followedLeads={followedLeads}
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
              followedLeads={followedLeads}
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
              followedLeads={followedLeads}
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
              followedLeads={followedLeads}
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
              followedLeads={followedLeads}
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
              followedLeads={followedLeads}
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
              followedLeads={followedLeads}
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
                followedLeads={followedLeads}
              />
            }
          </Tabs.TabPane>
        )}
      </Tabs>
      <AddListModal
        visible={isOpenAddListModal}
        handleClose={() => {
          setIsOpenAddListModal(false)
        }}
        handleAddLeadStatusCategory={async listName => {
          await handleAddLeadStatusCategory(
            listName,
            listStatus,
            async () => {
              alert(formatMessage(salesMessages.additionSuccessful))
              await refetchLeadStatusCategory()
              await refetchMembers?.()
              await refetch?.()
              setSelectedLeadStatusCategory(null)
            },
            err => {
              console.log(err)
              alert(formatMessage(salesMessages.additionFailed))
            },
          )
        }}
      />
      {leadStatusCategories.length > 0 && (
        <ManagerListModal
          visible={isOpenManagerListModal}
          handleClose={() => {
            setIsOpenManagerListModal(false)
          }}
          handleManagerLeadStatusCategory={async (deletedLeadStatusCategoryIds, memberIds) => {
            if (window.confirm(formatMessage(salesMessages.deleteListConfirmMessage))) {
              await handleManagerLeadStatusCategory(
                deletedLeadStatusCategoryIds,
                memberIds,
                async () => {
                  alert(formatMessage(salesMessages.savedSuccessfully))
                  await refetchLeadStatusCategory()
                  await refetchMembers?.()
                  await refetch?.()
                  setSelectedLeadStatusCategory(null)
                },
                err => {
                  console.log(err)
                  alert(formatMessage(salesMessages.saveFailed))
                },
              )
            }
          }}
          leadStatusCategories={leadStatusCategories}
          leads={followedLeads} // TODO: 這邊要改成所有的leads
        />
      )}
    </>
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
