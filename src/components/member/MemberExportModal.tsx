import { ExportOutlined } from '@ant-design/icons'
import { Button, Checkbox, Col, Form, Row } from 'antd'
import moment from 'moment'
import { repeat } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { downloadCSV, toCSV } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useMemberAllCollection } from '../../hooks/member'
import { UserRole } from '../../types/member'
import AdminModal from '../admin/AdminModal'

const MemberExportModal: React.FC<{
  roleSelector?: React.ReactNode
  filter?: {
    role?: UserRole
    name?: string
    email?: string
    managerId?: string
  }
}> = ({ roleSelector, filter }) => {
  const { formatMessage } = useIntl()
  const { loadingMembers, members } = useMemberAllCollection(filter)
  const [selectedExportFields, setSelectedExportFields] = useState<string[]>(['name', 'email'])

  const maxPhoneAmounts = Math.max(...members.map(v => v.phones.length))

  const options = [
    { label: formatMessage(commonMessages.label.memberName), value: 'name' },
    { label: formatMessage(commonMessages.label.memberIdentity), value: 'memberIdentity' },
    { label: 'Email', value: 'email' },
    { label: formatMessage(commonMessages.label.phone), value: 'phone' },
    { label: formatMessage(commonMessages.label.memberCategory), value: 'category' },
    { label: formatMessage(commonMessages.label.orderLogCreatedDate), value: 'orderLogCreatedDate' },
    { label: formatMessage(commonMessages.label.lastLogin), value: 'lastLogin' },
    { label: formatMessage(commonMessages.label.consumption), value: 'consumption' },
  ]

  const exportMemberList = () => {
    const columns = options
      .filter(option => selectedExportFields.some(field => field === option.value))
      .map(option => {
        if (option.value === 'phone') {
          return repeat(option.label, maxPhoneAmounts)
        }
        return option.label
      })
      .flat()
    const data: string[][] = [
      columns,
      ...members.map(member => {
        const row: string[] = []
        selectedExportFields.some(field => field === 'name') && row.push(member.name)
        selectedExportFields.some(field => field === 'memberIdentity') && row.push(member.role)
        selectedExportFields.some(field => field === 'email') && row.push(member.email)
        selectedExportFields.some(field => field === 'phone') &&
          row.push(...member.phones, ...repeat('', maxPhoneAmounts - member.phones.length))
        selectedExportFields.some(field => field === 'category') &&
          row.push(member.categories.map(v => v.name).toString())
        selectedExportFields.some(field => field === 'orderLogCreatedDate') &&
          row.push(member.createdAt ? moment(member.createdAt).format('YYYYMMDD HH:mm') : '')
        selectedExportFields.some(field => field === 'lastLogin') &&
          row.push(member.loginedAt ? moment(member.loginedAt).format('YYYYMMDD HH:mm') : '')
        selectedExportFields.some(field => field === 'consumption') && row.push(`${member.consumption}`)
        return row
      }),
    ]

    downloadCSV('members', toCSV(data))
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button icon={<ExportOutlined />} onClick={() => setVisible(true)}>
          {formatMessage(commonMessages.ui.export)}
        </Button>
      )}
      confirmLoading={loadingMembers}
      title={formatMessage(commonMessages.ui.downloadMemberList)}
      cancelText={formatMessage(commonMessages.ui.cancel)}
      okText={formatMessage(commonMessages.ui.export)}
      onOk={() => exportMemberList()}
    >
      <Form layout="vertical" colon={false} hideRequiredMark>
        <Form.Item label={formatMessage(commonMessages.label.roleType)}>{roleSelector}</Form.Item>
        <Form.Item label={formatMessage(commonMessages.label.exportFields)}>
          <Checkbox.Group
            value={selectedExportFields}
            onChange={checkedValues => setSelectedExportFields(checkedValues.map(v => v.toString()))}
          >
            <Row>
              {options.map(v => (
                <Col span={8} key={v.value}>
                  <Checkbox value={v.value}>{v.label}</Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default MemberExportModal
