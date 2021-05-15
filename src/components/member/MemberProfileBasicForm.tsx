import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import moment from 'moment'
import { includes } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { MemberAdminProps } from '../../types/member'
import AllMemberSelector from '../form/AllMemberSelector'
import CategorySelector from '../form/CategorySelector'
import TagSelector from '../form/TagSelector'

type FieldProps = {
  name: string
  username: string
  email: string
  phones: string[]
  categoryIds: string[]
  tags?: string[]
  managerId?: string
}

const MemberProfileBasicForm: React.FC<{
  memberAdmin: MemberAdminProps | null
  onRefetch?: () => void
}> = ({ memberAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { currentUserRole, permissions } = useAuth()
  const { enabledModules } = useApp()
  const [updateMemberProfileBasic] = useMutation<
    hasura.UPDATE_MEMBER_PROFILE_BASIC,
    hasura.UPDATE_MEMBER_PROFILE_BASICVariables
  >(UPDATE_MEMBER_PROFILE_BASIC)
  const [loading, setLoading] = useState(false)

  if (!memberAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)

    updateMemberProfileBasic({
      variables: {
        name: values?.name || memberAdmin.name,
        username: permissions['MEMBER_USERNAME_EDIT'] ? values?.username || memberAdmin.username : memberAdmin.username,
        email: permissions['MEMBER_EMAIL_EDIT'] ? values?.email || memberAdmin.email : memberAdmin.email,
        memberId: memberAdmin.id,
        phones: permissions['MEMBER_PHONE_ADMIN']
          ? values.phones
              .filter((phone: string) => !!phone)
              .map((phone: string) => ({
                member_id: memberAdmin.id,
                phone,
              }))
          : memberAdmin.phones.map((phone: string) => ({
              member_id: memberAdmin.id,
              phone,
            })),
        managerId:
          enabledModules.member_assignment && permissions['MEMBER_MANAGER_ADMIN']
            ? values.managerId || null
            : memberAdmin.manager?.id,
        assignedAt: values.managerId ? new Date() : null,
        tags: (values.tags || memberAdmin.tags).map(tag => ({
          name: tag,
          type: '',
        })),
        memberTags: (values.tags || memberAdmin.tags).map(tag => ({
          member_id: memberAdmin.id,
          tag_name: tag,
        })),
        memberCategories: values.categoryIds.map((categoryId: string, index: number) => ({
          member_id: memberAdmin.id,
          category_id: categoryId,
          position: index,
        })),
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      colon={false}
      hideRequiredMark
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 12 } }}
      initialValues={{
        managerId: memberAdmin.manager?.id,
        name: memberAdmin.name,
        username: memberAdmin.username,
        email: memberAdmin.email,
        phones: memberAdmin.phones.length ? memberAdmin.phones : [''],
        specialities: memberAdmin.specialities,
        categoryIds: memberAdmin.categories.map(category => category.id),
        tags: memberAdmin.tags,
      }}
      onFinish={handleSubmit}
    >
      {enabledModules.member_assignment && permissions['MEMBER_MANAGER_ADMIN'] && (
        <Form.Item
          label={formatMessage(commonMessages.label.assign)}
          name="managerId"
          extra={memberAdmin.assignedAt ? moment(memberAdmin.assignedAt).format('YYYY-MM-DD HH:mm:ss') : ''}
        >
          <AllMemberSelector allowClear />
        </Form.Item>
      )}

      <Form.Item label={formatMessage(commonMessages.label.name)} name="name">
        <Input />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.label.account)} name="username">
        <Input disabled={!permissions['MEMBER_USERNAME_EDIT']} />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.label.email)} name="email">
        <Input disabled={!permissions['MEMBER_EMAIL_EDIT']} />
      </Form.Item>
      {permissions['MEMBER_PHONE_ADMIN'] && (
        <Form.Item label={formatMessage(commonMessages.label.phone)} name="phones">
          <PhoneCollectionInput />
        </Form.Item>
      )}
      <Form.Item label={formatMessage(commonMessages.label.speciality)} name="specialities">
        <TagSelector disabled />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.label.memberCategory)} name="categoryIds">
        <CategorySelector classType="member" />
      </Form.Item>
      {includes(currentUserRole, ['app-owner', 'content-creator']) && (
        <Form.Item label={formatMessage(commonMessages.label.tags)} name="tags">
          <TagSelector />
        </Form.Item>
      )}

      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button className="mr-2" onClick={() => form.resetFields()}>
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const PhoneCollectionInput: React.FC<{
  value?: string[]
  onChange?: (value: string[]) => void
}> = ({ value, onChange }) => {
  return (
    <>
      {value?.map((phone, index) => (
        <Input
          key={index}
          className={index !== value.length - 1 ? 'mb-4' : 'mb-0'}
          value={phone}
          onChange={e => {
            const newValue = [...value]
            newValue.splice(index, 1, e.target.value)
            onChange && onChange(newValue)
          }}
        />
      ))}
    </>
  )
}

const UPDATE_MEMBER_PROFILE_BASIC = gql`
  mutation UPDATE_MEMBER_PROFILE_BASIC(
    $name: String
    $username: String
    $email: String
    $memberId: String!
    $managerId: String
    $assignedAt: timestamptz
    $tags: [tag_insert_input!]!
    $memberTags: [member_tag_insert_input!]!
    $phones: [member_phone_insert_input!]!
    $memberCategories: [member_category_insert_input!]!
  ) {
    update_member(
      where: { id: { _eq: $memberId } }
      _set: { name: $name, username: $username, email: $email, manager_id: $managerId, assigned_at: $assignedAt }
    ) {
      affected_rows
    }
    # update tags
    delete_member_tag(where: { member_id: { _eq: $memberId } }) {
      affected_rows
    }
    insert_tag(objects: $tags, on_conflict: { constraint: tag_pkey, update_columns: [updated_at] }) {
      affected_rows
    }
    insert_member_tag(objects: $memberTags) {
      affected_rows
    }

    # update phones
    delete_member_phone(where: { member_id: { _eq: $memberId } }) {
      affected_rows
    }
    insert_member_phone(objects: $phones) {
      affected_rows
    }

    # update memberCategories
    delete_member_category(where: { member_id: { _eq: $memberId } }) {
      affected_rows
    }
    insert_member_category(objects: $memberCategories) {
      affected_rows
    }
  }
`

export default MemberProfileBasicForm
