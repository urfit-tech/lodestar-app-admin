import { Button, DatePicker, Form, Input, InputNumber } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import ProductSelector from '../../components/form/ProductSelector'
import { commonMessages, errorMessages, promotionMessages } from '../../helpers/translation'
import { VoucherPlanProps } from '../../types/checkout'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import PlanCodeSelector, { PlanCodeProps } from '../checkout/PlanCodeSelector'

const messages = defineMessages({
  exchangeItemsAmount: { id: 'promotion.label.exchangeItemsAmount', defaultMessage: '兌換項目數量' },
  exchangeItems: { id: 'promotion.label.exchangeItems', defaultMessage: '兌換項目' },
})

export type VoucherPlanFields = {
  title: string
  voucherCodes?: PlanCodeProps[]
  voucherPlanProducts: string[]
  productQuantityLimit: number
  startedAt?: Date
  endedAt?: Date
  description: string
}

const VoucherPlanAdminModal: React.FC<
  AdminModalProps & {
    voucherPlan?: VoucherPlanProps
    onSubmit?: (
      setVisible: React.Dispatch<React.SetStateAction<boolean>>,
      setLoading: React.Dispatch<React.SetStateAction<boolean>>,
      values: VoucherPlanFields,
    ) => void
  }
> = ({ voucherPlan, onSubmit, ...props }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<VoucherPlanFields>()
  const [loading, setLoading] = useState(false)

  const handleClick = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form
      .validateFields()
      .then(() => {
        const values = form.getFieldsValue()
        if (onSubmit) {
          onSubmit(setVisible, setLoading, values)
        }
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      destroyOnClose
      footer={null}
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
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          title: voucherPlan?.title,
          voucherPlanProducts: voucherPlan?.productIds || [],
          productQuantityLimit: voucherPlan?.productQuantityLimit || 1,
          startedAt: voucherPlan?.startedAt ? moment(voucherPlan.startedAt) : null,
          endedAt: voucherPlan?.endedAt ? moment(voucherPlan.endedAt) : null,
          description: voucherPlan?.description,
        }}
      >
        <Form.Item
          label={formatMessage(promotionMessages.label.voucherPlanTitle)}
          name="title"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(promotionMessages.label.voucherPlanTitle),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>

        {!voucherPlan && (
          <Form.Item
            label={formatMessage(promotionMessages.label.voucherCodes)}
            name="voucherCodes"
            rules={[{ required: true, message: formatMessage(errorMessages.form.voucherCodes) }]}
          >
            <PlanCodeSelector planType="voucher" />
          </Form.Item>
        )}

        <Form.Item
          label={formatMessage(messages.exchangeItems)}
          name="voucherPlanProducts"
          rules={[{ required: true, message: formatMessage(errorMessages.form.exchangeItems) }]}
        >
          <ProductSelector allowTypes={['Program', 'ProgramPackagePlan', 'ActivityTicket', 'PodcastProgram', 'Card']} />
        </Form.Item>

        <Form.Item
          label={formatMessage(messages.exchangeItemsAmount)}
          name="productQuantityLimit"
          rules={[{ required: true, message: formatMessage(errorMessages.form.exchangeItemsAmount) }]}
        >
          <InputNumber min={1} />
        </Form.Item>

        <Form.Item label={formatMessage(promotionMessages.label.availableDateRange)}>
          <Form.Item className="d-inline-block m-0" name="startedAt">
            <DatePicker
              format="YYYY-MM-DD HH:mm"
              showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
              placeholder={formatMessage(commonMessages.label.startedAt)}
            />
          </Form.Item>
          <span className="d-inline-block px-2">-</span>
          <Form.Item className="d-inline-block m-0" name="endedAt">
            <DatePicker
              format="YYYY-MM-DD HH:mm"
              showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }}
              placeholder={formatMessage(commonMessages.label.endedAt)}
            />
          </Form.Item>
        </Form.Item>
        <Form.Item label={formatMessage(promotionMessages.label.description)} name="description">
          <Input.TextArea rows={4} placeholder={formatMessage(commonMessages.label.optional)} />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default VoucherPlanAdminModal
