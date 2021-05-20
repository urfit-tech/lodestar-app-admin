import Icon, { SearchOutlined } from '@ant-design/icons'
import { Button, Input, message, Table } from 'antd'
import { ColumnProps, ColumnsType } from 'antd/lib/table'
import AdminCard from 'lodestar-app-admin/src/components/admin/AdminCard'
import { useApp } from 'lodestar-app-admin/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-admin/src/contexts/AuthContext'
import { handleError } from 'lodestar-app-admin/src/helpers'
import { commonMessages } from 'lodestar-app-admin/src/helpers/translation'
import { useMutateMemberNote } from 'lodestar-app-admin/src/hooks/member'
import { ReactComponent as UserOIcon } from 'lodestar-app-admin/src/images/icon/user-o.svg'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
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
`

const SalesLeadTable: React.VFC<{ sales: SalesProps; leads: Lead[] }> = ({ sales, leads }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { apiHost, authToken } = useAuth()

  const { insertMemberNote } = useMutateMemberNote()

  const [filters, setFilters] = useState<{
    studentName?: string
    email?: string
    phone?: string
    lastTaskCategoryName?: string
  }>({})
  const [visible, setVisible] = useState(false)
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
      render: categoryNames => categoryNames.map((v: string) => <div>{v}</div>),
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
            className="m-0 cursor-pointer"
            onClick={() => {
              call({
                appId,
                apiHost,
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
  ]
  const dataSource = leads.filter(
    v =>
      (!filters.studentName || v.name.toLowerCase().includes(filters.studentName.toLowerCase())) &&
      (!filters.email || v.email.toLowerCase().includes(filters.email.toLowerCase())) &&
      (!filters.phone || v.phones.some(v => v.includes(filters.phone || ''))),
  )

  return (
    <StyledAdminCard>
      <TableWrapper>
        <Table<Lead> rowKey="memberId" columns={columns} dataSource={dataSource} className="mb-3" />
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
    </StyledAdminCard>
  )
}

export default SalesLeadTable
