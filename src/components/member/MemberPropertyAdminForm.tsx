import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Form, Input, message, Select, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useProperty } from '../../hooks/member'
import { MemberPropertyProps } from '../../types/member'

type FieldProps = {
  [propertyId: string]: string
}

const MemberPropertyAdminForm: React.FC<{
  memberId: string
}> = ({ memberId }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { loadingProperties, properties } = useProperty()
  const { loadingMemberProperties, memberProperties, refetchMemberProperties } = useMemberPropertyCollection(memberId)
  const [updateMemberProperty] = useMutation<hasura.UPDATE_MEMBER_PROPERTY, hasura.UPDATE_MEMBER_PROPERTYVariables>(
    UPDATE_MEMBER_PROPERTY,
  )
  const [loading, setLoading] = useState(false)

  if (loadingProperties || loadingMemberProperties) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateMemberProperty({
      variables: {
        memberId,
        memberProperties: Object.keys(values)
          .filter(propertyId => values[propertyId])
          .map(propertyId => ({
            member_id: memberId,
            property_id: propertyId,
            value: values[propertyId],
          })),
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        refetchMemberProperties()
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
      initialValues={memberProperties.reduce(
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
          {property?.placeholder?.includes('/') ? (
            <Select>
              {property?.placeholder?.split('/').map((value: string, idx: number) => (
                <Select.Option key={idx} value={value}>
                  {value}
                </Select.Option>
              ))}
            </Select>
          ) : (
            <Input />
          )}
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

const useMemberPropertyCollection = (memberId: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_MEMBER_PROPERTY_COLLECTION,
    hasura.GET_MEMBER_PROPERTY_COLLECTIONVariables
  >(
    gql`
      query GET_MEMBER_PROPERTY_COLLECTION($memberId: String!) {
        member_property(where: { member: { id: { _eq: $memberId } } }) {
          id
          property {
            id
            name
          }
          value
        }
      }
    `,
    {
      variables: {
        memberId,
      },
      context: {
        important: true,
      },
    },
  )

  const memberProperties: MemberPropertyProps[] =
    data?.member_property.map(v => ({
      id: v.property.id,
      name: v.property.name,
      value: v.value,
    })) || []

  return {
    loadingMemberProperties: loading,
    errorMemberProperties: error,
    memberProperties,
    refetchMemberProperties: refetch,
  }
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
