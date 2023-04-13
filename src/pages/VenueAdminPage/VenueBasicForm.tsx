import { gql, useMutation } from '@apollo/client'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { handleError } from 'lodestar-app-element/src/helpers'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
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
  const [updateVenueBasic] = useMutation<hasura.UPDATE_VENUE_BASIC, hasura.UPDATE_VENUE_BASICVariables>(
    UPDATE_VENUE_BASIC,
  )

  if (!venue) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateVenueBasic({ variables: { venueId: venue.id, name: values.name } })
      .then(() => {
        message.success(formatMessage(pageMessages['*'].successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
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

const UPDATE_VENUE_BASIC = gql`
  mutation UPDATE_VENUE_BASIC($venueId: uuid!, $name: String) {
    update_venue(where: { id: { _eq: $venueId } }, _set: { name: $name }) {
      affected_rows
    }
  }
`

export default VenueBasicForm
