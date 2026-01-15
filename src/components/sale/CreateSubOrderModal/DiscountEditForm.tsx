import { Button, Form, Input, InputNumber, Select, Typography } from 'antd'
import React, { useState, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { useCouponPlanCollection, useVoucherPlanCollection } from '../../../hooks/checkout'
import { commonMessages } from '../../../helpers/translation'
import saleMessages from '../translation'
import DiscountTargetSelector from './DiscountTargetSelector'
import { EditableOrderDiscount } from './types'

const DiscountEditForm: React.VFC<{
  discount: EditableOrderDiscount
  form: ReturnType<typeof Form.useForm>[0]
  onSave: () => void
  onCancel: () => void
}> = ({ discount, form, onSave, onCancel }) => {
  const { formatMessage } = useIntl()
  const [discountType, setDiscountType] = useState<string>(discount.type || 'Coupon')
  const { couponPlans } = useCouponPlanCollection()
  const { voucherPlans } = useVoucherPlanCollection({})

  useEffect(() => {
    form.setFieldsValue({
      name: discount.name,
      price: discount.price,
      type: discount.type,
      target: discount.target,
    })
    setDiscountType(discount.type || 'Coupon')
  }, [discount, form])

  const handleDiscountTypeChange = (type: string) => {
    setDiscountType(type)
    form.setFieldsValue({ type, target: undefined })
  }

  return (
    <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid #d9d9d9', borderRadius: '4px', backgroundColor: '#fafafa' }}>
      <Typography.Text strong style={{ display: 'block', marginBottom: '16px' }}>
        {formatMessage(saleMessages.SaleCollectionExpandRow.editOrderDiscount)}
      </Typography.Text>
      <Form form={form} layout="vertical">
        <Form.Item
          label={formatMessage(saleMessages.SaleCollectionExpandRow.discountName)}
          name="name"
          rules={[{ required: true, message: '請輸入折扣名稱' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={formatMessage(saleMessages.SaleCollectionExpandRow.discountPrice)}
          name="price"
          rules={[{ required: true, message: '請輸入折扣金額' }]}
        >
          <InputNumber min={0} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label={formatMessage(saleMessages.SaleCollectionExpandRow.discountType)} name="type">
          <Select onChange={handleDiscountTypeChange}>
            <Select.Option value="Coupon">優惠券</Select.Option>
            <Select.Option value="Voucher">兌換券</Select.Option>
            <Select.Option value="Coin">代幣</Select.Option>
            <Select.Option value="DownPrice">降價</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="折扣目標 ID"
          name="target"
          tooltip="根據折扣類型選擇對應的折扣目標"
        >
          <DiscountTargetSelector
            discountType={discountType}
            onTargetChange={(targetId) => {
              const currentName = form.getFieldValue('name')
              if (targetId && !currentName) {
                let targetTitle: string | undefined

                if (discountType === 'Coupon') {
                  const couponPlan = couponPlans.find(plan => plan.id === targetId)
                  targetTitle = couponPlan?.title
                } else if (discountType === 'Voucher') {
                  const voucherPlan = voucherPlans.find(plan => plan.id === targetId)
                  targetTitle = voucherPlan?.title
                }

                if (targetTitle) {
                  form.setFieldsValue({ name: targetTitle })
                }
              }
            }}
          />
        </Form.Item>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button onClick={onCancel}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" onClick={onSave}>
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
        </div>
      </Form>
    </div>
  )
}

export default DiscountEditForm
