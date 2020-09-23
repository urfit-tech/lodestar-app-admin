import { useMutation } from '@apollo/react-hooks'
import { Button, Form, InputNumber, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { PodcastProgramAdminProps } from '../../types/podcast'
import SaleInput, { SaleProps } from '../form/SaleInput'

const PodcastProgramPlanForm: React.FC<{
  podcastProgramAdmin: PodcastProgramAdminProps | null
  onRefetch?: () => void
}> = ({ podcastProgramAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [updatePodcastProgramPlan] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_PLAN,
    types.UPDATE_PODCAST_PROGRAM_PLANVariables
  >(UPDATE_PODCAST_PROGRAM_PLAN)
  const [loading, setLoading] = useState(false)

  if (!podcastProgramAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = (values: any) => {
    setLoading(true)
    updatePodcastProgramPlan({
      variables: {
        updatedAt: new Date(),
        podcastProgramId: podcastProgramAdmin.id,
        listPrice: values.listPrice,
        salePrice: values.sale ? values.sale.price : null,
        soldAt: values.sale ? values.sale.soldAt : null,
      },
    })
      .then(() => {
        onRefetch && onRefetch()
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      hideRequiredMark
      initialValues={{
        listPrice: podcastProgramAdmin.listPrice,
        sale: podcastProgramAdmin.soldAt
          ? {
              price: podcastProgramAdmin.salePrice || 0,
              soldAt: podcastProgramAdmin.soldAt,
            }
          : null,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item label={formatMessage(commonMessages.term.listPrice)} name="listPrice">
        <InputNumber
          min={0}
          formatter={value => `NT$ ${value}`}
          parser={value => (value ? value.replace(/\D/g, '') : '')}
        />
      </Form.Item>

      <Form.Item
        name="sale"
        rules={[{ validator: (rule, value: SaleProps, callback) => callback(value && !value.soldAt ? '' : undefined) }]}
      >
        <SaleInput />
      </Form.Item>

      <Form.Item>
        <Button onClick={() => form.resetFields()} className="mr-2">
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const UPDATE_PODCAST_PROGRAM_PLAN = gql`
  mutation UPDATE_PODCAST_PROGRAM_PLAN(
    $podcastProgramId: uuid!
    $listPrice: numeric
    $salePrice: numeric
    $soldAt: timestamptz
    $updatedAt: timestamptz!
  ) {
    update_podcast_program(
      where: { id: { _eq: $podcastProgramId } }
      _set: { list_price: $listPrice, sale_price: $salePrice, sold_at: $soldAt, updated_at: $updatedAt }
    ) {
      affected_rows
    }
  }
`

export default PodcastProgramPlanForm
