import { Button, DatePicker, Form, Input, InputNumber } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import ProductSelector from '../../containers/common/ProductSelector'
import { commonMessages, errorMessages, promotionMessages } from '../../helpers/translation'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import PlanCodeSelector, { PlanCodeProps } from '../checkout/PlanCodeSelector'

const messages = defineMessages({
  exchangeItemsAmount: { id: 'promotion.label.exchangeItemsAmount', defaultMessage: '兌換項目數量' },
  exchangeItems: { id: 'promotion.label.exchangeItems', defaultMessage: '兌換項目' },
})

export type VoucherPlanFields = {
  title: string
  productQuantityLimit: number
  voucherCodes: PlanCodeProps[]
  voucherPlanProducts: string[]
  description: string | null
  startedAt?: Date
  endedAt?: Date
}
type VoucherPlanAdminModalProps = AdminModalProps &
  FormComponentProps & {
    voucherPlan?: {
      id: string
      title: string
      description: string | null
      startedAt?: Date
      endedAt?: Date
      productQuantityLimit: number
      productIds: string[]
    }
    onSubmit?: (
      setVisible: React.Dispatch<React.SetStateAction<boolean>>,
      setLoading: React.Dispatch<React.SetStateAction<boolean>>,
      values: VoucherPlanFields,
    ) => void
  }
const VoucherPlanAdminModal: React.FC<VoucherPlanAdminModalProps> = ({ form, voucherPlan, onSubmit, ...props }) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)

  const handleClick = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      if (onSubmit) {
        onSubmit(setVisible, setLoading, values)
      }
    })
  }

  return (
    <AdminModal
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleClick(setVisible)}>
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </>
      )}
      maskClosable={false}
      {...props}
    >
      <Form hideRequiredMark colon={false}>
        <Form.Item label={formatMessage(promotionMessages.term.voucherPlanTitle)}>
          {form.getFieldDecorator('title', {
            initialValue: voucherPlan ? voucherPlan.title : '',
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(promotionMessages.term.voucherPlanTitle),
                }),
              },
            ],
          })(<Input type="text" />)}
        </Form.Item>

        {!voucherPlan && (
          <Form.Item label={formatMessage(promotionMessages.term.voucherCodes)}>
            {form.getFieldDecorator('voucherCodes', {
              rules: [{ required: true, message: formatMessage(errorMessages.form.voucherCodes) }],
            })(<PlanCodeSelector planType="voucher" />)}
          </Form.Item>
        )}

        <Form.Item label={formatMessage(messages.exchangeItems)}>
          {form.getFieldDecorator('voucherPlanProducts', {
            initialValue: voucherPlan ? voucherPlan.productIds : [],
            rules: [{ required: true, message: formatMessage(errorMessages.form.exchangeItems) }],
          })(<ProductSelector allowTypes={['Program', 'Card', 'ActivityTicket']} />)}
        </Form.Item>

        <Form.Item label={formatMessage(messages.exchangeItemsAmount)}>
          {form.getFieldDecorator('productQuantityLimit', {
            initialValue: voucherPlan ? voucherPlan.productQuantityLimit : 1,
            rules: [{ required: true, message: formatMessage(errorMessages.form.exchangeItemsAmount) }],
          })(<InputNumber min={1} />)}
        </Form.Item>

        <Form.Item label={formatMessage(promotionMessages.label.availableDateRange)}>
          <Form.Item className="d-inline-block m-0">
            {form.getFieldDecorator('startedAt', {
              initialValue: voucherPlan && voucherPlan.startedAt ? moment(voucherPlan.startedAt) : null,
            })(
              <DatePicker
                placeholder={formatMessage(commonMessages.term.startedAt)}
                format="YYYY-MM-DD HH:mm"
                showTime={{ defaultValue: moment('00:00:00', 'HH:mm') }}
              />,
            )}
          </Form.Item>
          <span className="d-inline-block px-2">-</span>
          <Form.Item className="d-inline-block m-0">
            {form.getFieldDecorator('endedAt', {
              initialValue: voucherPlan && voucherPlan.endedAt ? moment(voucherPlan.endedAt) : null,
            })(
              <DatePicker
                placeholder={formatMessage(commonMessages.term.endedAt)}
                format="YYYY-MM-DD HH:mm"
                showTime={{ defaultValue: moment('23:59:59', 'HH:mm') }}
              />,
            )}
          </Form.Item>
        </Form.Item>
        <Form.Item label={formatMessage(promotionMessages.term.description)}>
          {form.getFieldDecorator('description', {
            initialValue: voucherPlan ? voucherPlan.description : '',
            rules: [{ required: false }],
          })(<Input.TextArea rows={4} placeholder={formatMessage(commonMessages.label.optional)} />)}
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default Form.create<VoucherPlanAdminModalProps>()(VoucherPlanAdminModal)
