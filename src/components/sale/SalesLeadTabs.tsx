import { CheckOutlined, DownOutlined, RedoOutlined } from '@ant-design/icons'
import { Center } from '@chakra-ui/layout'
import { Button, Dropdown, Menu, Spin, Tabs } from 'antd'
import { SorterResult, TablePaginationConfig } from 'antd/lib/table/interface'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import AddListModal from '../../components/sale/AddListModal'
import ManagerListModal from '../../components/sale/ManagerListModal'
import SalesLeadTable from '../../components/sale/SalesLeadTable'
import { salesMessages } from '../../helpers/translation'
import { Filter, useLeadStatusCategory, useManagerLeads } from '../../hooks/sales'
import { StyledLine } from '../../pages/SalesLeadPage'
import { LeadStatus, Manager, SalesLeadMember } from '../../types/sales'

export type SelectedLeadStatusCategory = {
  id: string
  categoryName: string
  categoryId: string
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
  const [filter, setFilter] = useState<Filter>({})
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
  const { refetch, loading, salesLeadMembersData, setSalesLeadMembersData } = useManagerLeads(
    manager,
    pagination?.current || 1,
    pagination?.pageSize || defaultPageSize,
    demoTabState || contactedTabState || activeKey,
    selectedLeadStatusCategory?.id || null,
    sorter,
    filter,
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
                  setFilter({})
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
              onRefetch={async () => await refetch?.()}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              isLoading={refetchLoading}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onFilter={setFilter}
              filter={filter}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
                setFilter({
                  ...filter,
                  categoryName: filters.categoryNames,
                  leadLevel: filters.leadLevel,
                })
              }}
              onSaleLeadChange={data => setSalesLeadMembersData(data)}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              salesLeadMembersData={salesLeadMembersData}
              dataCount={salesLeadMembersData?.filterCount || 0}
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
                setFilter({})
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
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
                setFilter({
                  ...filter,
                  categoryName: filters.categoryNames,
                  leadLevel: filters.leadLevel,
                })
              }}
              onSaleLeadChange={data => setSalesLeadMembersData(data)}
              onFilter={setFilter}
              filter={filter}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              salesLeadMembersData={salesLeadMembersData}
              dataCount={salesLeadMembersData?.filterCount || 0}
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
                setFilter({})
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
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
                setFilter({
                  ...filter,
                  categoryName: filters.categoryNames,
                  leadLevel: filters.leadLevel,
                })
              }}
              onFilter={setFilter}
              filter={filter}
              onSaleLeadChange={data => setSalesLeadMembersData(data)}
              salesLeadMembersData={salesLeadMembersData}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              dataCount={salesLeadMembersData?.filterCount || 0}
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
                      setFilter({})
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
                      setFilter({})
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
                  setFilter({})
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
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
                setFilter({
                  ...filter,
                  categoryName: filters.categoryNames,
                  leadLevel: filters.leadLevel,
                })
              }}
              onFilter={setFilter}
              filter={filter}
              onSaleLeadChange={data => setSalesLeadMembersData(data)}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              salesLeadMembersData={salesLeadMembersData}
              dataCount={salesLeadMembersData?.filterCount || 0}
            />
          )}
          {'CONTACTED' === contactedTabState && (
            <SalesLeadTable
              manager={manager}
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
                setFilter({
                  ...filter,
                  categoryName: filters.categoryNames,
                  leadLevel: filters.leadLevel,
                })
              }}
              onFilter={setFilter}
              filter={filter}
              onSaleLeadChange={data => setSalesLeadMembersData(data)}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              salesLeadMembersData={salesLeadMembersData}
              dataCount={salesLeadMembersData?.filterCount || 0}
            />
          )}
          {'ANSWERED' === contactedTabState && (
            <SalesLeadTable
              manager={manager}
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
                setFilter({
                  ...filter,
                  categoryName: filters.categoryNames,
                  leadLevel: filters.leadLevel,
                })
              }}
              onFilter={setFilter}
              filter={filter}
              onSaleLeadChange={data => setSalesLeadMembersData(data)}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              salesLeadMembersData={salesLeadMembersData}
              dataCount={salesLeadMembersData?.filterCount || 0}
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
                      setFilter({})
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
                      setFilter({})
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
                  setFilter({})
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
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
                setFilter({
                  ...filter,
                  categoryName: filters.categoryNames,
                  leadLevel: filters.leadLevel,
                })
              }}
              onFilter={setFilter}
              filter={filter}
              onSaleLeadChange={data => setSalesLeadMembersData(data)}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              salesLeadMembersData={salesLeadMembersData}
              dataCount={salesLeadMembersData?.filterCount || 0}
            />
          )}
          {'INVITED' === demoTabState && (
            <SalesLeadTable
              manager={manager}
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
                setFilter({
                  ...filter,
                  categoryName: filters.categoryNames,
                  leadLevel: filters.leadLevel,
                })
              }}
              onFilter={setFilter}
              filter={filter}
              onSaleLeadChange={data => setSalesLeadMembersData(data)}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              salesLeadMembersData={salesLeadMembersData}
              dataCount={salesLeadMembersData?.filterCount || 0}
            />
          )}
          {'PRESENTED' === demoTabState && (
            <SalesLeadTable
              manager={manager}
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
                setFilter({
                  ...filter,
                  categoryName: filters.categoryNames,
                  leadLevel: filters.leadLevel,
                })
              }}
              onFilter={setFilter}
              filter={filter}
              onSaleLeadChange={data => setSalesLeadMembersData(data)}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              salesLeadMembersData={salesLeadMembersData}
              dataCount={salesLeadMembersData?.filterCount || 0}
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
                setFilter({})
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
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
                setFilter({
                  ...filter,
                  categoryName: filters.categoryNames,
                  leadLevel: filters.leadLevel,
                })
              }}
              onFilter={setFilter}
              filter={filter}
              onSaleLeadChange={data => setSalesLeadMembersData(data)}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              salesLeadMembersData={salesLeadMembersData}
              dataCount={salesLeadMembersData?.filterCount || 0}
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
                setFilter({})
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
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
                setFilter({
                  ...filter,
                  categoryName: filters.categoryNames,
                  leadLevel: filters.leadLevel,
                })
              }}
              onFilter={setFilter}
              filter={filter}
              onSaleLeadChange={data => setSalesLeadMembersData(data)}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              salesLeadMembersData={salesLeadMembersData}
              dataCount={salesLeadMembersData?.filterCount || 0}
            />
          )}
        </Tabs.TabPane>

        <Tabs.TabPane
          key="RESUBMISSION"
          tab={
            <div
              onClick={() => {
                setSelectedRowKeys([])
                setFilter({})
              }}
            >
              {formatMessage(salesMessages.resubmissionLead)}
              <span>({refetchLoading ? <Spin size="small" /> : salesLeadMembersData?.resubmissionCount})</span>
            </div>
          }
        >
          {activeKey === 'RESUBMISSION' && (
            <SalesLeadTable
              variant="resubmission"
              manager={manager}
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
                setFilter({
                  ...filter,
                  categoryName: filters.categoryNames,
                  leadLevel: filters.leadLevel,
                })
              }}
              onFilter={setFilter}
              filter={filter}
              onSaleLeadChange={data => setSalesLeadMembersData(data)}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              salesLeadMembersData={salesLeadMembersData}
              dataCount={salesLeadMembersData?.filterCount || 0}
            />
          )}
        </Tabs.TabPane>

        <Tabs.TabPane
          key="CALLBACKED"
          tab={
            <div
              onClick={() => {
                setSelectedRowKeys([])
                setDemoTabState(null)
                setContactedTabState(null)
                setSorter(undefined)
                setFilter({})
              }}
            >
              {formatMessage(salesMessages.callbackedLead)}
              <span>({refetchLoading ? <Spin size="small" /> : salesLeadMembersData?.callbackedLeadsCount})</span>
            </div>
          }
        >
          {activeKey === 'CALLBACKED' && (
            <SalesLeadTable
              variant="callbacked"
              manager={manager}
              onRefetch={async () => await refetch?.()}
              isLoading={refetchLoading}
              selectedRowKeys={selectedRowKeys}
              onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
              onIsOpenAddListModalChange={setIsOpenAddListModal}
              onIsOpenManagerListModalChange={setIsOpenManagerListModal}
              onTableChange={(pagination, filters, sorter) => {
                setPagination(pagination)
                setSorter(sorter)
                setSelectedRowKeys([])
                setFilter({
                  ...filter,
                  categoryName: filters.categoryNames,
                  leadLevel: filters.leadLevel,
                })
              }}
              onFilter={setFilter}
              filter={filter}
              onSaleLeadChange={data => setSalesLeadMembersData(data)}
              leads={salesLeadMembersData?.salesLeadMembers || []}
              salesLeadMembersData={salesLeadMembersData}
              dataCount={salesLeadMembersData?.filterCount || 0}
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
                  setFilter({})
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
                onRefetch={async () => await refetch?.()}
                isLoading={refetchLoading}
                selectedRowKeys={selectedRowKeys}
                onSelectChange={newSelectedRowKeys => setSelectedRowKeys(newSelectedRowKeys)}
                onIsOpenAddListModalChange={setIsOpenAddListModal}
                onIsOpenManagerListModalChange={setIsOpenManagerListModal}
                onTableChange={(pagination, filters, sorter) => {
                  setPagination(pagination)
                  setSorter(sorter)
                  setSelectedRowKeys([])
                  setFilter({
                    ...filter,
                    categoryName: filters.categoryNames,
                    leadLevel: filters.leadLevel,
                  })
                }}
                onFilter={setFilter}
                filter={filter}
                onSaleLeadChange={data => setSalesLeadMembersData(data)}
                leads={salesLeadMembersData?.salesLeadMembers || []}
                salesLeadMembersData={salesLeadMembersData}
                dataCount={salesLeadMembersData?.filterCount || 0}
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
          leads={salesLeadMembersData?.salesLeadMembers || []}
        />
      )}
    </>
  )
}

export default SalesLeadTabs
