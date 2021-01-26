import { Table } from 'antd'
import AdminCard from "lodestar-app-admin/src/components/admin/AdminCard"
import { commonMessages } from 'lodestar-app-admin/src/helpers/translation'
import moment from 'moment'
import React from "react"
import { useIntl } from 'react-intl'
import { salesMessages } from "../../helpers/translation"
import { useSalesCallMember } from "../../hooks"
import { ColumnProps } from 'antd/lib/table'

const SalesCallContactedMemberBlock: React.FC<{ salesId: string }> = ({ salesId }) => {
  const { loadingMembers, errorMembers, members } = useSalesCallMember({ status: 'contacted', salesId })
  const { formatMessage } = useIntl()

  const dataSource = members.map(v => ({
    categoryNames: v.categoryNames,
    studentName: v.name,
    phones: v.phones,
    email: v.email,
    lastContactAt: v.lastContactAt
  }))

  const columns: ColumnProps<{
    phones: string[]
  }>[] = [{
    title: formatMessage(commonMessages.term.category),
    dataIndex: 'categoryNames',
    render: (categoryNames) => categoryNames.map((v: string) => <div>{v}</div>)
  },
  {
    title: formatMessage(salesMessages.label.studentName),
    dataIndex: 'studentName',
  },
  {
    title: formatMessage(salesMessages.label.tel),
    dataIndex: 'phones',
    render: (phones) => phones.map((v: string) => <address className="m-0">{v}</address>)
  }, {
    title: 'Email',
    dataIndex: 'email',
  }, {
    title: formatMessage(salesMessages.label.lastContactAt),
    dataIndex: 'lastContactAt',
    render: (lastContactAt) => (<time>{moment(lastContactAt).format('YYYY-MM-DD HH:mm')}</time>)
  }]

  return <AdminCard>
    <Table
      loading={loadingMembers}
      rowClassName={() => 'cursor-pointer'}
      columns={columns}
      dataSource={dataSource}
    />
  </AdminCard>
}

export default SalesCallContactedMemberBlock