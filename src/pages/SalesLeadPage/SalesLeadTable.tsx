import Icon, {
  CheckSquareOutlined,
  FileAddOutlined,
  SearchOutlined,
  StopOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Input, message, Table } from 'antd'
import { ColumnProps, ColumnsType } from 'antd/lib/table'
import gql from 'graphql-tag'
import AdminCard from 'lodestar-app-admin/src/components/admin/AdminCard'
import MemberNoteAdminModal from 'lodestar-app-admin/src/components/member/MemberNoteAdminModal'
import MemberTaskAdminModal from 'lodestar-app-admin/src/components/member/MemberTaskAdminModal'
import { useApp } from 'lodestar-app-admin/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-admin/src/contexts/AuthContext'
import { handleError } from 'lodestar-app-admin/src/helpers'
import { commonMessages, memberMessages } from 'lodestar-app-admin/src/helpers/translation'
import { useUploadAttachments } from 'lodestar-app-admin/src/hooks/data'
import { useMutateMemberNote } from 'lodestar-app-admin/src/hooks/member'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { call } from '../../helpers'
import { salesMessages } from '../../helpers/translation'
import { ReactComponent as DemoIcon } from '../../images/icons/demo.svg'
import { Lead } from '../../types/sales'
import { SalesProps } from '../SalesCallPage/salesHooks'
import JitsiDemoModal from './JitsiDemoModal'

const StyledButton = styled(Button)`
  display: flex;
  justify-content: center;
  border-radius: 4px;
  width: 56px;
  height: 36px;
`
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

