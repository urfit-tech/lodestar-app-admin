import { Form } from 'antd'
import SaleInput from '../../../form/SaleInput'

interface SaleProps {
  name: string
  programPlanCurrencyId: string
}

const SaleItem: React.FC<SaleProps> = ({ name, programPlanCurrencyId }) => {
  return (
    <Form.Item
      name={name}
      rules={[{ validator: (_, value, callback) => callback(value && !value.soldAt ? '' : undefined) }]}
    >
      <SaleInput currencyId={programPlanCurrencyId} withTimer />
    </Form.Item>
  )
}

export default SaleItem
