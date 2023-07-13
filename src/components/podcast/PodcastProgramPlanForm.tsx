import { gql, useMutation } from '@apollo/client'
import { Button, Checkbox, Form, InputNumber, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { PodcastProgramAdminProps } from '../../types/podcast'
import SaleInput, { SaleProps } from '../form/SaleInput'
import podcastMessages from './translation'

type FieldProps = {
  listPrice: number
  sale: SaleProps
}

const PodcastProgramPlanForm: React.FC<{
  podcastProgramAdmin: PodcastProgramAdminProps | null
  onRefetch?: () => void
}> = ({ podcastProgramAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [updatePodcastProgramPlan] = useMutation<
    hasura.UPDATE_PODCAST_PROGRAM_PLAN,
    hasura.UPDATE_PODCAST_PROGRAM_PLANVariables
  >(UPDATE_PODCAST_PROGRAM_PLAN)
  const [loading, setLoading] = useState(false)
  const [isIndividuallySale, setIsIndividuallySale] = useState(true)

  useEffect(() => {
    if (podcastProgramAdmin) {
      setIsIndividuallySale(podcastProgramAdmin.isIndividuallySale)
    }
  }, [podcastProgramAdmin])

  if (!podcastProgramAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updatePodcastProgramPlan({
      variables: {
        updatedAt: new Date(),
        podcastProgramId: podcastProgramAdmin.id,
        isIndividuallySale: isIndividuallySale,
        listPrice: values.listPrice ? values.listPrice : podcastProgramAdmin.listPrice,
        salePrice: values.sale ? values.sale.price : null,
        soldAt: values.sale?.soldAt || null,
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
      <Checkbox
        className="mb-4"
        checked={!isIndividuallySale}
        onChange={e => {
          setIsIndividuallySale(!e.target.checked)
        }}
      >
        {formatMessage(podcastMessages.PodcastProgramPlanForm.notIndividuallySale)}
      </Checkbox>

      {isIndividuallySale ? (
        <>
          <Form.Item label={formatMessage(commonMessages.label.listPrice)} name="listPrice">
            <InputNumber
              min={0}
              formatter={value => `NT$ ${value}`}
              parser={value => (value ? value.replace(/\D/g, '') : '')}
            />
          </Form.Item>

          <Form.Item
            name="sale"
            rules={[
              { validator: (rule, value: SaleProps, callback) => callback(value && !value.soldAt ? '' : undefined) },
            ]}
          >
            <SaleInput />
          </Form.Item>
        </>
      ) : null}

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
    $isIndividuallySale: Boolean!
    $updatedAt: timestamptz!
  ) {
    update_podcast_program(
      where: { id: { _eq: $podcastProgramId } }
      _set: {
        list_price: $listPrice
        sale_price: $salePrice
        sold_at: $soldAt
        is_individually_sale: $isIndividuallySale
        updated_at: $updatedAt
      }
    ) {
      affected_rows
    }
  }
`

export default PodcastProgramPlanForm
