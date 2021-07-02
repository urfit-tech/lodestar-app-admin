import { ExportOutlined } from '@ant-design/icons'
import { useApolloClient } from '@apollo/react-hooks'
import { Button, Checkbox, Col, Form, Row, Select } from 'antd'
import gql from 'graphql-tag'
import moment from 'moment'
import { repeat } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { downloadCSV, handleError, toCSV } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { UserRole } from '../../types/member'
import AdminModal from '../admin/AdminModal'

type ExportMemberProps = {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: Date | null
  loginedAt: Date | null
  phones: string[]
  categories: string[]
  consumption: number
}
const MemberExportModal: React.FC<{
  appId: string
  filter?: {
    name?: string
    email?: string
    phone?: string | undefined
    category?: string | undefined
    tag?: string | undefined
    managerId?: string
  }
}> = ({ appId, filter }) => {
  const { formatMessage } = useIntl()
  const client = useApolloClient()
  const [selectedRole, setSelectedRole] = useState('all-members')
  const [selectedExportFields, setSelectedExportFields] = useState<string[]>(['name', 'email'])
  const [loadingMembers, setLoadingMembers] = useState(false)

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

  const exportMemberList = async () => {
    try {
      setLoadingMembers(true)

      const { data } = await client.query<hasura.GET_MEMBER_COLLECTION, hasura.GET_MEMBER_COLLECTIONVariables>({
        query: GET_MEMBER_COLLECTION,
        variables: {
          condition: {
            role: selectedRole === 'all-members' ? undefined : { _eq: selectedRole },
            name: filter?.name ? { _ilike: `%${filter.name}%` } : undefined,
            email: filter?.email ? { _ilike: `%${filter.email}%` } : undefined,
            phones: filter?.phone ? { _ilike: `%${filter.phone}%` } : undefined,
            categories: filter?.category ? { _ilike: `%${filter.category}%` } : undefined,
            tags: filter?.tag ? { _ilike: `%${filter.tag}%` } : undefined,
            manager_id: filter?.managerId ? { _eq: filter.managerId } : undefined,
          },
        },
      })

      let maxPhoneAmounts = 1
      const members: ExportMemberProps[] =
        data?.member_export.map(v => {
          const phones = v.phones?.split(',') || []
          if (phones.length > maxPhoneAmounts) {
            maxPhoneAmounts = phones.length
          }
          return {
            id: v.id || '',
            name: v.name || v.username || '',
            email: v.email || '',
            role: v.role as UserRole,
            createdAt: v.created_at ? new Date(v.created_at) : null,
            loginedAt: v.logined_at ? new Date(v.logined_at) : null,
            phones,
            consumption: v.consumption || 0,
            categories: v.categories?.split(',') || [],
          }
        }) || []

      const csvData: string[][] = [
        options
          .filter(option => selectedExportFields.some(field => field === option.value))
          .map(option => {
            if (option.value === 'phone') {
              return repeat(option.label, maxPhoneAmounts)
            }
            return option.label
          })
          .flat(), // columns
      ]
      members.forEach(member => {
        const row: string[] = []
        selectedExportFields.some(field => field === 'name') && row.push(member.name)
        selectedExportFields.some(field => field === 'memberIdentity') &&
          row.push(
            member.role === 'general-member'
              ? formatMessage(commonMessages.label.generalMember)
              : member.role === 'content-creator'
              ? formatMessage(commonMessages.label.contentCreator)
              : member.role === 'app-owner'
              ? formatMessage(commonMessages.label.appOwner)
              : formatMessage(commonMessages.label.anonymousUser),
          )
        selectedExportFields.some(field => field === 'email') && row.push(member.email)
        selectedExportFields.some(field => field === 'phone') &&
          row.push(...member.phones, ...repeat('', maxPhoneAmounts - member.phones.length))
        selectedExportFields.some(field => field === 'category') && row.push(member.categories.join(','))
        selectedExportFields.some(field => field === 'orderLogCreatedDate') &&
          row.push(member.createdAt ? moment(member.createdAt).format('YYYY-MM-DD HH:mm') : '')
        selectedExportFields.some(field => field === 'lastLogin') &&
          row.push(member.loginedAt ? moment(member.loginedAt).format('YYYY-MM-DD HH:mm') : '')
        selectedExportFields.some(field => field === 'consumption') && row.push(`${member.consumption}`)
        csvData.push(row)
      })
      downloadCSV(`members-${appId}.csv`, toCSV(csvData))
    } catch (error) {
      handleError(error)
    }

    setLoadingMembers(false)
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
        <Form.Item label={formatMessage(commonMessages.label.roleType)}>
          <Select<string> value={selectedRole} onChange={v => setSelectedRole(v)}>
            <Select.Option value="all-members">{formatMessage(commonMessages.label.allMembers)}</Select.Option>
            <Select.Option value="app-owner">{formatMessage(commonMessages.label.appOwner)}</Select.Option>
            <Select.Option value="content-creator">{formatMessage(commonMessages.label.contentCreator)}</Select.Option>
            <Select.Option value="general-member">{formatMessage(commonMessages.label.generalMember)}</Select.Option>
          </Select>
        </Form.Item>
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

const GET_MEMBER_COLLECTION = gql`
  query GET_MEMBER_COLLECTION($condition: member_export_bool_exp!) {
    member_export(where: $condition) {
      id
      app_id
      name
      username
      email
      created_at
      logined_at
      role
      phones
      categories
      consumption
    }
  }
`

export default MemberExportModal
