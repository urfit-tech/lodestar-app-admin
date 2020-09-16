import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useProperty } from '../../hooks/member'
import types from '../../types'
import { MemberAdminProps } from '../../types/member'

const MemberPropertyAdminForm: React.FC<{
  memberAdmin: MemberAdminProps | null
  onRefetch?: () => void
}> = ({ memberAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const { loadingProperties, properties } = useProperty()
  const [updateMemberProperty] = useMutation<types.UPDATE_MEMBER_PROPERTY, types.UPDATE_MEMBER_PROPERTYVariables>(
    UPDATE_MEMBER_PROPERTY,
  )
  const [loading, setLoading] = useState(false)

  if (!memberAdmin || loadingProperties) {
    return <Skeleton active />
  }

  const handleSubmit = (values: any) => {
    setLoading(true)
    updateMemberProperty({
      variables: {
        memberId: memberAdmin.id,
        memberProperties: Object.keys(values)
          .filter(propertyId => values[propertyId])
          .map(propertyId => ({
            member_id: memberAdmin.id,
            property_id: propertyId,
            value: values[propertyId],
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
      initialValues={memberAdmin.properties.reduce(
        (accumulator, currentValue) => ({
          ...accumulator,
          [currentValue.id]: currentValue.value,
        }),
        {},
      )}
      onFinish={handleSubmit}
    >
      {properties.map(property => (
        <Form.Item key={property.id} label={property.name} name={property.id}>
          <Input />
        </Form.Item>
      ))}

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

const UPDATE_MEMBER_PROPERTY = gql`
  mutation UPDATE_MEMBER_PROPERTY($memberId: String!, $memberProperties: [member_property_insert_input!]!) {
    delete_member_property(where: { member_id: { _eq: $memberId } }) {
      affected_rows
    }
    insert_member_property(objects: $memberProperties) {
      affected_rows
    }
  }
`

export default MemberPropertyAdminForm
