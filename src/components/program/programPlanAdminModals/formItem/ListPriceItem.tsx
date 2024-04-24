import { Form } from 'antd'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../../../helpers/translation'
import CurrencyInput from '../../../form/CurrencyInput'

interface ListPriceProps {
  label?: string
  name: string
  programPlanCurrencyId: string
}

const ListPriceItem: React.FC<ListPriceProps> = ({ label, name, programPlanCurrencyId }) => {
  const { formatMessage } = useIntl()
  const _label = label ? label : formatMessage(commonMessages.label.listPrice)

  return (
    <Form.Item label={_label} name={name}>
      <CurrencyInput currencyId={programPlanCurrencyId} />
    </Form.Item>
  )
}

export default ListPriceItem
