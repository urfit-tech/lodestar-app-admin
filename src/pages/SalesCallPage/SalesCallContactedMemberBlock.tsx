import Icon, { SearchOutlined } from '@ant-design/icons'
import { Button, Input, message, Skeleton, Table } from 'antd'
import { ColumnProps, ColumnsType } from 'antd/lib/table'
import AdminCard from '../../components/admin/AdminCard'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useMutateMemberNote } from '../../hooks/member'
import { ReactComponent as CallOutIcon } from '../../images/icon/call-out.svg'
import { ReactComponent as UserOIcon } from '../../images/icon/user-o.svg'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { call } from '../../helpers'
import { salesMessages } from '../../helpers/translation'
import { ReactComponent as DemoIcon } from '../../images/icon/demo.svg'
import JitsiDemoModal from './JitsiDemoModal'
import { SalesCallMemberProps, SalesProps } from './salesHooks'

const messages = {
  salesCallNotice: { id: 'sales.content.salesCallNotice', defaultMessage: '開發中名單勿滯留過久，否則將影響名單派發' },
  lastTaskDueAt: { id: 'sales.label.lastTaskDueAt', defaultMessage: '待辦效期' },
}

const TableWrapper = styled.div`
  overflow-x: auto;
  th {
    white-space: nowrap;
  }
  td {
    white-space: nowrap;
    color: var(--gray-darker);
  }
`
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
const StyledNotice = styled.div`
  :before {
    margin-right: 4px;
    content: '*';
    color: red;
    vertical-align: middle;
  }
  font-size: 12px;
`

const SalesCallContactedMemberBlock: React.FC<{
  sales: SalesProps
  members: SalesCallMemberProps[]
  loadingMembers: boolean
}> = ({ sales, members, loadingMembers }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { authToken } = useAuth()

  const { insertMemberNote } = useMutateMemberNote()

  const [filters, setFilters] = useState<{
    studentName?: string
    email?: string
    phone?: string
    lastTaskCategoryName?: string
  }>({})
  const [visible, setVisible] = useState(false)
  const [selectedMember, setSelectedMember] = useState<{ id: string; name: string } | null>(null)

  if (loadingMembers) {
    return <Skeleton active />
  }

  const getColumnSearchProps: (onSetFilter: (value?: string) => void) => ColumnProps<SalesCallMemberProps> =
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

  const columns: ColumnsType<SalesCallMemberProps> = [
    {
      key: 'categoryNames',
      dataIndex: 'categoryNames',
      title: formatMessage(commonMessages.label.category),
      render: categoryNames => categoryNames.map((v: string) => <div>{v}</div>),
    },
    {
      key: 'studentName',
      dataIndex: 'name',
      title: formatMessage(salesMessages.studentName),
      ...getColumnSearchProps((value?: string) =>
        setFilters({
          ...filters,
          studentName: value,
        }),
      ),
    },
    {
      key: 'phones',
      dataIndex: 'phones',
      title: formatMessage(salesMessages.tel),
      render: phones => phones.map((v: string) => <address className="m-0">{v}</address>),
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
      key: 'lastContactAt',
      dataIndex: 'lastContactAt',
      title: formatMessage(salesMessages.lastContactAt),
      defaultSortOrder: 'ascend',
      sorter: (a, b) => (b.lastContactAt?.getTime() || 0) - (a.lastContactAt?.getTime() || 0),
      render: lastContactAt => <time>{moment(lastContactAt).fromNow()}</time>,
    },
    {
      key: 'lastTaskCategoryName',
      dataIndex: ['lastTask', 'categoryName'],
      title: formatMessage(salesMessages.lastTask),
      ...getColumnSearchProps((value?: string) =>
        setFilters({
          ...filters,
          lastTaskCategoryName: value,
        }),
      ),
    },
    {
      key: 'lastTaskDueAt',
      dataIndex: ['lastTask', 'dueAt'],
      title: formatMessage(messages.lastTaskDueAt),
      render: dueAt => dueAt && moment(dueAt).format('YYYY-MM-DD HH:mm'),
      showSorterTooltip: false,
    },
    {
      key: 'memberId',
      dataIndex: 'id',
      title: '',
      render: (memberId, record) => (
        <div className="d-flex flex-row justify-content-end">
          <a href={`admin/members/${memberId}`} target="_blank" rel="noreferrer">
            <StyledButton icon={<Icon component={() => <UserOIcon />} />} className="mr-2" />
          </a>
          <StyledButton
            icon={<Icon component={() => <DemoIcon />} />}
            className="mr-2"
            onClick={() => {
              setSelectedMember({
                id: record.id,
                name: record.name,
              })
              setVisible(true)
            }}
          />
          <StyledButton
            disabled={!record.phones[0] || !sales.telephone}
            icon={<Icon component={() => <CallOutIcon />} />}
            type="primary"
            onClick={() =>
              call({
                appId,
                authToken,
                phone: record.phones[0],
                salesTelephone: sales.telephone || '',
              })
            }
          />
        </div>
      ),
    },
  ]
  const dataSource = members.filter(
    v =>
      (!filters.studentName || v.name.toLowerCase().includes(filters.studentName.toLowerCase())) &&
      (!filters.email || v.email.toLowerCase().includes(filters.email.toLowerCase())) &&
      (!filters.phone || v.phones.some(v => v.includes(filters.phone || ''))) &&
      (!filters.lastTaskCategoryName ||
        v.lastTask?.categoryName?.toLowerCase().includes(filters.lastTaskCategoryName.toLowerCase())),
  )

  return (
    <StyledAdminCard>
      <TableWrapper>
        <Table<SalesCallMemberProps> rowKey="memberId" columns={columns} dataSource={dataSource} className="mb-3" />
      </TableWrapper>
      {sales && (
        <JitsiDemoModal
          member={selectedMember}
          salesMember={{
            id: sales.id,
            name: sales.name,
            email: sales.email,
          }}
          visible={visible}
          onCancel={() => setVisible(false)}
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
                setVisible(false)
              })
              .catch(handleError)
          }}
        />
      )}
      <StyledNotice>{formatMessage(messages.salesCallNotice)}</StyledNotice>
    </StyledAdminCard>
  )
}

export default SalesCallContactedMemberBlock
