import Icon, { CheckOutlined, DownOutlined, PhoneOutlined, RedoOutlined } from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { Center } from '@chakra-ui/layout'
import { Button, Dropdown, Menu, notification, Skeleton, Spin, Tabs } from 'antd'
import { SorterResult, TablePaginationConfig } from 'antd/lib/table/interface'
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
import { LeadStatus, Manager, SalesLeadMember } from '../types/sales'
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

type SelectedLeadStatusCategory = {
  id: string
  categoryName: string
  categoryId: string
}

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

const SalesLeadTabs: React.VFC<{
  manager: Manager
  activeKey: string
  selectedLeadStatusCategory: SelectedLeadStatusCategory | null
  onActiveKeyChanged: (activeKey: string) => void
  onSelectedLeadStatusCategoryChange: (selectedLeadStatusCategory: SelectedLeadStatusCategory | null) => void
}> = ({ activeKey, manager, onActiveKeyChanged, selectedLeadStatusCategory, onSelectedLeadStatusCategoryChange }) => {
  const { settings } = useApp()
  const [refetchLoading, setRefetchLoading] = useState(true)
  const [demoTabState, setDemoTabState] = useState<'INVITED' | 'PRESENTED' | null>(null)
  const [contactedTabState, setContactedTabState] = useState<'ANSWERED' | 'CONTACTED' | null>(null)
  const [pagination, setPagination] = useState<TablePaginationConfig>()
  const [sorter, setSorter] = useState<SorterResult<SalesLeadMember> | SorterResult<SalesLeadMember>[]>()

  const settingDefaultPageSize = settings['sale_lead.sale_lead_table.default_page_size']
  const settingPageSizeOptions = settings['sale_lead.sale_lead_table.page_size_options']

  const defaultPageSize = settingDefaultPageSize
    ? Number(settingDefaultPageSize)
    : settingPageSizeOptions
    ? settingPageSizeOptions.split(',').length > 0
      ? Number(settingPageSizeOptions.split(',')[0])
      : 100
    : 100

  const { formatMessage } = useIntl()
  const { refetch, loading, salesLeadMembersData } = useManagerLeads(
    manager,
    pagination?.current || 1,
    pagination?.pageSize || defaultPageSize,
    demoTabState || contactedTabState || activeKey,
    selectedLeadStatusCategory?.id || null,
    sorter,
  )

  const [isOpenAddListModal, setIsOpenAddListModal] = useState(false)
  const [isOpenManagerListModal, setIsOpenManagerListModal] = useState(false)
  const [listStatus, setListStatus] = useState<LeadStatus>('FOLLOWED')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
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
    if (!loading) {
      setRefetchLoading(false)
    } else {
      setRefetchLoading(true)
    }
  }, [loading])

  const followLeadStatusCategoryLists = salesLeadMembersData?.followedLeads.filter(lead =>
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
              await refetchLeadStatusCategory()
              await refetch?.()
            }}
          >
            <RedoOutlined />
          </Button>
        }
      >
        <Tabs.TabPane
          key="FOLLOWED"
          tab={
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    onClick={() => {
                      onSelectedLeadStatusCategoryChange(null)
                      setSelectedRowKeys([])
                      setPagination(undefined)
                    }}
                  >
                    {!selectedLeadStatusCategory && <CheckOutlined className="mr-1" />}
                    {formatMessage(salesMessages.followedLead) + formatMessage(salesMessages.list)}
                    <span>
                      (
                      {
                        salesLeadMembersData?.followedLeads.filter(
                          (lead: { leadStatusCategoryId: string | null }) => !lead.leadStatusCategoryId,
                        ).length
                      }
                      )
                    </span>
                  </Menu.Item>
                  {leadStatusCategories.map(leadStatusCategory => (
                    <Menu.Item
                      key={leadStatusCategory.id}
                      onClick={() => {
                        onSelectedLeadStatusCategoryChange({
                          id: leadStatusCategory.id,
                          categoryName: leadStatusCategory.categoryName,
                          categoryId: leadStatusCategory.categoryId,
                        })
                        setSelectedRowKeys([])
                        setPagination(undefined)
                      }}
                    >
                      {selectedLeadStatusCategory?.id === leadStatusCategory.id && <CheckOutlined className="mr-1" />}
                      {leadStatusCategory.categoryName}
                      <span>
                        (
                        {
                          salesLeadMembersData?.followedLeads.filter(
                            lead => leadStatusCategory.id === lead.leadStatusCategoryId,
                          ).length
                        }
                        )
                      </span>
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
              <Center
                onClick={() => {
                  setSelectedRowKeys([])
                  setDemoTabState(null)
                  setContactedTabState(null)
                  setSorter(undefined)
                  setPagination(undefined)
                }}
              >
                {formatMessage(salesMessages.followedLead)}
                <span>({refetchLoading ? <Spin size="small" /> : salesLeadMembersData?.followedLeadsCount})</span>
                <DownOutlined className="mr-0 ml-1" />
              </Center>
            </Dropdown>
          }
        >
          {activeKey === 'FOLLOWED' && (
            <SalesLeadTable
              title={`${
                selectedLeadStatusCategory?.categoryName ||
                formatMessage(salesMessages.followedLead) + formatMessage(salesMessages.list)
              }(${followLeadStatusCategoryLists?.length || 0})`}
              variant="followed"
              manager={manager}
              selectedLeadStatusCategoryId={selectedLeadStatusCategory?.categoryId}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              onRefetch={async () => await refetch?.()}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              isLoading={refetchLoading}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              followedLeads={salesLeadMembersData?.followedLeads || []}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
              }}
              dataCount={
                salesLeadMembersData?.followedLeads.filter(lead =>
                  !selectedLeadStatusCategory?.id
                    ? !lead.leadStatusCategoryId
                    : lead.leadStatusCategoryId === selectedLeadStatusCategory?.id,
                ).length || 0
              }
            />
          )}
        </Tabs.TabPane>

        <Tabs.TabPane
          key="ALL"
          tab={
            <div
              onClick={() => {
                setSelectedRowKeys([])
                setDemoTabState(null)
                setContactedTabState(null)
                setSorter(undefined)
                setPagination(undefined)
              }}
            >
              {formatMessage(salesMessages.totalLead)}
              <span>({refetchLoading ? <Spin size="small" /> : salesLeadMembersData?.totalCount})</span>
            </div>
          }
        >
          {activeKey === 'ALL' && (
            <SalesLeadTable
              manager={manager}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              followedLeads={salesLeadMembersData?.followedLeads || []}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
              }}
              dataCount={salesLeadMembersData?.totalCount || 0}
            />
          )}
        </Tabs.TabPane>

        <Tabs.TabPane
          key="IDLED"
          tab={
            <div
              onClick={() => {
                setSelectedRowKeys([])
                setDemoTabState(null)
                setContactedTabState(null)
                setSorter(undefined)
                setPagination(undefined)
              }}
            >
              {formatMessage(salesMessages.idledLead)}
              <span>({refetchLoading ? <Spin size="small" /> : salesLeadMembersData?.idLedLeadsCount})</span>
            </div>
          }
        >
          {activeKey === 'IDLED' && (
            <SalesLeadTable
              manager={manager}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              followedLeads={salesLeadMembersData?.followedLeads || []}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
              }}
              dataCount={salesLeadMembersData?.idLedLeadsCount || 0}
            />
          )}
        </Tabs.TabPane>

        <Tabs.TabPane
          key="CALLED"
          tab={
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    onClick={() => {
                      setContactedTabState('CONTACTED')
                      setSelectedRowKeys([])
                      setPagination(undefined)
                    }}
                  >
                    <Center>
                      {'CONTACTED' === contactedTabState && <CheckOutlined className="mr-1" />}
                      {formatMessage(salesMessages.contactedLead)}
                      <span>({salesLeadMembersData?.contactedLeadsCount})</span>
                    </Center>
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => {
                      setContactedTabState('ANSWERED')
                      setSelectedRowKeys([])
                      setPagination(undefined)
                    }}
                  >
                    <Center>
                      {'ANSWERED' === contactedTabState && <CheckOutlined className="mr-1" />}
                      {formatMessage(salesMessages.answeredLeads)}
                      <span>({salesLeadMembersData?.answeredLeadsCount || 0})</span>
                    </Center>
                  </Menu.Item>
                </Menu>
              }
            >
              <Center
                onClick={() => {
                  setSelectedRowKeys([])
                  setDemoTabState(null)
                  setContactedTabState(null)
                  setSorter(undefined)
                  setPagination(undefined)
                }}
              >
                {formatMessage(salesMessages.calledLead)}
                <span>
                  (
                  {refetchLoading ? (
                    <Spin size="small" />
                  ) : (
                    (salesLeadMembersData?.contactedLeadsCount || 0) + (salesLeadMembersData?.answeredLeadsCount || 0)
                  )}
                  )
                </span>
                <DownOutlined className="mr-0 ml-1" />
              </Center>
            </Dropdown>
          }
        >
          {null === contactedTabState && activeKey === 'CALLED' && (
            <SalesLeadTable
              manager={manager}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              followedLeads={salesLeadMembersData?.followedLeads || []}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
              }}
              dataCount={
                (salesLeadMembersData?.contactedLeadsCount || 0) + (salesLeadMembersData?.answeredLeadsCount || 0)
              }
            />
          )}
          {'CONTACTED' === contactedTabState && (
            <SalesLeadTable
              manager={manager}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              followedLeads={salesLeadMembersData?.followedLeads || []}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
              }}
              dataCount={salesLeadMembersData?.contactedLeadsCount || 0}
            />
          )}
          {'ANSWERED' === contactedTabState && (
            <SalesLeadTable
              manager={manager}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              followedLeads={salesLeadMembersData?.followedLeads || []}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
              }}
              dataCount={salesLeadMembersData?.answeredLeadsCount || 0}
            />
          )}
        </Tabs.TabPane>

        <Tabs.TabPane
          key="DEMO"
          tab={
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item
                    onClick={() => {
                      setDemoTabState('INVITED')
                      setSelectedRowKeys([])
                      setPagination(undefined)
                    }}
                  >
                    <Center>
                      {'INVITED' === demoTabState && <CheckOutlined className="mr-1" />}
                      {formatMessage(salesMessages.invitedLead)}
                      <span>({salesLeadMembersData?.invitedLeadsCount})</span>
                    </Center>
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => {
                      setDemoTabState('PRESENTED')
                      setSelectedRowKeys([])
                      setPagination(undefined)
                    }}
                  >
                    <Center onClick={() => setSelectedRowKeys([])}>
                      {'PRESENTED' === demoTabState && <CheckOutlined className="mr-1" />}
                      {formatMessage(salesMessages.presentedLead)}
                      <span>({salesLeadMembersData?.presentedLeadsCount})</span>
                    </Center>
                  </Menu.Item>
                </Menu>
              }
            >
              <Center
                onClick={() => {
                  setSelectedRowKeys([])
                  setDemoTabState(null)
                  setContactedTabState(null)
                  setSorter(undefined)
                  setPagination(undefined)
                }}
              >
                {formatMessage(salesMessages.demoReservation)}
                <span>
                  (
                  {refetchLoading ? (
                    <Spin size="small" />
                  ) : (
                    (salesLeadMembersData?.invitedLeadsCount || 0) + (salesLeadMembersData?.presentedLeadsCount || 0)
                  )}
                  )
                </span>
                <DownOutlined className="mr-0 ml-1" />
              </Center>
            </Dropdown>
          }
        >
          {null === demoTabState && activeKey === 'DEMO' && (
            <SalesLeadTable
              manager={manager}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              followedLeads={salesLeadMembersData?.followedLeads || []}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
              }}
              dataCount={
                (salesLeadMembersData?.invitedLeadsCount || 0) + (salesLeadMembersData?.presentedLeadsCount || 0)
              }
            />
          )}
          {'INVITED' === demoTabState && (
            <SalesLeadTable
              manager={manager}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              followedLeads={salesLeadMembersData?.followedLeads || []}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
              }}
              dataCount={salesLeadMembersData?.invitedLeadsCount || 0}
            />
          )}
          {'PRESENTED' === demoTabState && (
            <SalesLeadTable
              manager={manager}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              followedLeads={salesLeadMembersData?.followedLeads || []}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
              }}
              dataCount={salesLeadMembersData?.presentedLeadsCount || 0}
            />
          )}
        </Tabs.TabPane>

        <Tabs.TabPane
          key="COMPLETED"
          tab={
            <div
              onClick={() => {
                setSelectedRowKeys([])
                setDemoTabState(null)
                setContactedTabState(null)
                setSorter(undefined)
                setPagination(undefined)
              }}
            >
              {formatMessage(salesMessages.completedLead)}
              <span>({refetchLoading ? <Spin size="small" /> : salesLeadMembersData?.completedLeadsCount})</span>
            </div>
          }
        >
          {activeKey === 'COMPLETED' && (
            <SalesLeadTable
              variant="completed"
              manager={manager}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              followedLeads={salesLeadMembersData?.followedLeads || []}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
              }}
              dataCount={salesLeadMembersData?.completedLeadsCount || 0}
            />
          )}
        </Tabs.TabPane>

        <Tabs.TabPane
          key="SIGNED"
          tab={
            <div
              onClick={() => {
                setSelectedRowKeys([])
                setDemoTabState(null)
                setContactedTabState(null)
                setSorter(undefined)
                setPagination(undefined)
              }}
            >
              {formatMessage(salesMessages.signedLead)}
              <span>({refetchLoading ? <Spin size="small" /> : salesLeadMembersData?.signedLeadsCount})</span>
            </div>
          }
        >
          {activeKey === 'SIGNED' && (
            <SalesLeadTable
              manager={manager}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              followedLeads={salesLeadMembersData?.followedLeads || []}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
              }}
              dataCount={salesLeadMembersData?.signedLeadsCount || 0}
            />
          )}
        </Tabs.TabPane>

        {(salesLeadMembersData?.closedLeadsCount || 0) > 0 && (
          <Tabs.TabPane
            key="CLOSED"
            tab={
              <div
                onClick={() => {
                  setSelectedRowKeys([])
                  setDemoTabState(null)
                  setContactedTabState(null)
                  setSorter(undefined)
                  setPagination(undefined)
                }}
              >
                {formatMessage(salesMessages.closedLead)}
                <span>({refetchLoading ? <Spin size="small" /> : salesLeadMembersData?.closedLeadsCount})</span>
              </div>
            }
          >
            {activeKey === 'CLOSED' && (
              <SalesLeadTable
                manager={manager}
                leads={salesLeadMembersData?.salesLeadMembers || []}
                onRefetch={async () => await refetch?.()}
                isLoading={refetchLoading}
                followedLeads={salesLeadMembersData?.followedLeads || []}
                selectedRowKeys={selectedRowKeys}
                onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
                onIsOpenAddListModalChange={setIsOpenAddListModal}
                onIsOpenManagerListModalChange={setIsOpenManagerListModal}
                onTableChange={(pagination, filters, sorter) => {
                  setPagination(pagination)
                  setSorter(sorter)
                  setSelectedRowKeys([])
                }}
                dataCount={salesLeadMembersData?.closedLeadsCount || 0}
              />
            )}
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
              await refetch?.()
              onSelectedLeadStatusCategoryChange(null)
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
                  await refetch?.()
                  onSelectedLeadStatusCategoryChange(null)
                },
                err => {
                  console.log(err)
                  alert(formatMessage(salesMessages.saveFailed))
                },
              )
            }
          }}
          leadStatusCategories={leadStatusCategories}
          leads={salesLeadMembersData?.salesLeadMembers || []} // TODO: 這邊要改成所有的leads
        />
      )}
    </>
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
  }, [data])
}

export default SalesLeadPage
