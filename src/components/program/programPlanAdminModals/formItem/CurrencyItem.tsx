import { Form } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useIntl } from 'react-intl'
import { commonMessages, errorMessages } from '../../../../helpers/translation'
import CurrencySelector from '../../../form/CurrencySelector'

interface CurrencyProps {
  label?: string
  name: string
}

const CurrencyItem: React.FC<CurrencyProps> = ({ label, name }) => {
  const { enabledModules } = useApp()
  const { formatMessage } = useIntl()
  const _label = label ? label : formatMessage(commonMessages.label.currency)

  return (
    <>
      {enabledModules?.currency && (
        <Form.Item
          label={_label}
          name={name}
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.label.listPrice),
              }),
            },
          ]}
        >
          <CurrencySelector />
        </Form.Item>
      )}
    </>
  )
}

export default CurrencyItem
