import {
  CheckOutlined,
  CheckSquareOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  FileAddOutlined,
  SearchOutlined,
  StarOutlined,
  StopOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Center } from '@chakra-ui/layout'
import { Text } from '@chakra-ui/react'
import { Button, Divider, Dropdown, Input, Menu, message, Table, Tag, Tooltip } from 'antd'
import ButtonGroup from 'antd/lib/button/button-group'
import { ColumnProps, ColumnsType, TableProps } from 'antd/lib/table'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import { uniq } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { call, handleError } from '../../helpers'
import { commonMessages, salesMessages } from '../../helpers/translation'
import { useUploadAttachments } from '../../hooks/data'
import {
  useDeleteMemberProperty,
  useMemberRating,
  useMutateMemberNote,
  useMutateMemberProperty,
  useProperty,
} from '../../hooks/member'
import { Filter, ManagerLead, useLeadStatusCategory } from '../../hooks/sales'
import { ReactComponent as LeaveTheTab } from '../../images/icon/leave_the_tab.svg'
import { StyledLine } from '../../pages/SalesLeadPage'
import { LeadStatus, Manager, SalesLeadMember } from '../../types/sales'
import AdminCard from '../admin/AdminCard'
import AdminModal from '../admin/AdminModal'
import StarRating from '../common/StarRating'
import MemberNoteAdminModal from '../member/MemberNoteAdminModal'
import MemberTaskAdminModal from '../task/MemberTaskAdminModal'
import AddListModal from './AddListModal'
import JitsiDemoModal from './JitsiDemoModal'
import ManagerListModal from './ManagerListModal'
import MemberPhoneModal from './MemberPhoneModal'
import MemberPropertyModal from './MemberPropertyModal'
import TransferModal from './TransferModal'
import saleMessages from './translation'

dayjs.extend(utc)

const StyledAdminCard = styled(AdminCard)`
  position: relative;
`
const TableWrapper = styled.div`
  overflow-x: auto;
  th {
    white-space: nowrap;
  }
  td {
    white-space: nowrap;
    color: var(--gray-darker);
  }
  tr {
    &.notified td:first-child {
      border-left: 4px solid var(--error);
    }
  }
  && .ant-pagination.ant-table-pagination.ant-table-pagination-right {
    align-items: center;
  }
`
const StyledMemberNote = styled.span`
  white-space: pre-wrap;
  display: -webkit-box;
  -webkit-line-clamp: 5;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`

const StyledPhones = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const StyledDelPhone = styled.p`
  color: var(--gray);
`

