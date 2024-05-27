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
  SwapOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Dropdown, Input, Menu, message, Table, Tag, Tooltip } from 'antd'
import { ColumnProps, ColumnsType } from 'antd/lib/table'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import { uniq } from 'ramda'
import React, { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { call, handleError } from '../../helpers'
import { commonMessages, memberMessages, salesMessages } from '../../helpers/translation'
import { useUploadAttachments } from '../../hooks/data'
import { useMutateMemberNote, useMutateMemberProperty, useProperty } from '../../hooks/member'
import { useLeadStatusCategory } from '../../hooks/sales'
import { StyledLine } from '../../pages/SalesLeadPage'
import { LeadProps, LeadStatus, Manager } from '../../types/sales'
import AdminCard from '../admin/AdminCard'
import MemberNoteAdminModal from '../member/MemberNoteAdminModal'
import MemberTaskAdminModal from '../task/MemberTaskAdminModal'
import AddListModal from './AddListModal'
import JitsiDemoModal from './JitsiDemoModal'
import ManagerListModal from './ManagerListModal'
import MemberPhoneModal from './MemberPhoneModal'
import MemberPropertyModal from './MemberPropertyModal'

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
  variant?: 'followed' | 'completed'
  manager: Manager
  leads: LeadProps[]
  isLoading: boolean
  onRefetch: () => Promise<void>
  title?: string
  followedLeads: LeadProps[]
}> = ({ variant, manager, leads, onRefetch, isLoading, title, followedLeads }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { authToken } = useAuth()

  const { insertMemberNote, updateLastMemberNoteCalled, updateLastMemberNoteAnswered } = useMutateMemberNote()
  const [updateLeads] = useMutation<hasura.UPDATE_LEADS, hasura.UPDATE_LEADSVariables>(UPDATE_LEADS)
  const [transferLeads] = useMutation<hasura.TRANSFER_LEADS, hasura.TRANSFER_LEADSVariables>(TRANSFER_LEADS)
  const { updateMemberProperty } = useMutateMemberProperty()

  const uploadAttachments = useUploadAttachments()

  const [filters, setFilters] = useState<{
    nameAndEmail?: string
    fullName?: string
    phone?: string
    lastTaskCategoryName?: string
    leadLevel?: string
    categoryName?: string
    materialName?: string
    memberNote?: string
    status?: string
  }>({})
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
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

  const handleOpenAddListModal = (status: LeadStatus) => {
    setIsOpenAddListModal(true)
    setListStatus(status)
  }

  const handleOpenManagerListModal = (status: LeadStatus) => {
    setIsOpenManagerListModal(true)
    setListStatus(status)
  }

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys)
  }

  const getColumnSearchProps: (onSetFilter: (value?: string) => void) => ColumnProps<LeadProps> = onSetFilter => ({
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
            {formatMessage(commonMessages.ui.search)}
          </Button>
          <Button
            onClick={() => {
              clearFilters && clearFilters()
              onSetFilter(undefined)
            }}
            size="small"
            style={{ width: 90 }}
          >
            {formatMessage(commonMessages.ui.reset)}
          </Button>
        </div>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
  })

  const handleEditFullName = (lead: LeadProps) => {
    setEditFullNameMemberId(lead.id)
  }

  const handleFullNameSave = (lead: LeadProps) => {
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
          message.success(formatMessage(commonMessages.event.successfullySaved))
          onRefetch()
          setRefetchLoading(false)
          setFullNameValue('')
          setEditFullNameMemberId('')
        })
        .catch(handleError)
    }
  }

  const dataSource = leads
    .filter(v => {
      const { nameAndEmail, phone, categoryName, materialName, memberNote } = filters
      const { name, email, phones, categoryNames, notes, properties } = v
      const fullName = properties.find(property => property.name === '本名')?.value || ''
      const matchesFilter = (filterValue: string | undefined) => (filterData: string) =>
        !filterValue || filterData.trim().toLowerCase().includes(filterValue.trim().toLowerCase())

      const nameAndEmailMatch = matchesFilter(nameAndEmail)(name + email + fullName)

      const phoneMatch = matchesFilter(phone)(
        phones
          .filter(phone => phone.isValid)
          .map(phone => phone.phoneNumber)
          .join(''),
      )

      const categoryNameMatch = matchesFilter(categoryName)(categoryNames.join(''))

      const materialNameMatch = matchesFilter(materialName)(
        properties.find(property => property.name === '廣告素材')?.value || '',
      )

      const memberNoteMatch = matchesFilter(memberNote)(notes)

      return nameAndEmailMatch && phoneMatch && categoryNameMatch && materialNameMatch && memberNoteMatch
    })
    .map(v => ({ ...v, nameAndEmail: v.name + v.email }))

  const categoryNames = uniq(dataSource.flatMap(data => data.categoryNames))
  const hasFullNameProperty = properties.some(p => p.name === '本名')

  const columns: ColumnsType<LeadProps> = [
    {
      key: 'memberId',
      dataIndex: 'id',
      width: 80,
      title: formatMessage(commonMessages.label.leadLevel),
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
      sorter: {
        compare: (a, b) =>
          (a.properties.find(property => property.name === '名單分級')?.value || 'N') >
          (b.properties.find(property => property.name === '名單分級')?.value || 'N')
            ? 1
            : -1,
        multiple: 1,
      },
      // defaultSortOrder: 'descend',
      onFilter: (value, lead) =>
        value === (lead.properties.find(property => property.name === '名單分級')?.value || 'N'),
      render: (memberId, record) => (
        <div className="d-flex flex-row justify-content-end">
          {/* <Button
            icon={<Icon component={() => <UserOutlinedIcon />} />}
            className="mr-2"
            onClick={() => {
              setSelectedMember({
                id: record.id,
                name: record.name,
                categoryNames: record.categoryNames,
              })
              setPropertyModalVisible(true)
            }}
          /> */}
          <Tooltip placement="bottom" title={formatMessage(memberMessages.ui.newTask)}>
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
          <Tooltip placement="bottom" title={formatMessage(memberMessages.label.createMemberNote)}>
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
      title: formatMessage(salesMessages.memberNickName),
      ...getColumnSearchProps((value?: string) =>
        setFilters({
          ...filters,
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
            {hasFullNameProperty ? (
              <div className="d-flex align-items-center">
                <p>{`${formatMessage(salesMessages.memberFullName)}：`}</p>
                {editFullNameMemberId && editFullNameMemberId === lead.id ? (
                  <Input.Group compact>
                    <Input
                      style={{ width: 'auto' }}
                      defaultValue={fullNamePropertyValue}
                      onChange={e => setFullNameValue(e.target.value.trim())}
                    />
                    <Button type="primary" onClick={() => handleFullNameSave(lead)} loading={refetchLoading}>
                      {fullNameValue && fullNameValue !== fullNamePropertyValue ? '儲存' : '取消'}
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
      title: formatMessage(salesMessages.tel),
      render: (phones: { phoneNumber: string; isValid: boolean }[], record) => (
        <StyledPhones>
          <div>
            {phones.map((phone, idx) =>
              !phone.isValid ? (
                <StyledDelPhone key={idx}>
                  <del>{phone.phoneNumber}</del>
                </StyledDelPhone>
              ) : (
                <a
                  key={idx}
                  href="#!"
                  className="m-0 mr-1 cursor-pointer d-flex"
                  onClick={() => {
                    call({
                      appId,
                      authToken,
                      phone: phone.phoneNumber,
                      salesTelephone: manager.telephone,
                    })
                  }}
                >
                  {phone.phoneNumber}
                </a>
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
        setFilters({
          ...filters,
          phone: value,
        }),
      ),
    },
    {
      key: 'categoryNames',
      dataIndex: 'categoryNames',
      title: formatMessage(commonMessages.label.category),
      filters: categoryNames.map(categoryName => ({
        text: categoryName,
        value: categoryName,
      })),
      onFilter: (value, lead) => lead.categoryNames.includes(value.toString()),
      render: (categoryNames: string[]) =>
        categoryNames.map((categoryName, idx) => <div key={idx}>{categoryName}</div>),
    },
    {
      key: 'materialNames',
      dataIndex: 'properties',
      title: formatMessage(commonMessages.label.adMaterial),
      ...getColumnSearchProps((value?: string) =>
        setFilters({
          ...filters,
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
      title: formatMessage(commonMessages.label.memberNote),
      ...getColumnSearchProps((value?: string) =>
        setFilters({
          ...filters,
          memberNote: value,
        }),
      ),
      render: (memberNote, lead) => (
        <StyledMemberNote>
          <span>{lead.notes}</span>
        </StyledMemberNote>
      ),
    },
    {
      key: 'createdAt',
      dataIndex: 'createdAt',
      title: formatMessage(salesMessages.createdAt),
      sorter: {
        compare: (a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0),
        multiple: 2,
      },
      render: createdAt => <time>{moment(createdAt).fromNow()}</time>,
    },
    {
      key: 'recentContactedAt',
      dataIndex: 'recentContactedAt',
      title: formatMessage(salesMessages.recentContactedAt),
      sorter: {
        compare: (a, b) => (a.recentContactedAt?.getTime() || 0) - (b.recentContactedAt?.getTime() || 0),
        multiple: 3,
      },
      render: recentContactedAt => recentContactedAt && <time>{moment(recentContactedAt).fromNow()}</time>,
    },
    {
      key: 'recentAnsweredAt',
      dataIndex: 'recentAnsweredAt',
      title: formatMessage(salesMessages.recentAnsweredAt),
      sorter: {
        compare: (a, b) => (a.recentAnsweredAt?.getTime() || 0) - (b.recentAnsweredAt?.getTime() || 0),
        multiple: 4,
      },
      render: recentAnsweredAt =>
        recentAnsweredAt && <time>{recentAnsweredAt && moment(recentAnsweredAt).fromNow()}</time>,
    },
  ]

  const selectedRowLeads = leads.filter(lead => selectedRowKeys.includes(lead.id))

  const [managerId, setManagerId] = useState('')
  const businessAppId = useRef('')

  const handleTransfer = async () => {
    const managerId = window.prompt('你要轉移此名單給哪個承辦編號？')?.trim()
    managerId && setManagerId(managerId)
  }

  const { data: memberAppId } = useQuery(GetMemberAppID, {
    variables: { managerId: managerId },
    skip: managerId === '',
  })

  const { data: managerAppIds } = useQuery(GetManagerAppIDList, {
    variables: { managerIds: selectedRowKeys },
    skip: selectedRowKeys.length === 0,
  })

  useEffect(() => {
    if (memberAppId == null || managerId === '') return
    const matchedAppIds: Record<string, string>[] = []
    const nonMatchingAppIds: Record<string, string>[] = []

    businessAppId.current = memberAppId?.member[0]?.app_id
    if (businessAppId.current == null) {
      alert(`此會員不存在: ${managerId}`)
      setManagerId('')
      return
    }

    for (const managerId of managerAppIds.member) {
      if (managerId.app_id === businessAppId.current) {
        matchedAppIds.push(managerId)
      } else {
        nonMatchingAppIds.push(managerId)
      }
    }

    if (nonMatchingAppIds.length !== 0) {
      const alertMes = nonMatchingAppIds
        .map(info => `id: ${info.id}\napp_id: ${info.app_id}\nname: ${info.name}\n\n`)
        .join('')
      alert(`移轉名單有誤: \n${alertMes}`)

      setManagerId('')
      return
    }

    if (matchedAppIds.length > 0) {
      const _handleTransfer = async () => {
        try {
          const { data } = await transferLeads({
            variables: { memberIds: matchedAppIds.map(rowKey => rowKey.id.toString()), managerId },
          })

          if (data?.update_member?.affected_rows) {
            window.alert('已成功轉移此名單！')
            onRefetch()
          }
        } catch (error: any) {
          if (error.graphQLErrors) {
            const graphqlErrors = error.graphQLErrors.map((graphqlError: any) => graphqlError.message)
            window.alert(`轉移失敗(graphqlErrors)：${graphqlErrors.join(', ')}`)
          } else {
            window.alert(`轉移失敗：${error.message}`)
          }
        } finally {
          setManagerId('')
          setSelectedRowKeys([])
        }
      }

      _handleTransfer()
      return
    }
  }, [managerAppIds, managerId, memberAppId, onRefetch, transferLeads])

  return (
    <StyledAdminCard>
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
          title={formatMessage(memberMessages.ui.newTask)}
          initialMemberId={selectedMember.id}
          initialExecutorId={manager.id}
          onRefetch={() => {
            onRefetch().then(() => setTaskModalVisible(false))
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
          title={formatMessage(memberMessages.label.createMemberNote)}
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
                message.success(formatMessage(commonMessages.event.successfullyCreated))
              })
              .catch(handleError)
              .finally(() => onRefetch().then(() => setMemberNoteModalVisible(false)))
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
              {formatMessage(salesMessages.selectedCount, {
                count: selectedRowKeys.length,
              })}
            </b>
            <div className="d-flex flex-row align-items-center">
              {variant !== 'followed' && (
                <Dropdown
                  className="mr-2"
                  overlay={
                    <Menu>
                      <Menu.Item
                        onClick={() => {
                          if (window.confirm(`確定收藏這些名單？`)) {
                            updateLeads({
                              variables: {
                                updateLeads: selectedRowLeads.map(lead => ({
                                  where: {
                                    id: { _eq: lead.id },
                                  },
                                  _set: {
                                    manager_id: manager.id,
                                    star: lead.star,
                                    followed_at: dayjs().utc().toISOString(),
                                    completed_at: lead.completedAt,
                                    closed_at: lead.closedAt,
                                    excluded_at: lead.excludedAt,
                                    recycled_at: lead.recycledAt,
                                    lead_status_category_id: null,
                                  },
                                })),
                              },
                            }).then(({ data }) => {
                              if (
                                data?.update_member_many &&
                                data.update_member_many.filter(v => v?.affected_rows && v?.affected_rows > 0).length > 0
                              ) {
                                message.success('已成功收錄！')
                                onRefetch()
                                setSelectedRowKeys([])
                              } else {
                                message.error('系統錯誤')
                              }
                            })
                          }
                        }}
                      >
                        {formatMessage(salesMessages.moveTo) + formatMessage(salesMessages.followedLead)}
                      </Menu.Item>
                      {leadStatusCategories.map(category => (
                        <Menu.Item
                          key={category.id}
                          onClick={() => {
                            if (window.confirm(`確定收藏這些名單到${category.listName}？`)) {
                              updateLeads({
                                variables: {
                                  updateLeads: selectedRowLeads.map(lead => ({
                                    where: {
                                      id: { _eq: lead.id },
                                    },
                                    _set: {
                                      manager_id: manager.id,
                                      star: lead.star,
                                      followed_at: dayjs().utc().toISOString(),
                                      completed_at: lead.completedAt,
                                      closed_at: lead.closedAt,
                                      excluded_at: lead.excludedAt,
                                      recycled_at: lead.recycledAt,
                                      lead_status_category_id: category.id,
                                    },
                                  })),
                                },
                              }).then(({ data }) => {
                                if (
                                  data?.update_member_many &&
                                  data.update_member_many.filter(v => v?.affected_rows && v?.affected_rows > 0).length >
                                    0
                                ) {
                                  message.success('已成功收錄！')
                                  onRefetch()
                                  setSelectedRowKeys([])
                                } else {
                                  message.error('系統錯誤')
                                }
                              })
                            }
                          }}
                        >
                          {formatMessage(salesMessages.moveTo)} {category.listName}
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
                  <Button icon={<StarOutlined />}>
                    {formatMessage(salesMessages.moveTo) +
                      formatMessage(salesMessages.followedLead) +
                      formatMessage(salesMessages.list)}
                  </Button>
                </Dropdown>
              )}
              {variant === 'followed' && (
                <Button
                  className="mr-2"
                  onClick={() => {
                    if (window.confirm('確定取消收藏這些名單？')) {
                      updateLeads({
                        variables: {
                          updateLeads: selectedRowLeads.map(lead => ({
                            where: {
                              id: { _eq: lead.id },
                            },
                            _set: {
                              manager_id: manager.id,
                              star: lead.star,
                              followed_at: null,
                              completed_at: lead.completedAt,
                              closed_at: lead.closedAt,
                              excluded_at: lead.excludedAt,
                              recycled_at: lead.recycledAt,
                              lead_status_category_id: null,
                            },
                          })),
                        },
                      }).then(({ data }) => {
                        if (
                          data?.update_member_many &&
                          data.update_member_many.filter(v => v?.affected_rows && v?.affected_rows > 0).length > 0
                        ) {
                          message.success('已成功取消收藏！')
                          onRefetch()
                          setSelectedRowKeys([])
                        } else {
                          message.error('系統錯誤')
                        }
                      })
                    }
                  }}
                >
                  取消收藏
                </Button>
              )}
              {variant !== 'completed' && (
                <Button
                  icon={<CheckOutlined />}
                  className="mr-2"
                  onClick={() => {
                    if (window.confirm('確定這些名單已完成？')) {
                      updateLeads({
                        variables: {
                          updateLeads: selectedRowLeads.map(lead => ({
                            where: {
                              id: { _eq: lead.id },
                            },
                            _set: {
                              manager_id: manager.id,
                              star: lead.star,
                              followed_at: lead.followedAt,
                              completed_at: dayjs().utc().toISOString(),
                              closed_at: lead.closedAt,
                              excluded_at: lead.excludedAt,
                              recycled_at: lead.recycledAt,
                            },
                          })),
                        },
                      }).then(({ data }) => {
                        if (
                          data?.update_member_many &&
                          data.update_member_many.filter(v => v?.affected_rows && v?.affected_rows > 0).length > 0
                        ) {
                          message.success('已成功完成此名單！')
                          onRefetch()
                          setSelectedRowKeys([])
                        } else {
                          message.error('系統錯誤')
                        }
                      })
                    }
                  }}
                >
                  完成
                </Button>
              )}
              {variant === 'completed' && (
                <Button
                  icon={<CloseOutlined />}
                  className="mr-2"
                  onClick={() => {
                    if (window.confirm('確定取消這些已完成的名單？')) {
                      updateLeads({
                        variables: {
                          updateLeads: selectedRowLeads.map(lead => ({
                            where: {
                              id: { _eq: lead.id },
                            },
                            _set: {
                              manager_id: manager.id,
                              star: lead.star,
                              followed_at: lead.followedAt,
                              completed_at: null,
                              closed_at: lead.closedAt,
                              excluded_at: lead.excludedAt,
                              recycled_at: lead.recycledAt,
                            },
                          })),
                        },
                      }).then(({ data }) => {
                        if (
                          data?.update_member_many &&
                          data.update_member_many.filter(v => v?.affected_rows && v?.affected_rows > 0).length > 0
                        ) {
                          message.success('已取消已完成名單！')
                          onRefetch()
                          setSelectedRowKeys([])
                        } else {
                          message.error('系統錯誤')
                        }
                      })
                    }
                  }}
                >
                  取消完成
                </Button>
              )}
              {variant !== 'completed' && (
                <>
                  <Button
                    icon={<SyncOutlined />}
                    className="mr-2"
                    onClick={() => {
                      if (window.confirm('確定回收這些名單？')) {
                        updateLeads({
                          variables: {
                            updateLeads: selectedRowLeads.map(lead => ({
                              where: {
                                id: { _eq: lead.id },
                              },
                              _set: {
                                manager_id: null,
                                star: lead.star,
                                followed_at: lead.followedAt,
                                completed_at: lead.completedAt,
                                closed_at: lead.closedAt,
                                excluded_at: lead.excludedAt,
                                recycled_at: dayjs().utc().toISOString(),
                              },
                            })),
                          },
                        }).then(({ data }) => {
                          if (
                            data?.update_member_many &&
                            data.update_member_many.filter(v => v?.affected_rows && v?.affected_rows > 0).length > 0
                          ) {
                            message.success('已成功回收此名單！')
                            onRefetch()
                            setSelectedRowKeys([])
                          } else {
                            message.error('系統錯誤')
                          }
                        })
                      }
                    }}
                  >
                    回收
                  </Button>
                  <Button
                    icon={<StopOutlined />}
                    className="mr-2"
                    onClick={() => {
                      if (window.confirm('確定拒絕這些名單？')) {
                        updateLeads({
                          variables: {
                            updateLeads: selectedRowLeads.map(lead => ({
                              where: {
                                id: { _eq: lead.id },
                              },
                              _set: {
                                manager_id: null,
                                star: -999,
                                followed_at: lead.followedAt,
                                completed_at: lead.completedAt,
                                closed_at: dayjs().utc().toISOString(),
                                excluded_at: lead.excludedAt,
                                recycled_at: lead.recycledAt,
                              },
                            })),
                          },
                        }).then(({ data }) => {
                          if (
                            data?.update_member_many &&
                            data.update_member_many.filter(v => v?.affected_rows && v?.affected_rows > 0).length > 0
                          ) {
                            message.success('已成功拒絕此名單！')
                            onRefetch()
                            setSelectedRowKeys([])
                          } else {
                            message.error('系統錯誤')
                          }
                        })
                      }
                    }}
                  >
                    拒絕
                  </Button>
                  <Button
                    icon={<DeleteOutlined />}
                    className="mr-2"
                    onClick={() => {
                      if (window.confirm('確定永久刪除這些名單？此動作無法復原！')) {
                        updateLeads({
                          variables: {
                            updateLeads: selectedRowLeads.map(lead => ({
                              where: {
                                id: { _eq: lead.id },
                              },
                              _set: {
                                manager_id: null,
                                star: -9999,
                                followed_at: lead.followedAt,
                                completed_at: lead.completedAt,
                                closed_at: lead.closedAt,
                                excluded_at: dayjs().utc().toISOString(),
                                recycled_at: lead.recycledAt,
                              },
                            })),
                          },
                        }).then(({ data }) => {
                          if (
                            data?.update_member_many &&
                            data.update_member_many.filter(v => v?.affected_rows && v?.affected_rows > 0).length > 0
                          ) {
                            message.success('已成功刪除此名單！')
                            onRefetch()
                            setSelectedRowKeys([])
                          } else {
                            message.error('系統錯誤')
                          }
                        })
                      }
                    }}
                  >
                    刪除
                  </Button>
                </>
              )}
              <Button icon={<SwapOutlined />} className="mr-2" onClick={handleTransfer}>
                轉移
              </Button>
            </div>
          </div>
        )}
        <Table<LeadProps>
          rowKey="id"
          rowSelection={{
            selectedRowKeys,
            onChange: onSelectChange,
            preserveSelectedRowKeys: true,
          }}
          loading={isLoading}
          rowClassName={lead => lead.notified && 'notified'}
          columns={columns}
          dataSource={dataSource}
          pagination={{ defaultPageSize: 100, pageSizeOptions: ['20', '50', '100', '300', '500', '1000'] }}
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
              message.success(formatMessage(commonMessages.event.successfullySaved))
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
              alert(formatMessage(salesMessages.additionSuccessful))
              await refetchLeadStatusCategory()
              await onRefetch()
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
                  await onRefetch()
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

const TRANSFER_LEADS = gql`
  mutation TRANSFER_LEADS($memberIds: [String!]!, $managerId: String!) {
    update_member(where: { id: { _in: $memberIds } }, _set: { manager_id: $managerId }) {
      affected_rows
    }
  }
`

const GetMemberAppID = gql`
  query GetMemberAppID($managerId: String!) {
    member(where: { id: { _eq: $managerId } }) {
      app_id
    }
  }
`

const GetManagerAppIDList = gql`
  query GetManagerAppIDList($managerIds: [String!]) {
    member(where: { id: { _in: $managerIds } }) {
      id
      app_id
      name
    }
  }
`

export default SalesLeadTable
