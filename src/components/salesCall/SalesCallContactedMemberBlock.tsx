import Icon, { SearchOutlined } from '@ant-design/icons'
import { Button, Input, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import AdminCard from 'lodestar-app-admin/src/components/admin/AdminCard'
import { useApp } from 'lodestar-app-admin/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-admin/src/contexts/AuthContext'
import { commonMessages } from 'lodestar-app-admin/src/helpers/translation'
// import { ReactComponent as DemoIcon } from '../../images/icons/demo.svg'
import { ReactComponent as CallOutIcon } from 'lodestar-app-admin/src/images/icon/call-out.svg'
import { ReactComponent as UserOIcon } from 'lodestar-app-admin/src/images/icon/user-o.svg'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { call } from '../../helpers'
import { salesMessages } from '../../helpers/translation'
import { SalesCallMemberProps } from '../../hooks'
import { useFirstAssignedMember } from '../../pages/SalesCallPage'

const messages = {
  salesCallNotice: { id: 'sales.content.salesCallNotice', defaultMessage: '開發中名單勿滯留過久，否則將影響名單派發' },
}

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

const StyledNotice = styled.span`
  :before {
    margin-right: 4px;
    content: '*';
    color: red;
    vertical-align: middle;
  }
  position: absolute;
  font-size: 12px;
  bottom: 44px;
  line-height: 1;
`

type RecordProps = {
  categoryNames: string[]
  studentName: string
  phones: string[]
  email: string
  lastContactAt: Date | null
  memberId: string
}

const SalesCallContactedMemberBlock: React.FC<{
  salesId: string
  members: SalesCallMemberProps[]
}> = ({ salesId, members }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { apiHost, authToken } = useAuth()
  const { sales } = useFirstAssignedMember(salesId)
  const [filters, setFilters] = useState<{
    studentName?: string
    phone?: string
    email?: string
  }>({
    studentName: undefined,
    phone: undefined,
    email: undefined,
  })

  const getColumnSearchProps: (onSetFilter: (value?: string) => void) => ColumnProps<RecordProps> = onSetFilter => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div className="p-2">
        <Input
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => {
            confirm({ closeDropdown: true })
            onSetFilter(selectedKeys[0] as string)
          }}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <div>
          <Button
            type="primary"
            onClick={() => {
              confirm({ closeDropdown: true })
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
        (!filters.studentName || v.name.includes(filters.studentName)) &&
        (!filters.email || v.email.includes(filters.email)) &&
        (!filters.phone || v.phones.some(v => v.includes(filters.phone || ''))),
    )
    .sort((a, b) =>
      a.firstContactAt && b.firstContactAt ? b.firstContactAt.getTime() - a.firstContactAt.getTime() : 1,
    )
    .map(v => ({
      key: v.id,
      categoryNames: v.categoryNames || [],
      studentName: v.name,
      phones: v.phones,
      email: v.email,
      lastContactAt: v.lastContactAt || null,
      memberId: v.id,
    }))

  return (
    <StyledAdminCard>
      <Table<RecordProps>
        rowKey="memberId"
        columns={[
          {
            key: 'categoryNames',
            dataIndex: 'categoryNames',
            title: formatMessage(commonMessages.term.category),
            render: categoryNames => categoryNames.map((v: string) => <div>{v}</div>),
          },
          {
            key: 'studentName',
            dataIndex: 'studentName',
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
            title: formatMessage(salesMessages.label.lastContactAt),
            render: lastContactAt => <time>{moment(lastContactAt).format('YYYY-MM-DD HH:mm')}</time>,
          },
          {
            key: 'memberId',
            dataIndex: 'memberId',
            title: 'id',
            render: (memberId, record) => (
              <div className="d-flex flex-row justify-content-end">
                <a href={`admin/members/${memberId}`} target="_blank" rel="noreferrer">
                  <StyledButton icon={<Icon component={() => <UserOIcon />} />} className="mr-2" />
                </a>
                {/* TODO: jitsi demo */}
                {/* <StyledButton icon={<Icon component={() => <DemoIcon />} />} className="mr-2" /> */}
                <StyledButton
                  disabled={!record.phones[0] || !sales?.telephone}
                  icon={<Icon component={() => <CallOutIcon />} />}
                  type="primary"
                  onClick={() =>
                    call({
                      appId,
                      apiHost,
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
      <StyledNotice>{formatMessage(messages.salesCallNotice)}</StyledNotice>
    </StyledAdminCard>
  )
}

export default SalesCallContactedMemberBlock