const SalesLeadTable: React.VFC<{
  variant?: 'followed' | 'completed' | 'resubmission' | 'callbacked'
  manager: Manager
  currentMemberIsManager: boolean
  leads: SalesLeadMember[]
  isLoading: boolean
  onRefetch: () => Promise<void>
  title?: string
  onTableChange: TableProps<SalesLeadMember>['onChange']
  selectedLeadStatusCategoryId?: string
  selectedRowKeys: React.Key[]
  onSelectChange: (newSelectedRowKeys: React.Key[]) => void
  onIsOpenAddListModalChange: (isOpenAddListModal: boolean) => void
  onIsOpenManagerListModalChange: (isOpenManagerListModal: boolean) => void
  dataCount: number
  onFilter: (filter: Filter) => void
  filter?: Filter
  onSaleLeadChange: (data: ManagerLead) => void
  salesLeadMembersData?: ManagerLead
  defaultSalesLeadMembers?: SalesLeadMember[]
  onDefaultSalesLeadMembersChange?: (data: SalesLeadMember[]) => void
}> = ({
  variant,
  manager,
  currentMemberIsManager,
  leads,
  onRefetch,
  onTableChange,
  isLoading,
  title,
  selectedLeadStatusCategoryId,
  selectedRowKeys,
  onSelectChange,
  onIsOpenAddListModalChange,
  onIsOpenManagerListModalChange,
  dataCount,
  onFilter,
  filter,
  salesLeadMembersData,
  onSaleLeadChange,
  defaultSalesLeadMembers,
  onDefaultSalesLeadMembersChange,
}) => {
  const { formatMessage } = useIntl()
  const { id: appId, settings } = useApp()
  const { authToken, currentMemberId } = useAuth()
  const [confirmModalVisibleType, setConfirmModalVisibleType] = useState<'leaveResubmission' | ''>('')
  const { insertMemberNote, updateLastMemberNoteCalled, updateLastMemberNoteAnswered } = useMutateMemberNote()
  const { upsertMemberRating } = useMemberRating()
  const [updateLeads] = useMutation<hasura.UPDATE_LEADS, hasura.UPDATE_LEADSVariables>(UPDATE_LEADS)
  const { updateMemberProperty } = useMutateMemberProperty()
  const { deleteMemberProperty } = useDeleteMemberProperty()
  const uploadAttachments = useUploadAttachments()
  const { permissions } = useAuth()
  const [propertyModalVisible, setPropertyModalVisible] = useState(false)
  const [jitsiModalVisible, setJitsiModalVisible] = useState(false)
  const { properties } = useProperty()
  const [taskModalVisible, setTaskModalVisible] = useState(false)
  const [editFullNameMemberId, setEditFullNameMemberId] = useState<string>()
  const [fullNameValue, setFullNameValue] = useState<string>()
  const [refetchLoading, setRefetchLoading] = useState(false)
  const [memberNoteModalVisible, setMemberNoteModalVisible] = useState(false)
  const [memberPhoneModalVisible, setMemberPhoneModalVisible] = useState(false)
  const [selectedMember, setSelectedMember] = useState<{
    id: string
    name: string
    categoryNames: string[]
    email: string
    pictureUrl: string
    phones?: {
      phoneNumber: string
      isValid: boolean
    }[]
  } | null>(null)
  const [isOpenAddListModal, setIsOpenAddListModal] = useState(false)
  const [isOpenManagerListModal, setIsOpenManagerListModal] = useState(false)
  const [listStatus, setListStatus] = useState<LeadStatus>('FOLLOWED')
  const {
    leadStatusCategories,
    refetchLeadStatusCategory,
    handleAddLeadStatusCategory,
    handleManagerLeadStatusCategory,
  } = useLeadStatusCategory(manager.id)

  const settingDefaultPageSize = settings['sale_lead.sale_lead_table.default_page_size']
  const settingPageSizeOptions = settings['sale_lead.sale_lead_table.page_size_options']

  const handleOpenAddListModal = (status: LeadStatus) => {
    setIsOpenAddListModal(true)
    setListStatus(status)
  }

  const handleOpenManagerListModal = (status: LeadStatus) => {
    setIsOpenManagerListModal(true)
    setListStatus(status)
  }

  const getColumnSearchProps: (onSetFilter: (value?: string) => void) => ColumnProps<SalesLeadMember> =
    onSetFilter => ({
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div className="p-2">
          <Input
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => {
              confirm()
              onSetFilter(selectedKeys[0] as string)
            }}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <div>
            <Button
              type="primary"
              onClick={() => {
                confirm()
                onSetFilter(selectedKeys[0] as string)
              }}
              icon={<SearchOutlined />}
              size="small"
              className="mr-2"
              style={{ width: 90 }}
            >
              {formatMessage(saleMessages.SalesLeadTable.search)}
            </Button>
            <Button
              onClick={() => {
                clearFilters && clearFilters()
                onSetFilter(undefined)
              }}
              size="small"
              style={{ width: 90 }}
            >
              {formatMessage(saleMessages.SalesLeadTable.reset)}
            </Button>
          </div>
        </div>
      ),
      filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    })

  const handleEditFullName = (lead: SalesLeadMember) => {
    setEditFullNameMemberId(lead.id)
  }

  const handleFullNameSave = (lead: SalesLeadMember) => {
    const fullNameProperty = properties.find(property => property.name === '本名')
    const fullNamePropertyValue = lead?.properties?.find(property => property.name === '本名')?.value || ''
    if (!fullNameValue || fullNameValue === fullNamePropertyValue) {
      setEditFullNameMemberId('')
    } else {
      setRefetchLoading(true)
      updateMemberProperty({
        variables: {
          memberProperties: [{ member_id: lead.id, property_id: fullNameProperty?.id, value: fullNameValue }],
        },
      })
        .then(() => {
          message.success(formatMessage(saleMessages.SalesLeadTable.savedSuccessfully))
          onRefetch()
          setRefetchLoading(false)
          setFullNameValue('')
          setEditFullNameMemberId('')
        })
        .catch(handleError)
    }
  }

  const handleLeaveResubmission = (memberIds: string[]) => {
    setRefetchLoading(true)
    const resubmissionProperty = properties.find(property => property.name === '最新填寫日期')
    if (!resubmissionProperty) return
    deleteMemberProperty({
      variables: {
        memberIds,
        propertyId: resubmissionProperty?.id,
      },
    })
      .then(() => {
        if (confirmModalVisibleType === 'leaveResubmission') {
          message.success(formatMessage(saleMessages.SalesLeadTable.leaveTabSuccess))
        }
        setConfirmModalVisibleType('')
        onSelectChange([])
        onRefetch()
      })
      .finally(() => {
        setRefetchLoading(false)
      })
      .catch(handleError)
  }

  const handleLeadStatus = (
    memberIds: string[],
    managerId: string,
    leads: SalesLeadMember[],
    status:
      | 'followed'
      | 'removeFollowed'
      | 'specificList'
      | 'completed'
      | 'cancel'
      | 'recycle'
      | 'reject'
      | 'delete'
      | 'leaveTheCallbackTab',
    leadStatusCategory?: { id: string; categoryName: string },
  ) => {
    const statusMessages: Record<typeof status, { confirm: string; success: string }> = {
      followed: {
        confirm: formatMessage(saleMessages.SalesLeadTable.followedLeadConfirm),
        success: formatMessage(saleMessages.SalesLeadTable.followedSuccessfully),
      },
      removeFollowed: {
        confirm: formatMessage(saleMessages.SalesLeadTable.removeFollowedLeadConfirm),
        success: formatMessage(saleMessages.SalesLeadTable.removedSuccessfully),
      },
      specificList: {
        confirm: formatMessage(saleMessages.SalesLeadTable.moveToSpecificListConfirm),
        success: formatMessage(saleMessages.SalesLeadTable.moveToSpecificListSuccessfully, {
          categoryName: leadStatusCategory?.categoryName || '',
        }),
      },
      completed: {
        confirm: formatMessage(saleMessages.SalesLeadTable.completedLeadConfirm),
        success: formatMessage(saleMessages.SalesLeadTable.completedSuccessfully),
      },
      cancel: {
        confirm: formatMessage(saleMessages.SalesLeadTable.cancelCompletedLeadConfirm),
        success: formatMessage(saleMessages.SalesLeadTable.cancelCompletedSuccessfully),
      },
      recycle: {
        confirm: formatMessage(saleMessages.SalesLeadTable.recycleLeadConfirm),
        success: formatMessage(saleMessages.SalesLeadTable.recycledSuccessfully),
      },
      reject: {
        confirm: formatMessage(saleMessages.SalesLeadTable.rejectLeadConfirm),
        success: formatMessage(saleMessages.SalesLeadTable.rejectedSuccessfully),
      },
      delete: {
        confirm: formatMessage(saleMessages.SalesLeadTable.deleteLeadConfirm),
        success: formatMessage(saleMessages.SalesLeadTable.deletedSuccessfully),
      },
      leaveTheCallbackTab: {
        confirm: formatMessage(saleMessages.SalesLeadTable.leaveTheCallbackTabConfirm),
        success: formatMessage(saleMessages.SalesLeadTable.leaveTheCallbackTabSuccessfully),
      },
    }

    const { confirm: confirmText, success: eventSuccessMessage } = statusMessages[status]

    if (window.confirm(confirmText)) {
      updateLeads({
        variables: {
          updateLeads: memberIds.map(memberId => {
            const lead = leads.find(lead => lead.id === memberId)

            let updateLeadsSetObject: {
              manager_id: string | null
              star: number | null
              followed_at: Date | string | null
              completed_at: Date | string | null
              closed_at: Date | string | null
              excluded_at: Date | string | null
              recycled_at: Date | string | null
              callbacked_at: Date | string | null
              lead_status_category_id: string | null
            } = {
              manager_id: managerId || null,
              star: lead?.star || null,
              followed_at: lead?.followedAt || null,
              completed_at: lead?.completedAt || null,
              closed_at: lead?.closedAt || null,
              excluded_at: lead?.excludedAt || null,
              recycled_at: lead?.recycledAt || null,
              callbacked_at: lead?.callbackedAt || null,
              lead_status_category_id: lead?.leadStatusCategoryId || null,
            }

            const updateFieldsByStatus = (status: string) => {
              switch (status) {
                case 'followed':
                  return {
                    ...updateLeadsSetObject,
                    manager_id: manager.id,
                    followed_at: dayjs().utc().toDate(),
                    lead_status_category_id: null,
                    callbacked_at: null,
                  }
                case 'removeFollowed':
                  return {
                    ...updateLeadsSetObject,
                    manager_id: manager.id,
                    followed_at: null,
                    lead_status_category_id: null,
                  }
                case 'specificList':
                  return {
                    ...updateLeadsSetObject,
                    manager_id: manager.id,
                    followed_at: dayjs().utc().toDate(),
                    lead_status_category_id: leadStatusCategory?.id || null,
                  }
                case 'completed':
                  return {
                    ...updateLeadsSetObject,
                    manager_id: manager.id,
                    completed_at: dayjs().utc().toDate(),
                    lead_status_category_id: null,
                    callbacked_at: null,
                  }
                case 'cancel':
                  return { ...updateLeadsSetObject, manager_id: manager.id, completed_at: null, callbacked_at: null }
                case 'recycle':
                  return {
                    ...updateLeadsSetObject,
                    manager_id: null,
                    followed_at: null,
                    recycled_at: dayjs().utc().toDate(),
                    lead_status_category_id: null,
                    callbacked_at: null,
                  }
                case 'reject':
                  return {
                    ...updateLeadsSetObject,
                    manager_id: null,
                    star: -999,
                    followed_at: null,
                    closed_at: dayjs().utc().toDate(),
                    lead_status_category_id: null,
                    callbacked_at: null,
                  }
                case 'delete':
                  return {
                    ...updateLeadsSetObject,
                    manager_id: null,
                    star: -9999,
                    followed_at: null,
                    excluded_at: dayjs().utc().toDate(),
                    lead_status_category_id: null,
                  }
                case 'leaveTheCallbackTab':
                  return { ...updateLeadsSetObject, callbacked_at: null }
                default:
                  return updateLeadsSetObject
              }
            }

            updateLeadsSetObject = updateFieldsByStatus(status)

            return {
              where: { id: { _eq: memberId } },
              _set: updateLeadsSetObject,
            }
          }),
        },
      }).then(({ data }) => {
        if (
          data?.update_member_many &&
          data.update_member_many.filter(v => v?.affected_rows && v?.affected_rows > 0).length > 0
        ) {
          message.success(eventSuccessMessage)
          onRefetch()
          onSelectChange([])
        } else {
          message.error(formatMessage(saleMessages.SalesLeadTable.systemError))
        }
      })
    }
    handleLeaveResubmission(memberIds)
  }

  const dataSource = leads.map(v => ({ ...v, nameAndEmail: v.name + v.email }))

  const categoryNames = uniq(dataSource.flatMap(data => data.categoryNames))
  const hasFullNameProperty = properties.some(p => p.name === '本名')

  const columns: ColumnsType<SalesLeadMember> = [
    {
      key: 'leadLevel',
      dataIndex: 'leadLevel',
      width: 80,
      title: formatMessage(saleMessages.SalesLeadTable.leadLevel),
      filters: [
        {
          text: 'SSR',
          value: 'SSR',
        },
        {
          text: 'SR',
          value: 'SR',
        },
        {
          text: 'R',
          value: 'R',
        },
        {
          text: 'N',
          value: 'N',
        },
        {
          text: 'C',
          value: 'C',
        },
      ],
      sorter: {},
      // filteredValue: filter?.leadLevel as React.Key[],
      onFilter: () => true,
      render: (_, record) => (
        <div className="d-flex flex-row justify-content-end">
          <Tooltip placement="bottom" title={formatMessage(saleMessages.SalesLeadTable.newTask)}>
            <Button
              icon={<CheckSquareOutlined />}
              className="mr-1"
              onClick={() => {
                setSelectedMember({
                  id: record.id,
                  name: record.name,
                  categoryNames: record.categoryNames,
                  email: record.email,
                  pictureUrl: record.pictureUrl,
                })
                setTaskModalVisible(true)
              }}
            />
          </Tooltip>
          <Tooltip placement="bottom" title={formatMessage(saleMessages.SalesLeadTable.createMemberNote)}>
            <Button
              className="mr-1"
              icon={<FileAddOutlined />}
              onClick={() => {
                setSelectedMember({
                  id: record.id,
                  name: record.name,
                  categoryNames: record.categoryNames,
                  email: record.email,
                  pictureUrl: record.pictureUrl,
                })
                setMemberNoteModalVisible(true)
              }}
            />
          </Tooltip>
        </div>
      ),
    },
    {
      key: 'nameAndEmail',
      dataIndex: 'nameAndEmail',
      width: 200,
      title: formatMessage(saleMessages.SalesLeadTable.memberNickName),
      ...getColumnSearchProps((value?: string) =>
        onFilter({
          ...filter,
          nameAndEmail: value,
        }),
      ),
      render: (nameAndEmail, lead) => {
        const leadLevel = lead.properties.find(property => property.name === '名單分級')?.value || 'N'
        const color = leadLevel === 'SSR' ? 'red' : leadLevel === 'SR' ? 'orange' : leadLevel === 'R' ? 'yellow' : ''
        const fullNamePropertyValue = lead?.properties?.find(property => property.name === '本名')?.value || ''
        return (
          <>
            <a href={`/admin/members/${lead?.id}`} target="_blank" rel="noreferrer" className="d-flex flex-column">
              <span>
                <Tag color={color}>{leadLevel}</Tag>
                {lead?.name}
              </span>
            </a>
            <small>{lead?.email}</small>
            {currentMemberIsManager ? (
              <div>
                <StarRating
                  value={
                    salesLeadMembersData?.salesLeadMembers.find(salesLeadMember => salesLeadMember.id === lead.id)
                      ?.rating || 0
                  }
                  onStarClick={(value: number) => {
                    upsertMemberRating({ variables: { managerId: currentMemberId, memberId: lead.id, rating: value } })
                    const updateSalesLeadMembers =
                      salesLeadMembersData?.salesLeadMembers.map(salesLeadMember =>
                        salesLeadMember.id === lead.id ? { ...salesLeadMember, rating: value || 0 } : salesLeadMember,
                      ) || []
                    !!salesLeadMembersData &&
                      onSaleLeadChange?.({
                        ...salesLeadMembersData,
                        salesLeadMembers: updateSalesLeadMembers,
                      })
                    onDefaultSalesLeadMembersChange?.(updateSalesLeadMembers)
                  }}
                  onStarHover={(value: number) => {
                    const updateSalesLeadMembers =
                      salesLeadMembersData?.salesLeadMembers.map(salesLeadMember =>
                        salesLeadMember.id === lead.id ? { ...salesLeadMember, rating: value || 0 } : salesLeadMember,
                      ) || []
                    !!salesLeadMembersData &&
                      onSaleLeadChange?.({
                        ...salesLeadMembersData,
                        salesLeadMembers: updateSalesLeadMembers,
                      })
                  }}
                  onStarHoverOut={() =>
                    salesLeadMembersData &&
                    defaultSalesLeadMembers &&
                    onSaleLeadChange?.({
                      ...salesLeadMembersData,
                      salesLeadMembers: defaultSalesLeadMembers,
                    })
                  }
                />
              </div>
            ) : null}
            {hasFullNameProperty ? (
              <div className="d-flex align-items-center">
                <p>{`${formatMessage(saleMessages.SalesLeadTable.memberFullName)}：`}</p>
                {editFullNameMemberId && editFullNameMemberId === lead.id ? (
                  <Input.Group compact>
                    <Input
                      style={{ width: 'auto' }}
                      defaultValue={fullNamePropertyValue}
                      onChange={e => setFullNameValue(e.target.value.trim())}
                    />
                    <Button type="primary" onClick={() => handleFullNameSave(lead)} loading={refetchLoading}>
                      {fullNameValue && fullNameValue !== fullNamePropertyValue
                        ? formatMessage(commonMessages.ui.save)
                        : formatMessage(commonMessages.ui.cancel)}
                    </Button>
                  </Input.Group>
                ) : (
                  <div>
                    <span>{fullNamePropertyValue}</span>
                    {!refetchLoading && <EditOutlined onClick={() => handleEditFullName(lead)} />}
                  </div>
                )}
              </div>
            ) : null}
          </>
        )
      },
    },
    {
      key: 'phones',
      dataIndex: 'phones',
      width: 100,
      title: formatMessage(saleMessages.SalesLeadTable.tel),
      render: (phones: { phoneNumber: string; isValid: boolean }[], record) => (
        <StyledPhones>
          <div>
            {phones.map((phone, idx) =>
              !phone.isValid ? (
                <StyledDelPhone key={idx}>
                  <del>{phone.phoneNumber}</del>
                </StyledDelPhone>
              ) : (
                <button
                  key={idx}
                  // href="#!"
                  className="m-0 mr-1 cursor-pointer d-flex"
                  onClick={() => {
                    call({
                      appId,
                      authToken,
                      phone: phone.phoneNumber,
                      salesTelephone: manager.telephone,
                      confirmMessage: `${formatMessage(salesMessages.confirmCallPhone)}${phone.phoneNumber}`,
                    })
                      .then(({ data: { code } }) => {
                        if (code === 'SUCCESS') {
                          message.success(formatMessage(salesMessages.phoneLinkSuccess))
                        } else {
                          message.error(formatMessage(salesMessages.phoneError))
                        }
                      })
                      .catch(error => {
                        process.env.NODE_ENV === 'development' && console.error(error)
                        message.error(formatMessage(salesMessages.connectionError))
                      })
                  }}
                >
                  {phone.phoneNumber}
                </button>
              ),
            )}
          </div>
          {!refetchLoading && (
            <EditOutlined
              onClick={() => {
                setSelectedMember({
                  id: record.id,
                  name: record.name,
                  phones: record.phones,
                  categoryNames: record.categoryNames,
                  email: record.email,
                  pictureUrl: record.pictureUrl,
                })
                setMemberPhoneModalVisible(true)
              }}
            />
          )}
        </StyledPhones>
      ),
      ...getColumnSearchProps((value?: string) =>
        onFilter({
          ...filter,
          phone: value,
        }),
      ),
    },
    {
      key: 'categoryNames',
      dataIndex: 'categoryNames',
      title: formatMessage(saleMessages.SalesLeadTable.category),
      filters: categoryNames.map(categoryName => ({
        text: categoryName,
        value: categoryName,
      })),
      onFilter: () => true,
      render: (categoryNames: string[]) =>
        categoryNames.map((categoryName, idx) => <div key={idx}>{categoryName}</div>),
    },
    {
      key: 'materialNames',
      dataIndex: 'properties',
      title: formatMessage(saleMessages.SalesLeadTable.adMaterial),
      ...getColumnSearchProps((value?: string) =>
        onFilter({
          ...filter,
          materialName: value,
        }),
      ),
      render: (properties: { id: string; name: string; value: string }[]) =>
        properties
          .find(property => property.name === '廣告素材')
          ?.value.split(',')
          .map((v, idx) => <div key={idx}>{v}</div>),
    },
    {
      key: 'memberNote',
      dataIndex: 'memberNote',
      width: 300,
      title: formatMessage(saleMessages.SalesLeadTable.memberNote),
      ...getColumnSearchProps((value?: string) =>
        onFilter({
          ...filter,
          memberNote: value,
        }),
      ),
      render: (_, lead) => (
        <StyledMemberNote>
          <span>{lead.latestNoteDescription}</span>
        </StyledMemberNote>
      ),
    },
    {
      key: 'created_at',
      dataIndex: 'createdAt',
      title: formatMessage(saleMessages.SalesLeadTable.createdAt),
      sorter: {
        compare: (a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0),
        multiple: 2,
      },
      render: createdAt => <time>{moment(createdAt).fromNow()}</time>,
    },
    {
      key: 'last_member_note_called',
      dataIndex: 'recentContactedAt',
      title: formatMessage(saleMessages.SalesLeadTable.recentContactedAt),
      sorter: {
        compare: (a, b) => (a.recentContactedAt?.getTime() || 0) - (b.recentContactedAt?.getTime() || 0),
        multiple: 3,
      },
      render: recentContactedAt => recentContactedAt && <time>{moment(recentContactedAt).fromNow()}</time>,
    },
    {
      key: 'last_member_note_answered',
      dataIndex: 'recentAnsweredAt',
      title: formatMessage(saleMessages.SalesLeadTable.recentAnsweredAt),
      sorter: {
        compare: (a, b) => (a.recentAnsweredAt?.getTime() || 0) - (b.recentAnsweredAt?.getTime() || 0),
        multiple: 4,
      },
      render: recentAnsweredAt =>
        recentAnsweredAt && <time>{recentAnsweredAt && moment(recentAnsweredAt).fromNow()}</time>,
    },
  ]

  const selectedRowLeads = leads.filter(lead => selectedRowKeys.includes(lead.id))

  return (
    <StyledAdminCard>
      <AdminModal
        title={formatMessage(saleMessages.SalesLeadTable.leaveTab)}
        visible={confirmModalVisibleType === 'leaveResubmission'}
        onCancel={() => setConfirmModalVisibleType('')}
        footer={null}
        renderFooter={() => (
          <ButtonGroup>
            <Button className="mr-2" onClick={() => setConfirmModalVisibleType('')}>
              {formatMessage(commonMessages.ui.cancel)}
            </Button>
            <Button
              type="primary"
              onClick={() => handleLeaveResubmission(selectedRowLeads.map(selectedRowLead => selectedRowLead.id))}
              loading={refetchLoading}
            >
              {formatMessage(commonMessages.ui.confirm)}
            </Button>
          </ButtonGroup>
        )}
      >
        <Text marginBottom="20px">
          {formatMessage(saleMessages.SalesLeadTable.leaveTabInfo, {
            tab: formatMessage(saleMessages.SalesLeadTable.leaveTab),
          })}
        </Text>
      </AdminModal>
      {selectedMember && (
        <MemberPropertyModal
          visible={propertyModalVisible}
          onCancel={() => setPropertyModalVisible(false)}
          member={selectedMember}
          manager={{
            id: manager.id,
            name: manager.name,
            email: manager.email,
          }}
          onClose={() => {
            setPropertyModalVisible(false)
          }}
        />
      )}
      {selectedMember && (
        <MemberTaskAdminModal
          visible={taskModalVisible}
          onCancel={() => setTaskModalVisible(false)}
          title={formatMessage(saleMessages.SalesLeadTable.newTask)}
          initialMemberId={selectedMember.id}
          initialExecutorId={manager.id}
          onRefetch={() => {
            onRefetch()
            setTaskModalVisible(false)
          }}
          afterClose={() => {
            setSelectedMember(null)
          }}
        />
      )}
      {selectedMember && (
        <MemberNoteAdminModal
          info={{ email: selectedMember.email, name: selectedMember.name, pictureUrl: selectedMember.pictureUrl }}
          visible={memberNoteModalVisible}
          onCancel={() => setMemberNoteModalVisible(false)}
          afterClose={() => {
            setSelectedMember(null)
          }}
          title={formatMessage(saleMessages.SalesLeadTable.createMemberNote)}
          onSubmit={async ({ type, status, duration, description, attachments }) =>
            await insertMemberNote({
              variables: {
                memberId: selectedMember.id,
                authorId: manager.id,
                type,
                status,
                duration,
                description,
              },
            })
              .then(async ({ data }) => {
                if (type === 'outbound') {
                  if (status !== 'answered') {
                    await updateLastMemberNoteCalled({
                      variables: { memberId: selectedMember.id, lastMemberNoteCalled: new Date() },
                    }).catch(handleError)
                  } else if (status === 'answered') {
                    await updateLastMemberNoteAnswered({
                      variables: { memberId: selectedMember.id, lastMemberNoteAnswered: new Date() },
                    }).catch(handleError)
                  }
                }
                const memberNoteId = data?.insert_member_note_one?.id
                if (memberNoteId && attachments.length) {
                  await uploadAttachments('MemberNote', memberNoteId, attachments)
                }
                message.success(formatMessage(saleMessages.SalesLeadTable.successfullyCreated))
              })
              .catch(handleError)
              .finally(() => {
                const updateLeadMembers = leads.map(lead =>
                  lead.id === selectedMember.id ? { ...lead, latestNoteDescription: description } : lead,
                )
                !!salesLeadMembersData &&
                  onSaleLeadChange?.({
                    ...salesLeadMembersData,
                    salesLeadMembers: updateLeadMembers,
                  })

                setMemberNoteModalVisible(false)
              })
          }
        />
      )}
      {selectedMember && (
        <MemberPhoneModal
          visible={memberPhoneModalVisible}
          onCancel={() => setMemberPhoneModalVisible(false)}
          onLeadRefetch={onRefetch}
          phones={selectedMember.phones || []}
          memberId={selectedMember.id}
        />
      )}
      <TableWrapper>
        <b>{title}</b>
        {selectedRowKeys.length > 0 && (
          <div className="d-flex flex-row align-items-center justify-content-between mb-3">
            <b>
              {formatMessage(saleMessages.SalesLeadTable.selectedCount, {
                count: selectedRowKeys.length,
              })}
            </b>
            <div className="d-flex flex-row align-items-center">
              {variant === 'resubmission' && (
                <Button
                  className="mr-2"
                  onClick={() => {
                    setConfirmModalVisibleType('leaveResubmission')
                  }}
                >
                  {formatMessage(saleMessages.SalesLeadTable.leaveTab)}
                </Button>
              )}
              {variant === 'callbacked' && (
                <Button
                  icon={<LeaveTheTab style={{ marginRight: '8px', verticalAlign: 'middle' }} />}
                  className="mr-3"
                  onClick={() =>
                    handleLeadStatus(
                      selectedRowLeads.map(selectedRowLead => selectedRowLead.id),
                      manager.id,
                      leads,
                      'leaveTheCallbackTab',
                    )
                  }
                >
                  {formatMessage(saleMessages.SalesLeadTable.leaveTheCallbackTab)}
                </Button>
              )}
              {variant !== 'followed' && (
                <Dropdown
                  className="mr-2"
                  overlay={
                    <Menu>
                      <Menu.Item
                        onClick={() =>
                          handleLeadStatus(
                            selectedRowLeads.map(selectedRowLead => selectedRowLead.id),
                            manager.id,
                            leads,
                            'followed',
                          )
                        }
                      >
                        {formatMessage(saleMessages.SalesLeadTable.moveTo) +
                          formatMessage(saleMessages.SalesLeadTable.followedLead)}
                      </Menu.Item>
                      {leadStatusCategories.map(leadStatusCategory => (
                        <Menu.Item
                          key={leadStatusCategory.id}
                          onClick={() =>
                            handleLeadStatus(
                              selectedRowLeads.map(selectedRowLead => selectedRowLead.id),
                              manager.id,
                              leads,
                              'specificList',
                              { id: leadStatusCategory.id, categoryName: leadStatusCategory.categoryName },
                            )
                          }
                        >
                          {formatMessage(saleMessages.SalesLeadTable.moveTo)} {leadStatusCategory.categoryName}
                        </Menu.Item>
                      ))}
                      <StyledLine />
                      <Menu.Item onClick={() => handleOpenAddListModal('FOLLOWED')}>
                        {formatMessage(saleMessages.SalesLeadTable.addList)}
                      </Menu.Item>
                      {leadStatusCategories.length > 0 && (
                        <Menu.Item onClick={() => handleOpenManagerListModal('FOLLOWED')}>
                          {formatMessage(saleMessages.SalesLeadTable.managerList)}
                        </Menu.Item>
                      )}
                    </Menu>
                  }
                >
                  <Button icon={<StarOutlined />}>
                    {formatMessage(saleMessages.SalesLeadTable.moveTo) +
                      formatMessage(saleMessages.SalesLeadTable.followedLead) +
                      formatMessage(saleMessages.SalesLeadTable.list)}
                  </Button>
                </Dropdown>
              )}
              {variant === 'followed' && (
                <Dropdown
                  overlay={
                    <Menu>
                      {Boolean(selectedLeadStatusCategoryId) ? (
                        <Menu.Item
                          onClick={() => {
                            handleLeadStatus(
                              selectedRowLeads.map(selectedRowLead => selectedRowLead.id),
                              manager.id,
                              leads,
                              'followed',
                            )
                          }}
                        >
                          {formatMessage(saleMessages.SalesLeadTable.moveToFollowed)}
                        </Menu.Item>
                      ) : null}
                      {leadStatusCategories
                        .filter(leadStatusCategory => leadStatusCategory.categoryId !== selectedLeadStatusCategoryId)
                        .map(leadStatusCategory => (
                          <Menu.Item
                            key={leadStatusCategory.id}
                            onClick={() => {
                              handleLeadStatus(
                                selectedRowLeads.map(selectedRowLead => selectedRowLead.id),
                                manager.id,
                                leads,
                                'specificList',
                                { id: leadStatusCategory.id, categoryName: leadStatusCategory.categoryName },
                              )
                            }}
                          >
                            {formatMessage(saleMessages.SalesLeadTable.moveToSpecificList, {
                              categoryName: leadStatusCategory.categoryName,
                            })}
                          </Menu.Item>
                        ))}
                      <Divider />
                      <Menu.Item
                        onClick={() => {
                          handleLeadStatus(
                            selectedRowLeads.map(selectedRowLead => selectedRowLead.id),
                            manager.id,
                            leads,
                            'removeFollowed',
                          )
                        }}
                      >
                        {formatMessage(saleMessages.SalesLeadTable.removeFollowed)}
                      </Menu.Item>
                      <Menu.Item onClick={() => onIsOpenAddListModalChange(true)}>
                        {formatMessage(saleMessages.SalesLeadTable.addList)}
                      </Menu.Item>
                      <Menu.Item onClick={() => onIsOpenManagerListModalChange(true)}>
                        {formatMessage(saleMessages.SalesLeadTable.managerList)}
                      </Menu.Item>
                    </Menu>
                  }
                >
                  <Center>
                    <Button className="mr-2">{formatMessage(saleMessages.SalesLeadTable.editFollowed)}</Button>
                  </Center>
                </Dropdown>
              )}
              {variant !== 'completed' && (
                <Button
                  icon={<CheckOutlined />}
                  className="mr-2"
                  onClick={() =>
                    handleLeadStatus(
                      selectedRowLeads.map(selectedRowLead => selectedRowLead.id),
                      manager.id,
                      leads,
                      'completed',
                    )
                  }
                >
                  {formatMessage(saleMessages.SalesLeadTable.completed)}
                </Button>
              )}
              {variant === 'completed' && (
                <Button
                  icon={<CloseOutlined />}
                  className="mr-2"
                  onClick={() =>
                    handleLeadStatus(
                      selectedRowLeads.map(selectedRowLead => selectedRowLead.id),
                      manager.id,
                      leads,
                      'cancel',
                    )
                  }
                >
                  {formatMessage(saleMessages.SalesLeadTable.cancelComplete)}
                </Button>
              )}
              {variant !== 'completed' && (
                <>
                  {Boolean(permissions.SALES_MEMBER_LIST_RECYCLE) && (
                    <Button
                      icon={<SyncOutlined />}
                      className="mr-2"
                      onClick={() =>
                        handleLeadStatus(
                          selectedRowLeads.map(selectedRowLead => selectedRowLead.id),
                          manager.id,
                          leads,
                          'recycle',
                        )
                      }
                    >
                      {formatMessage(saleMessages.SalesLeadTable.recycle)}
                    </Button>
                  )}
                  <Button
                    icon={<StopOutlined />}
                    className="mr-2"
                    onClick={() =>
                      handleLeadStatus(
                        selectedRowLeads.map(selectedRowLead => selectedRowLead.id),
                        manager.id,
                        leads,
                        'reject',
                      )
                    }
                  >
                    {formatMessage(saleMessages.SalesLeadTable.reject)}
                  </Button>
                  <Button
                    icon={<DeleteOutlined />}
                    className="mr-2"
                    onClick={() =>
                      handleLeadStatus(
                        selectedRowLeads.map(selectedRowLead => selectedRowLead.id),
                        manager.id,
                        leads,
                        'delete',
                      )
                    }
                  >
                    {formatMessage(saleMessages.SalesLeadTable.delete)}
                  </Button>
                </>
              )}
              <TransferModal
                selectedRowLeads={selectedRowLeads}
                selectedLeadStatusCategoryId={selectedLeadStatusCategoryId}
                listStatus={listStatus}
                onRefetch={onRefetch}
                onTransferFinish={() => onSelectChange([])}
              />
            </div>
          </div>
        )}
        <Table<SalesLeadMember>
          rowKey="id"
          rowSelection={{
            selectedRowKeys,
            onChange: onSelectChange,
          }}
          loading={isLoading}
          rowClassName={lead => lead.notified && 'notified'}
          columns={columns}
          dataSource={dataSource}
          pagination={{
            defaultPageSize: settingDefaultPageSize
              ? Number(settingDefaultPageSize)
              : settingPageSizeOptions
              ? settingPageSizeOptions.split(',').length > 0
                ? Number(settingPageSizeOptions.split(',')[0])
                : 100
              : 100,
            pageSizeOptions: settingPageSizeOptions
              ? settingPageSizeOptions.split(',').length > 0
                ? settingPageSizeOptions.split(',')
                : ['20', '50', '100', '300', '500', '1000']
              : ['20', '50', '100', '300', '500', '1000'],
            total: dataCount,
          }}
          onChange={onTableChange}
          className="mb-3"
        />
      </TableWrapper>

      <JitsiDemoModal
        member={selectedMember}
        salesMember={{
          id: manager.id,
          name: manager.name,
          email: manager.email,
        }}
        visible={jitsiModalVisible}
        onCancel={() => setJitsiModalVisible(false)}
        onFinishCall={(duration: number) => {
          if (!selectedMember) {
            return
          }

          insertMemberNote({
            variables: {
              memberId: selectedMember.id,
              authorId: manager.id,
              type: 'demo',
              status: 'answered',
              duration: duration,
              description: '',
              note: 'jitsi demo',
            },
          })
            .then(() => {
              message.success(formatMessage(saleMessages.SalesLeadTable.successfullySaved))
              setJitsiModalVisible(false)
            })
            .catch(handleError)
        }}
      />
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
              alert(formatMessage(saleMessages.SalesLeadTable.additionSuccessful))
              await refetchLeadStatusCategory()
              await onRefetch()
            },
            err => {
              console.log(err)
              alert(formatMessage(saleMessages.SalesLeadTable.additionFailed))
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
            if (window.confirm(formatMessage(saleMessages.SalesLeadTable.deleteListConfirm))) {
              await handleManagerLeadStatusCategory(
                deletedLeadStatusCategoryIds,
                memberIds,
                async () => {
                  alert(formatMessage(saleMessages.SalesLeadTable.savedSuccessfully))
                  await refetchLeadStatusCategory()
                  await onRefetch()
                },
                err => {
                  console.log(err)
                  alert(formatMessage(saleMessages.SalesLeadTable.saveFailed))
                },
              )
            }
          }}
          leadStatusCategories={leadStatusCategories}
          leads={leads}
        />
      )}
    </StyledAdminCard>
  )
}

const UPDATE_LEADS = gql`
  mutation UPDATE_LEADS($updateLeads: [member_updates!]!) {
    update_member_many(updates: $updateLeads) {
      affected_rows
    }
  }
`

export default SalesLeadTable
