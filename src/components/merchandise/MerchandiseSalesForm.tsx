import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { FormComponentProps } from '@ant-design/compatible/lib/form'
import { useMutation } from '@apollo/react-hooks'
import { Button, Checkbox, DatePicker, InputNumber, message } from 'antd'
import gql from 'graphql-tag'
import moment from 'moment-timezone'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { MerchandiseProps } from '../../types/merchandise'
import SaleInput from '../form/SaleInput'

const messages = defineMessages({
  setSalePrice: { id: 'merchandise.label.setSalePrice', defaultMessage: '設定優惠價' },
  setSellingTime: { id: 'merchandise.label.setSellingTime', defaultMessage: '限定販售時間' },
})

type MerchandiseSalesFormProps = FormComponentProps & {
  merchandise: MerchandiseProps
  merchandiseId: string
  refetch?: () => void
}
const MerchandiseSalesForm: React.FC<MerchandiseSalesFormProps> = ({ form, merchandise, merchandiseId, refetch }) => {
  const { formatMessage } = useIntl()
  const updateMerchandiseSales = useUpdateMerchandiseSales(merchandiseId)

  const [loading, setLoading] = useState(false)
  const [withSellingTime, setWithSellingTime] = useState(!!merchandise.startedAt || !!merchandise.endedAt)

  const handleSubmit = () => {
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }

      setLoading(true)
      updateMerchandiseSales({
        listPrice: values.listPrice,
        salePrice: values.sale ? values.sale.price : null,
        soldAt: values.sale ? values.sale.soldAt : null,
        startedAt: withSellingTime ? moment(values.startedAt).startOf('minute').toDate() : null,
        endedAt: withSellingTime ? moment(values.endedAt).startOf('minute').toDate() : null,
      })
        .then(() => {
          refetch && refetch()
          message.success(formatMessage(commonMessages.event.successfullySaved))
        })
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
          initialValue: merchandise.listPrice,
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
          initialValue: merchandise.soldAt
            ? {
                price: merchandise.salePrice,
                soldAt: merchandise.soldAt,
              }
            : null,
          rules: [{ validator: (rule, value, callback) => callback((value && !value.soldAt) || undefined) }],
        })(<SaleInput />)}
      </Form.Item>

      <div className="mb-4">
        <Checkbox checked={withSellingTime} onChange={e => setWithSellingTime(e.target.checked)}>
          {formatMessage(messages.setSellingTime)}
        </Checkbox>
        <div className={`mt-2 ${withSellingTime ? 'd-block' : 'd-none'}`}>
          <Form.Item label={formatMessage(commonMessages.term.startedAt)} className="mb-0">
            {form.getFieldDecorator('startedAt', {
              initialValue: merchandise.startedAt && moment(merchandise.startedAt),
            })(
              <DatePicker
                format="YYYY-MM-DD HH:mm"
                showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
              />,
            )}
          </Form.Item>

          <Form.Item label={formatMessage(commonMessages.term.endedAt)}>
            {form.getFieldDecorator('endedAt', {
              initialValue: merchandise.endedAt && moment(merchandise.endedAt),
            })(
              <DatePicker
                format="YYYY-MM-DD HH:mm"
                showTime={{ format: 'HH:mm', defaultValue: moment('23:59:00', 'HH:mm:ss') }}
              />,
            )}
          </Form.Item>
        </div>
      </div>

      <div>
        <Button onClick={() => form.resetFields()} className="mr-2">
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </div>
    </Form>
  )
}

const useUpdateMerchandiseSales = (merchandiseId: string) => {
  const [updateSales] = useMutation<types.UPDATE_MERCHANDISE_SALES, types.UPDATE_MERCHANDISE_SALESVariables>(gql`
    mutation UPDATE_MERCHANDISE_SALES(
      $merchandiseId: uuid!
      $listPrice: numeric
      $salePrice: numeric
      $soldAt: timestamptz
      $startedAt: timestamptz
      $endedAt: timestamptz
    ) {
      update_merchandise(
        where: { id: { _eq: $merchandiseId } }
        _set: {
          list_price: $listPrice
          sale_price: $salePrice
          sold_at: $soldAt
          started_at: $startedAt
          ended_at: $endedAt
        }
      ) {
        affected_rows
      }
    }
  `)

  const updateMerchandiseSales: (data: {
    listPrice: number
    salePrice: number | null
    soldAt: Date | null
    startedAt: Date | null
    endedAt: Date | null
  }) => Promise<void> = async ({ listPrice, salePrice, soldAt, startedAt, endedAt }) => {
    try {
      await updateSales({
        variables: {
          merchandiseId,
          listPrice,
          salePrice,
          soldAt,
          startedAt,
          endedAt,
        },
      })
    } catch (error) {
      handleError(error)
    }
  }

  return updateMerchandiseSales
}

export default Form.create<MerchandiseSalesFormProps>()(MerchandiseSalesForm)
