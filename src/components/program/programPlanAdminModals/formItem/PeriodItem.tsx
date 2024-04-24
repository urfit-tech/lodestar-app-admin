import { Form } from 'antd'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../../../helpers/translation'
import PeriodSelector from '../../../form/PeriodSelector'

interface PermissionProps {
  label?: string
  name: string
}

const PermissionItem: React.FC<PermissionProps> = ({ label, name }) => {
  const { formatMessage } = useIntl()
  const _label = label ? label : formatMessage(commonMessages.label.period)
  return (
    <Form.Item label={_label} name={name}>
      <PeriodSelector />
    </Form.Item>
  )
}

export default PermissionItem
