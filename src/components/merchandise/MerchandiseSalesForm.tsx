import { useMutation } from '@apollo/react-hooks'
import { Button, Form, InputNumber, message, Skeleton } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import types from '../../types'
import { MerchandiseProps } from '../../types/merchandise'

type MerchandiseSalesFormProps = FormComponentProps & {
  merchandise: MerchandiseProps | null
  merchandiseId: string
  refetch?: () => void
}
const MerchandiseSalesForm: React.FC<MerchandiseSalesFormProps> = ({ form, merchandise, merchandiseId, refetch }) => {
  const { formatMessage } = useIntl()
  const updateMerchandiseSales = useUpdateMerchandiseSales(merchandiseId)
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }

      setLoading(true)
      updateMerchandiseSales({
        price: values.price,
      })
        .then(() => {
          refetch && refetch()
          message.success(formatMessage(commonMessages.event.successfullySaved))
        })
        .finally(() => setLoading(false))
    })
  }

  if (!merchandise) {
    return <Skeleton active />
  }

  return (
    <Form
      hideRequiredMark
      labelCol={{ span: 24, md: { span: 4 } }}
      wrapperCol={{ span: 24, md: { span: 8 } }}
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Form.Item label={formatMessage(merchandiseMessages.label.price)}>
        {form.getFieldDecorator('price', {
          initialValue: merchandise.price,
        })(
          <InputNumber
            min={0}
            formatter={value => `NT$ ${value}`}
            parser={value => (value ? value.replace(/\D/g, '') : '')}
          />,
        )}
      </Form.Item>
      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
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

const useUpdateMerchandiseSales = (merchandiseId: string) => {
  const [updateSales] = useMutation<types.UPDATE_MERCHANDISE_SALES, types.UPDATE_MERCHANDISE_SALESVariables>(gql`
    mutation UPDATE_MERCHANDISE_SALES($merchandiseId: uuid!, $price: numeric) {
      update_merchandise(where: { id: { _eq: $merchandiseId } }, _set: { price: $price }) {
        affected_rows
      }
    }
  `)

  const updateMerchandiseSales: (data: { price: number }) => Promise<void> = async ({ price }) => {
    try {
      await updateSales({
        variables: {
          merchandiseId,
          price,
        },
      })
    } catch (error) {
      handleError(error)
    }
  }

  return updateMerchandiseSales
}

export default Form.create<MerchandiseSalesFormProps>()(MerchandiseSalesForm)
