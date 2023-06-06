import {
  CheckOutlined,
  CheckSquareOutlined,
  CloseOutlined,
  DeleteOutlined,
  FileAddOutlined,
  SearchOutlined,
  StarOutlined,
  StopOutlined,
  SwapOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Input, message, Table, Tag } from 'antd'
import { ColumnProps, ColumnsType } from 'antd/lib/table'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import { uniq } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { call, handleError } from '../../helpers'
import { commonMessages, memberMessages, salesMessages } from '../../helpers/translation'
import { useUploadAttachments } from '../../hooks/data'
import { useMutateMemberNote } from '../../hooks/member'
import { LeadProps, Manager } from '../../types/sales'
import AdminCard from '../admin/AdminCard'
import MemberNoteAdminModal from '../member/MemberNoteAdminModal'
import MemberTaskAdminModal from '../task/MemberTaskAdminModal'
import JitsiDemoModal from './JitsiDemoModal'
import MemberPropertyModal from './MemberPropertyModal'

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

const SalesLeadTable: React.VFC<{
  variant?: 'followed' | 'completed'
  manager: Manager
  leads: LeadProps[]
  onRefetch?: () => void
}> = ({ variant, manager, leads, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { authToken } = useAuth()

  const { insertMemberNote } = useMutateMemberNote()
  const [updateLeads] = useMutation<hasura.UPDATE_LEADS, hasura.UPDATE_LEADSVariables>(UPDATE_LEADS)
  const [transferLeads] = useMutation<hasura.TRANSFER_LEADS, hasura.TRANSFER_LEADSVariables>(TRANSFER_LEADS)

  const uploadAttachments = useUploadAttachments()

  const [filters, setFilters] = useState<{
    nameAndEmail?: string
    phone?: string
    lastTaskCategoryName?: string
    leadLevel?: string
    categoryName?: string
    materialName?: string
    status?: string
  }>({})
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [propertyModalVisible, setPropertyModalVisible] = useState(false)
  const [jitsiModalVisible, setJitsiModalVisible] = useState(false)
  const [taskModalVisible, setTaskModalVisible] = useState(false)
  const [memberNoteModalVisible, setMemberNoteModalVisible] = useState(false)
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string; categoryNames: string[] } | null>(
    null,
  )
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

  const dataSource = leads
    .filter(
      v =>
        (!filters.nameAndEmail ||
          v.name.toLowerCase().includes(filters.nameAndEmail.trim().toLowerCase()) ||
          v.email.toLowerCase().includes(filters.nameAndEmail.trim().toLowerCase())) &&
        (!filters.phone || v.phones.some(v => v.includes(filters.phone?.trim() || ''))) &&
        (!filters.categoryName ||
          v.categoryNames.find(categoryName =>
            categoryName.toLowerCase().includes(filters.categoryName?.trim().toLowerCase() || ''),
          )) &&
        (!filters.materialName ||
          v.properties.find(
            property =>
              property.name === '廣告素材' &&
              property.value.toLowerCase().includes(filters.materialName?.trim().toLowerCase() || ''),
          )),
    )
    .map(v => ({ ...v, nameAndEmail: v.name + v.email }))

  const categoryNames = uniq(dataSource.flatMap(data => data.categoryNames))

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
      ],
      sorter: (a, b) =>
        (a.properties.find(property => property.name === '名單分級')?.value || 'N') >
        (b.properties.find(property => property.name === '名單分級')?.value || 'N')
          ? 1
          : -1,
      defaultSortOrder: 'descend',
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
          <Button
            icon={<CheckSquareOutlined />}
            className="mr-1"
            onClick={() => {
              setSelectedMember({
                id: record.id,
                name: record.name,
                categoryNames: record.categoryNames,
              })
              setTaskModalVisible(true)
            }}
          />
          <Button
            className="mr-1"
            icon={<FileAddOutlined />}
            onClick={() => {
              setSelectedMember({
                id: record.id,
                name: record.name,
                categoryNames: record.categoryNames,
              })
              setMemberNoteModalVisible(true)
            }}
          />
        </div>
      ),
    },
    {
      key: 'nameAndEmail',
      dataIndex: 'nameAndEmail',
      width: 200,
      title: formatMessage(salesMessages.studentName),
      ...getColumnSearchProps((value?: string) =>
        setFilters({
          ...filters,
          nameAndEmail: value,
        }),
      ),
      render: (nameAndEmail, lead) => {
        const leadLevel = lead.properties.find(property => property.name === '名單分級')?.value || 'N'
        const color = leadLevel === 'SSR' ? 'red' : leadLevel === 'SR' ? 'orange' : leadLevel === 'R' ? 'yellow' : ''
        return (
          <a href={`/admin/members/${lead.id}`} target="_blank" rel="noreferrer" className="d-flex flex-column">
            <span>
              <Tag color={color}>{leadLevel}</Tag>
              {lead.name}
            </span>
            <small>{lead.email}</small>
          </a>
        )
      },
    },
    {
      key: 'phones',
      dataIndex: 'phones',
      width: 100,
      title: formatMessage(salesMessages.tel),
      render: (phones: string[]) =>
        phones.map((phone, idx) => (
          <a
            key={idx}
            href="#!"
            className="m-0 mr-1 cursor-pointer"
            onClick={() => {
              call({
                appId,
                authToken,
                phone,
                salesTelephone: manager.telephone,
              })
            }}
          >
            {phone}
          </a>
        )),
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
      key: 'createdAt',
      dataIndex: 'createdAt',
      title: formatMessage(salesMessages.createdAt),
      sorter: (a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0),
      render: createdAt => <time>{moment(createdAt).fromNow()}</time>,
    },
    {
      key: 'recentContactedAt',
      dataIndex: 'recentContactedAt',
      title: formatMessage(salesMessages.recentContactedAt),
      sorter: (a, b) => (a.recentContactedAt?.getTime() || 0) - (b.recentContactedAt?.getTime() || 0),
      render: recentContactedAt => recentContactedAt && <time>{moment(recentContactedAt).fromNow()}</time>,
    },
    {
      key: 'recentAnsweredAt',
      dataIndex: 'recentAnsweredAt',
      title: formatMessage(salesMessages.recentAnsweredAt),
      sorter: (a, b) => (a.recentAnsweredAt?.getTime() || 0) - (b.recentAnsweredAt?.getTime() || 0),
      render: recentAnsweredAt =>
        recentAnsweredAt && <time>{recentAnsweredAt && moment(recentAnsweredAt).fromNow()}</time>,
    },
  ]

  return (
    <StyledAdminCard>
      {selectedMember && (
        <MemberPropertyModal
          key={selectedMember.id}
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
          key={selectedMember.id}
          visible={taskModalVisible}
          onCancel={() => setTaskModalVisible(false)}
          title={formatMessage(memberMessages.ui.newTask)}
          initialMemberId={selectedMember.id}
          initialExecutorId={manager.id}
          onRefetch={() => {
            setTaskModalVisible(false)
          }}
        />
      )}
      {selectedMember && (
        <MemberNoteAdminModal
          key={selectedMember.id}
          visible={memberNoteModalVisible}
          onCancel={() => setMemberNoteModalVisible(false)}
          title={formatMessage(memberMessages.label.createMemberNote)}
          onSubmit={({ type, status, duration, description, attachments }) =>
            insertMemberNote({
              variables: {
                memberId: selectedMember.id,
                authorId: manager.id,
                type,
                status,
                duration,
                description,
                lastMemberNoteCalled: type === 'outbound' && status !== 'answered' ? new Date() : undefined,
                lastMemberNoteAnswered: type === 'outbound' && status === 'answered' ? new Date() : undefined,
              },
            })
              .then(async ({ data }) => {
                const memberNoteId = data?.insert_member_note_one?.id
                if (memberNoteId && attachments.length) {
                  await uploadAttachments('MemberNote', memberNoteId, attachments)
                }
                message.success(formatMessage(commonMessages.event.successfullyCreated))
                onRefetch?.()
              })
              .catch(handleError)
              .finally(() => setMemberNoteModalVisible(false))
          }
        />
      )}
      <TableWrapper>
        {selectedRowKeys.length > 0 && (
          <div className="d-flex flex-row justify-content-end mb-3">
            {variant !== 'followed' && (
              <Button
                icon={<StarOutlined />}
                className="mr-2"
                onClick={() => {
                  if (window.confirm('確定收錄這些名單？')) {
                    updateLeads({
                      variables: {
                        memberIds: selectedRowKeys.map(rowKey => rowKey.toString()),
                        newMemberId: manager.id,
                        followedAt: new Date(),
                      },
                    }).then(({ data }) => {
                      if (data?.update_member?.affected_rows) {
                        message.success('已成功收錄！')
                        onRefetch?.()
                      } else {
                        message.error('系統錯誤ＱＱ')
                      }
                    })
                  }
                }}
              >
                收藏
              </Button>
            )}
            {variant === 'followed' && (
              <Button
                className="mr-2"
                onClick={() => {
                  if (window.confirm('確定取消收藏這些名單？')) {
                    updateLeads({
                      variables: {
                        memberIds: selectedRowKeys.map(rowKey => rowKey.toString()),
                        newMemberId: manager.id,
                        followedAt: null,
                      },
                    }).then(({ data }) => {
                      if (data?.update_member?.affected_rows) {
                        message.success('已成功取消收藏！')
                        onRefetch?.()
                      } else {
                        message.error('系統錯誤ＱＱ')
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
                        memberIds: selectedRowKeys.map(rowKey => rowKey.toString()),
                        newMemberId: manager.id,
                        completedAt: new Date(),
                      },
                    }).then(({ data }) => {
                      if (data?.update_member?.affected_rows) {
                        message.success('已成功完成此名單！')
                        onRefetch?.()
                      } else {
                        message.error('系統錯誤ＱＱ')
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
                        memberIds: selectedRowKeys.map(rowKey => rowKey.toString()),
                        newMemberId: manager.id,
                        completedAt: null,
                      },
                    }).then(({ data }) => {
                      if (data?.update_member?.affected_rows) {
                        message.success('已取消已完成名單！')
                        onRefetch?.()
                      } else {
                        message.error('系統錯誤ＱＱ')
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
                          memberIds: selectedRowKeys.map(rowKey => rowKey.toString()),
                          newMemberId: null,
                          newStar: -Number(manager.telephone),
                        },
                      }).then(({ data }) => {
                        if (data?.update_member?.affected_rows) {
                          message.success('已成功回收此名單！')
                          onRefetch?.()
                        } else {
                          message.error('系統錯誤ＱＱ')
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
                          memberIds: selectedRowKeys.map(rowKey => rowKey.toString()),
                          newMemberId: null,
                          closedAt: new Date(),
                        },
                      }).then(({ data }) => {
                        if (data?.update_member?.affected_rows) {
                          message.success('已成功拒絕此名單！')
                          onRefetch?.()
                        } else {
                          message.error('系統錯誤ＱＱ')
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
                          memberIds: selectedRowKeys.map(rowKey => rowKey.toString()),
                          newMemberId: null,
                          newStar: -9999,
                        },
                      }).then(({ data }) => {
                        if (data?.update_member?.affected_rows) {
                          message.success('已成功刪除此名單！')
                          onRefetch?.()
                        } else {
                          message.error('系統錯誤ＱＱ')
                        }
                      })
                    }
                  }}
                >
                  刪除
                </Button>
              </>
            )}
            <Button
              icon={<SwapOutlined />}
              className="mr-2"
              onClick={() => {
                const managerId = window.prompt('你要轉移此名單給哪個承辦編號？')?.trim()
                if (managerId) {
                  transferLeads({
                    variables: { memberIds: selectedRowKeys.map(rowKey => rowKey.toString()), managerId },
                  })
                    .then(({ data, errors }) => {
                      if (data?.update_member?.affected_rows) {
                        window.alert('已成功轉移此名單！')
                        onRefetch?.()
                      } else {
                        window.alert(`轉移失敗：${errors?.join(', ')}`)
                      }
                    })
                    .catch(error => {
                      window.alert(`轉移失敗：${error}`)
                    })
                }
              }}
            >
              轉移
            </Button>
          </div>
        )}
        <Table<LeadProps>
          rowKey="id"
          rowSelection={{
            selectedRowKeys,
            onChange: onSelectChange,
          }}
          rowClassName={lead => lead.notified && 'notified'}
          columns={columns}
          dataSource={dataSource}
          pagination={{ defaultPageSize: 100, pageSizeOptions: ['20', '50', '100', '300', '500', '1000'] }}
          className="mb-3"
        />
      </TableWrapper>
      {
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
      }
    </StyledAdminCard>
  )
}

const UPDATE_LEADS = gql`
  mutation UPDATE_LEADS(
    $memberIds: [String!]!
    $newMemberId: String
    $newStar: numeric
    $followedAt: timestamptz
    $closedAt: timestamptz
    $completedAt: timestamptz
  ) {
    update_member(
      _set: {
        manager_id: $newMemberId
        star: $newStar
        followed_at: $followedAt
        closed_at: $closedAt
        completed_at: $completedAt
      }
      where: { id: { _in: $memberIds } }
    ) {
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

export default SalesLeadTable
