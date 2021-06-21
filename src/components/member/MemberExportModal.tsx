import { ExportOutlined } from '@ant-design/icons'
import { useApolloClient } from '@apollo/react-hooks'
import { Button, Checkbox, Col, Form, Row } from 'antd'
import gql from 'graphql-tag'
import moment from 'moment'
import { repeat, sum } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { downloadCSV, toCSV } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { UserRole } from '../../types/member'
import AdminModal from '../admin/AdminModal'

type ExportMemberProps = {
  id: string
  name: string
  email: string
  role: UserRole
  createdAt: Date | null
  loginedAt: Date
  phones: string[]
  consumption: number
  categories: { id: string; name: string }[]
  tags: string[]
}
const MemberExportModal: React.FC<{
  roleSelector?: React.ReactNode
  filter?: {
    role?: UserRole
    name?: string
    email?: string
    managerId?: string
  }
  membersCount: number
}> = ({ roleSelector, filter, membersCount }) => {
  const { formatMessage } = useIntl()
  const client = useApolloClient()
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

  const getPartialMembers = async (
    filter?: {
      role?: UserRole
      name?: string
      email?: string
      phone?: string
      category?: string
      managerName?: string
      managerId?: string
      tag?: string
      properties?: {
        id: string
        value?: string
      }[]
    },
    createdAt?: Date | null,
  ) => {
    const condition: hasura.GET_MEMBER_COLLECTIONVariables['condition'] = {
      role: filter?.role ? { _eq: filter.role } : undefined,
      name: filter?.name ? { _ilike: `%${filter.name}%` } : undefined,
      email: filter?.email ? { _ilike: `%${filter.email}%` } : undefined,
      manager: filter?.managerName
        ? {
            name: { _ilike: `%${filter.managerName}%` },
          }
        : undefined,
      manager_id: filter?.managerId ? { _eq: filter.managerId } : undefined,
      member_phones: filter?.phone
        ? {
            phone: { _ilike: `%${filter.phone}%` },
          }
        : undefined,
      member_categories: filter?.category
        ? {
            category: {
              name: {
                _ilike: `%${filter.category}%`,
              },
            },
          }
        : undefined,
      member_tags: filter?.tag
        ? {
            tag_name: {
              _ilike: filter.tag,
            },
          }
        : undefined,
      member_properties: filter?.properties?.length
        ? {
            _and: filter.properties
              .filter(property => property.value)
              .map(property => ({
                property_id: { _eq: property.id },
                value: { _ilike: `%${property.value}%` },
              })),
          }
        : undefined,
    }
    const { loading, data } = await client.query<hasura.GET_MEMBER_COLLECTION, hasura.GET_MEMBER_COLLECTIONVariables>({
      query: GET_MEMBER_COLLECTION,
      variables: {
        condition: {
          ...condition,
          created_at: { _lt: createdAt },
        },
        limit: 10000,
      },
    })

    const members: ExportMemberProps[] =
      loading || !data
        ? []
        : data.member.map(v => ({
            id: v.id,
            name: v.name || v.username,
            email: v.email,
            role: v.role as UserRole,
            createdAt: v.created_at ? new Date(v.created_at) : null,
            loginedAt: v.logined_at,
            phones: v.member_phones.map(v => v.phone),
            consumption: sum(
              v.order_logs.map((orderLog: any) => orderLog.order_products_aggregate.aggregate.sum.price || 0),
            ),
            categories: v.member_categories.map(w => ({
              id: w.category.id,
              name: w.category.name,
            })),
            tags: v.member_tags.map(w => w.tag_name),
          }))
    return {
      partialMembers: members,
    }
  }

  const fetchAllMembers = async () => {
    const members: ExportMemberProps[] = []

    do {
      const { partialMembers } = await getPartialMembers(
        filter,
        members.slice(-1)[0] ? members.slice(-1)[0].createdAt : undefined,
      )
      members.push(...partialMembers)
    } while (members.length < membersCount)
    return members
  }

  const exportMemberList = async () => {
    setLoadingMembers(true)
    const members = await fetchAllMembers()
    setLoadingMembers(false)
    const maxPhoneAmounts = Math.max(...members.map(v => v.phones.length))
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
          row.push(member.categories.map((v: { name: string }) => v.name).toString())
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

const GET_MEMBER_COLLECTION = gql`
  query GET_MEMBER_COLLECTION($condition: member_bool_exp, $limit: Int) {
    member_aggregate(where: $condition) {
      aggregate {
        count
      }
    }
    member(where: $condition, order_by: { created_at: desc_nulls_last }, limit: $limit) {
      id
      name
      username
      email
      created_at
      logined_at
      role
      member_phones {
        id
        phone
      }
      member_categories {
        id
        category {
          id
          name
        }
      }
      member_tags {
        id
        tag_name
      }
      member_properties {
        id
        property_id
        value
      }
      order_logs(where: { status: { _eq: "SUCCESS" } }) {
        order_products_aggregate {
          aggregate {
            sum {
              price
            }
          }
        }
      }
    }
  }
`

export default MemberExportModal
