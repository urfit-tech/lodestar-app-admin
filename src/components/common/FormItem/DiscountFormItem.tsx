import { Form } from 'antd'
import { useIntl } from 'react-intl'
import CouponPlanDiscountSelector from '../../coupon/CouponPlanDiscountSelector'
import couponMessages from '../../coupon/translation'

const DiscountFormItem: React.FC<{ displayMode?: string }> = ({ displayMode }) => {
  const { formatMessage } = useIntl()
  return (
    <Form.Item
      label={formatMessage(couponMessages['*'].discount)}
      help={formatMessage(couponMessages.CouponPlanAdminModal.discountHelp)}
      name="discount"
      className="mb-3"
    >
      <CouponPlanDiscountSelector displayMode={displayMode} />
    </Form.Item>
  )
}

export default DiscountFormItem
