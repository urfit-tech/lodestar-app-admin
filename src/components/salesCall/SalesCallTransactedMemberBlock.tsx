import { Table } from 'antd'
import AdminCard from "lodestar-app-admin/src/components/admin/AdminCard"
import React from "react"
import { useIntl } from 'react-intl'
import { salesMessages } from "../../helpers/translation"
import { useSalesCallMember } from "../../hooks"
import { ColumnProps } from 'antd/lib/table'
import moment from 'moment'

const SalesCallTransactedMemberBlock: React.FC<{ salesId: string }> = ({ salesId }) => {
  const { loadingMembers, members } = useSalesCallMember({ status: 'transacted', salesId })
  const { formatMessage } = useIntl()

  const dataSource = members.map(v => ({
    studentName: v.name,
    phones: v.phones,
    email: v.email,
    serviceEndedAtList: v.contracts?.map(w => w.endedAt) || [],
    projectPlanNames: v.contracts?.map(w => w.projectPlanName) || [],
  }))

  const columns: ColumnProps<{}>[] = [
    {
      title: formatMessage(salesMessages.label.studentName),
      dataIndex: 'studentName',
    },
    {
      title: formatMessage(salesMessages.label.tel),
      dataIndex: 'phones',
      render: (phones) => phones.map((v: string) => <address>{v}</address>)
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: formatMessage(salesMessages.label.serviceEndedAt),
      dataIndex: 'serviceEndedAtList',
      render: (serviceEndedAtList) => (serviceEndedAtList.map((v: Date) => <time className="d-block">{moment(v).format('YYYY-MM-DD HH:mm')}</time>))
    },
    {
      title: formatMessage(salesMessages.label.productItem),
      dataIndex: 'projectPlanNames',
      render: (projectPlanNames) => projectPlanNames.map((v: string) => <div>{v}</div>)
    }]

  return <AdminCard>
    <Table<{}>
      loading={loadingMembers}
      rowClassName={() => 'cursor-pointer'}
      columns={columns}
      dataSource={dataSource}
    />
  </AdminCard>
}

export default SalesCallTransactedMemberBlock