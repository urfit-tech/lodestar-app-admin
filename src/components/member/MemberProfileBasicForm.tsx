import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { MemberAdminProps } from '../../types/member'
import CategorySelector from '../form/CategorySelector'
import TagSelector from '../form/TagSelector'

type FieldProps = {
  phones: string[]
  tags: string[]
  categoryIds: string[]
}

const MemberProfileBasicForm: React.FC<{
  memberAdmin: MemberAdminProps | null
  onRefetch?: () => void
}> = ({ memberAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { permissions } = useAuth()
  const [updateMemberProfileBasic] = useMutation<
    types.UPDATE_MEMBER_PROFILE_BASIC,
    types.UPDATE_MEMBER_PROFILE_BASICVariables
  >(UPDATE_MEMBER_PROFILE_BASIC)
  const [loading, setLoading] = useState(false)

  if (!memberAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateMemberProfileBasic({
      variables: {
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
        tags: values.tags.map((tag: string) => ({
          name: tag,
          type: '',
        })),
        memberTags: values.tags.map((tag: string) => ({
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
      <Form.Item label={formatMessage(commonMessages.term.name)} name="name">
        <Input disabled />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.account)} name="username">
        <Input disabled />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.email)} name="email">
        <Input disabled />
      </Form.Item>
      {permissions['MEMBER_PHONE_ADMIN'] && (
        <Form.Item label={formatMessage(commonMessages.term.phone)} name="phones">
          <PhoneCollectionInput />
        </Form.Item>
      )}
      <Form.Item label={formatMessage(commonMessages.term.speciality)} name="specialities">
        <TagSelector disabled />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.memberCategories)} name="categoryIds">
        <CategorySelector classType="member" />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.tags)} name="tags">
        <TagSelector />
      </Form.Item>

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
    $memberId: String!
    $tags: [tag_insert_input!]!
    $memberTags: [member_tag_insert_input!]!
    $phones: [member_phone_insert_input!]!
    $memberCategories: [member_category_insert_input!]!
  ) {
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