const SalesLeadTable: React.VFC<{ sales: SalesProps; leads: Lead[]; onRefetch?: () => void }> = ({
  sales,
  leads,
  onRefetch,
}) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { authToken } = useAuth()

  const { insertMemberNote } = useMutateMemberNote()
  const [closeLead] = useMutation<hasura.CLOSE_LEAD, hasura.CLOSE_LEADVariables>(CLOSE_LEAD)
  const [transferLead] = useMutation<hasura.TRANSFER_LEAD, hasura.TRANSFER_LEADVariables>(TRANSFER_LEAD)

  const uploadAttachments = useUploadAttachments()

  const [filters, setFilters] = useState<{
    studentName?: string
    email?: string
    phone?: string
    lastTaskCategoryName?: string
    categoryName?: string
    status?: string
  }>({})
  const [jitsiModalVisible, setJitsiModalVisible] = useState(false)
  const [taskModalVisible, setTaskModalVisible] = useState(false)
  const [memberNoteModalVisible, setMemberNoteModalVisible] = useState(false)
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string } | null>(null)

  const getColumnSearchProps: (onSetFilter: (value?: string) => void) => ColumnProps<Lead> = onSetFilter => ({
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

  const columns: ColumnsType<Lead> = [
    {
      key: 'memberId',
      dataIndex: 'id',
      title: '',
      render: (memberId, record) => (
        <div className="d-flex flex-row justify-content-end">
          <StyledButton
            icon={<CheckSquareOutlined />}
            className="mr-2"
            onClick={() => {
              setSelectedMember({
                id: record.id,
                name: record.name,
              })
              setTaskModalVisible(true)
            }}
          />
          <StyledButton
            className="mr-2"
            icon={<FileAddOutlined />}
            onClick={() => {
              setSelectedMember({
                id: record.id,
                name: record.name,
              })
              setMemberNoteModalVisible(true)
            }}
          />
          <StyledButton
            icon={<Icon component={() => <DemoIcon />} />}
            className="mr-2"
            onClick={() => {
              setSelectedMember({
                id: record.id,
                name: record.name,
              })
              setJitsiModalVisible(true)
            }}
          />
        </div>
      ),
    },
    {
      key: 'star',
      dataIndex: 'star',
      title: formatMessage(salesMessages.label.star),
      sorter: (a, b) => a.star - b.star,
    },
    {
      key: 'categoryNames',
      dataIndex: 'categoryNames',
      title: formatMessage(commonMessages.label.category),
      ...getColumnSearchProps((value?: string) =>
        setFilters({
          ...filters,
          categoryName: value,
        }),
      ),
      render: (categoryNames: string[]) =>
        categoryNames.map((categoryName, idx) => <div key={idx}>{categoryName}</div>),
    },
    {
      key: 'studentName',
      dataIndex: 'name',
      title: formatMessage(salesMessages.label.studentName),
      ...getColumnSearchProps((value?: string) =>
        setFilters({
          ...filters,
          studentName: value,
        }),
      ),
      render: (name, lead) => {
        return (
          <a href={`/admin/members/${lead.id}`} target="_blank" rel="noreferrer">
            {name}
          </a>
        )
      },
    },
    {
      key: 'phones',
      dataIndex: 'phones',
      title: formatMessage(salesMessages.label.tel),
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
                salesTelephone: sales.telephone || '',
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
      key: 'email',
      dataIndex: 'email',
      title: 'Email',
      ...getColumnSearchProps((value?: string) =>
        setFilters({
          ...filters,
          email: value,
        }),
      ),
    },
    {
      key: 'createdAt',
      dataIndex: 'createdAt',
      title: formatMessage(salesMessages.label.createdAt),
      defaultSortOrder: 'descend',
      sorter: (a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0),
      render: createdAt => <time>{moment(createdAt).fromNow()}</time>,
    },
    {
      key: 'paid',
      dataIndex: 'paid',
      title: formatMessage(salesMessages.label.paidPrice),
      sorter: (a, b) => a.paid - b.paid,
    },
    {
      key: 'action',
      dataIndex: 'id',
      title: '',
      render: (memberId, record) => (
        <div className="d-flex flex-row justify-content-end">
          <StyledButton
            icon={<SwapOutlined />}
            className="mr-2"
            onClick={() => {
              const managerId = window.prompt('你要轉移此名單給哪個承辦編號？')
              if (managerId) {
                transferLead({ variables: { memberId, managerId } }).then(({ data }) => {
                  if (data?.update_member?.affected_rows) {
                    window.alert('已成功轉移此名單！')
                    onRefetch?.()
                  } else {
                    window.alert('轉移失敗ＱＱ')
                  }
                })
              }
            }}
          />
          <StyledButton
            icon={<StopOutlined style={{ color: 'red' }} />}
            onClick={() => {
              if (window.confirm('你確定要放棄此筆名單？')) {
                closeLead({ variables: { memberId } }).then(({ data }) => {
                  if (data?.update_member?.affected_rows) {
                    window.alert('已成功放棄此名單！')
                    onRefetch?.()
                  } else {
                    window.alert('系統錯誤ＱＱ')
                  }
                })
              }
            }}
          />
        </div>
      ),
    },
  ]
  const dataSource = leads.filter(
    v =>
      (!filters.studentName || v.name.toLowerCase().includes(filters.studentName.toLowerCase())) &&
      (!filters.email || v.email.toLowerCase().includes(filters.email.toLowerCase())) &&
      (!filters.phone || v.phones.some(v => v.includes(filters.phone || ''))) &&
      (!filters.categoryName ||
        v.categoryNames.find(categoryName => categoryName.includes(filters.categoryName || ''))),
  )

  return (
    <StyledAdminCard>
      {selectedMember && (
        <MemberTaskAdminModal
          key={selectedMember.id}
          visible={taskModalVisible}
          onCancel={() => setTaskModalVisible(false)}
          title={formatMessage(memberMessages.ui.newTask)}
          initialMemberId={selectedMember.id}
          initialExecutorId={sales.id}
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
                authorId: sales.id,
                type,
                status,
                duration,
                description,
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
        <Table<Lead>
          rowClassName={row => (row.notified ? 'notified' : '')}
          rowKey="memberId"
          columns={columns}
          dataSource={dataSource}
          className="mb-3"
        />
      </TableWrapper>
      {sales && (
        <JitsiDemoModal
          member={selectedMember}
          salesMember={{
            id: sales.id,
            name: sales.name,
            email: sales.email,
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
                authorId: sales.id,
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
      )}
    </StyledAdminCard>
  )
}

const CLOSE_LEAD = gql`
  mutation CLOSE_LEAD($memberId: String!) {
    update_member(_set: { manager_id: null, star: -999 }, where: { id: { _eq: $memberId } }) {
      affected_rows
    }
  }
`

const TRANSFER_LEAD = gql`
  mutation TRANSFER_LEAD($memberId: String!, $managerId: String!) {
    update_member(where: { id: { _eq: $memberId } }, _set: { manager_id: $managerId }) {
      affected_rows
    }
  }
`

export default SalesLeadTable
