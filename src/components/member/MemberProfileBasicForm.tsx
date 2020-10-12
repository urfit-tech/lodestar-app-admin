import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { MemberAdminProps } from '../../types/member'
import TagSelector from '../form/TagSelector'

const MemberProfileBasicForm: React.FC<{
  memberAdmin: MemberAdminProps | null
  onRefetch?: () => void
}> = ({ memberAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [updateMemberProfileBasic] = useMutation<
    types.UPDATE_MEMBER_PROFILE_BASIC,
    types.UPDATE_MEMBER_PROFILE_BASICVariables
  >(UPDATE_MEMBER_PROFILE_BASIC)
  const [loading, setLoading] = useState(false)

  if (!memberAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = (values: any) => {
    setLoading(true)
    updateMemberProfileBasic({
      variables: {
        memberId: memberAdmin.id,
        phones: values.phones
          .filter((phone: string) => !!phone)
          .map((phone: string) => ({
            member_id: memberAdmin.id,
            phone,
          })),
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch && onRefetch()
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
      <Form.Item label={formatMessage(commonMessages.term.phone)} name="phones">
        <PhoneCollectionInput />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.tags)} name="tags">
        <TagSelector disabled />
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
  mutation UPDATE_MEMBER_PROFILE_BASIC($memberId: String!, $phones: [member_phone_insert_input!]!) {
    delete_member_phone(where: { member_id: { _eq: $memberId } }) {
      affected_rows
    }
    insert_member_phone(objects: $phones) {
      affected_rows
    }
  }
`

export default MemberProfileBasicForm
