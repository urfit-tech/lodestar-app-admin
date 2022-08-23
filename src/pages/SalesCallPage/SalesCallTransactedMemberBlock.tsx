import Icon, { SearchOutlined } from '@ant-design/icons'
import { Button, Input, Skeleton, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import AdminCard from '../../components/admin/AdminCard'
import { commonMessages } from '../../helpers/translation'
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
import { SalesCallMemberProps, SalesProps } from './salesHooks'

const StyledButton = styled(Button)`
  display: flex;
  justify-content: center;
  border-radius: 4px;
  width: 56px;
  height: 36px;
`
const TableWrapper = styled.div`
  overflow-x: auto;
  th {
    white-space: nowrap;
  }
  td {
    color: var(--gray-darker);
  }
`

type RecordProps = {
  studentName: string
  phones: string[]
  email: string
  serviceEndedAtList: Date[]
  projectPlanNames: string[]
  memberId: string
}

const SalesCallTransactedMemberBlock: React.FC<{
  sales: SalesProps
  members: SalesCallMemberProps[]
  loadingMembers: boolean
}> = ({ sales, members, loadingMembers }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { authToken } = useAuth()

  const [filters, setFilters] = useState<{
    studentName?: string
    phone?: string
    email?: string
  }>({})

  if (loadingMembers) {
    return <Skeleton active />
  }

  const getColumnSearchProps: (onSetFilter: (value?: string) => void) => ColumnProps<RecordProps> = onSetFilter => ({
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

  const dataSource = members
    .filter(
      v =>
        (!filters.studentName || v.name.toLowerCase().includes(filters.studentName.toLowerCase())) &&
        (!filters.email || v.email.toLowerCase().includes(filters.email.toLowerCase())) &&
        (!filters.phone || v.phones.some(v => v.includes(filters.phone || ''))),
    )
    .map(v => ({
      studentName: v.name,
      phones: v.phones,
      email: v.email,
      serviceEndedAtList: v.contracts?.map(w => w.endedAt) || [],
      projectPlanNames: v.contracts?.map(w => w.projectPlanName) || [],
      memberId: v.id,
    }))

  return (
    <AdminCard>
      <TableWrapper>
        <Table<RecordProps>
          rowKey="memberId"
          columns={[
            {
              key: 'studentName',
              dataIndex: 'studentName',
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
              key: 'serviceEndedAtList',
              dataIndex: 'serviceEndedAtList',
              title: formatMessage(salesMessages.serviceEndedAt),
              render: serviceEndedAtList =>
                serviceEndedAtList.map((v: Date) => (
                  <time className="d-block">{moment(v).format('YYYY-MM-DD HH:mm')}</time>
                )),
            },
            {
              key: 'projectPlanNames',
              dataIndex: 'projectPlanNames',
              title: formatMessage(salesMessages.productItem),
              render: projectPlanNames => projectPlanNames.map((v: string) => <div>{v}</div>),
            },
            {
              key: 'memberId',
              dataIndex: 'memberId',
              render: (memberId, record) => (
                <div className="d-flex flex-row justify-content-end">
                  <a href={`admin/members/${memberId}`} target="_blank" rel="noreferrer">
                    <StyledButton icon={<Icon component={() => <UserOIcon />} />} className="mr-2" />
                  </a>
                  <StyledButton
                    disabled={!record.phones[0] || !sales?.telephone}
                    icon={<Icon component={() => <CallOutIcon />} />}
                    type="primary"
                    onClick={() =>
                      call({
                        appId,
                        authToken,
                        phone: record.phones[0],
                        salesTelephone: sales?.telephone || '',
                      })
                    }
                  />
                </div>
              ),
            },
          ]}
          dataSource={dataSource}
        />
      </TableWrapper>
    </AdminCard>
  )
}

export default SalesCallTransactedMemberBlock
