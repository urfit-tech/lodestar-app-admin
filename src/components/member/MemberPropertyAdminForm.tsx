import { Button, Form, Input, message, Select, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useMemberPropertyCollection, useMutateMemberProperty, useProperty } from '../../hooks/member'

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
  const { updateMemberProperty } = useMutateMemberProperty()
  const [loading, setLoading] = useState(false)

  if (loadingProperties || loadingMemberProperties) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateMemberProperty({
      variables: {
        memberProperties: Object.keys(values)
          .filter(propertyId => values[propertyId] || values[propertyId] === '')
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
            <>
              <Select
                allowClear
                defaultValue={memberProperties.find(v => v.id === property.id)?.value}
                onChange={v => form.setFieldsValue({ [property.id]: v ? v.toString() : '' })}
              >
                {property?.placeholder?.split('/').map((value: string, idx: number) => (
                  <Select.Option key={idx} value={value}>
                    {value}
                  </Select.Option>
                ))}
              </Select>
            </>
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

export default MemberPropertyAdminForm
