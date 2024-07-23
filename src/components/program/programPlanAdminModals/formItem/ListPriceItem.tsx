import { Form } from 'antd'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../../../helpers/translation'
import CurrencyInput from '../../../form/CurrencyInput'

export type ListPrice = {
  label?: string
  name: string
  currencyId: string
}

const ListPriceItem: React.FC<{
  label?: string
  name: string
  value?: ListPrice
  onChange?: (value: ListPrice) => void
}> = ({ label, name, value }) => {
  const { formatMessage } = useIntl()
  const _label = label ? label : formatMessage(commonMessages.label.listPrice)

  return (
    <Form.Item label={_label} name={name}>
      <CurrencyInput currencyId={value?.currencyId} />
    </Form.Item>
  )
}

export default ListPriceItem
