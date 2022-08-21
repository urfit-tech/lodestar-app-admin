import { Button, Form, Input, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Venue } from '../../types/venue'
import pageMessages from '../translation'

type FieldProps = Pick<Venue, 'id' | 'name'>

const VenueBasicForm: React.VFC<{
  venue: Venue | null
  onRefetch?: () => void
}> = ({ venue, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)

  if (!venue) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)

    // updateVenueBasic
  }

  return (
    <Form
      form={form}
      colon={false}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      initialValues={{
        name: venue.name,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item label={formatMessage(pageMessages.VenueBasicForm.venueName)} name="name">
        <Input />
      </Form.Item>
      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button className="mr-2" onClick={() => form.resetFields()}>
          {formatMessage(pageMessages['*'].cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(pageMessages['*'].save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

export default VenueBasicForm
