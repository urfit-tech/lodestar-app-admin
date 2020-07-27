import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { FormComponentProps } from '@ant-design/compatible/lib/form'
import { useMutation } from '@apollo/react-hooks'
import { Button, InputNumber, message, Skeleton } from 'antd'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import SaleInput from '../../components/admin/SaleInput'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { PodcastProgramProps } from '../../types/podcast'

type PodcastProgramPlanFormProps = FormComponentProps & {
  podcastProgram: PodcastProgramProps | null
  onRefetch?: () => Promise<any>
}
const PodcastProgramPlanForm: React.FC<PodcastProgramPlanFormProps> = ({ form, podcastProgram, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [updatePodcastProgramPlan] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_PLAN,
    types.UPDATE_PODCAST_PROGRAM_PLANVariables
  >(UPDATE_PODCAST_PROGRAM_PLAN)

  const [loading, setLoading] = useState(false)

  if (!podcastProgram) {
    return <Skeleton active />
  }

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      setLoading(true)

      updatePodcastProgramPlan({
        variables: {
          updatedAt: new Date(),
          podcastProgramId: podcastProgram.id,
          listPrice: values.listPrice,
          salePrice: values.sale ? values.sale.price : null,
          soldAt: values.sale ? values.sale.soldAt : null,
        },
      })
        .then(() => {
          onRefetch && onRefetch().then(() => message.success(formatMessage(commonMessages.event.successfullySaved)))
        })
        .catch(error => handleError(error))
        .finally(() => setLoading(false))
    })
  }

  return (
    <Form
      hideRequiredMark
      colon={false}
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Form.Item label={formatMessage(commonMessages.term.listPrice)}>
        {form.getFieldDecorator('listPrice', {
          initialValue: podcastProgram.listPrice,
        })(
          <InputNumber
            min={0}
            formatter={value => `NT$ ${value}`}
            parser={value => (value ? value.replace(/\D/g, '') : '')}
          />,
        )}
      </Form.Item>

      <Form.Item>
        {form.getFieldDecorator('sale', {
          initialValue: podcastProgram.soldAt
            ? {
                price: podcastProgram.salePrice || 0,
                soldAt: podcastProgram.soldAt,
              }
            : null,
          rules: [{ validator: (rule, value, callback) => callback((value && !value.soldAt) || undefined) }],
        })(<SaleInput />)}
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

export default Form.create<PodcastProgramPlanFormProps>()(PodcastProgramPlanForm)
