import { Form, InputNumber } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../../../helpers/translation'

interface GroupBuyProps {
  label?: string
  name: string
}

const GroupBuyItem: React.FC<GroupBuyProps> = ({ label, name }) => {
  const { enabledModules } = useApp()
  const { formatMessage } = useIntl()
  const _label = label ? label : formatMessage(commonMessages.text.groupBuyingPeople)

  return (
    <>
      {enabledModules['group_buying'] && (
        <Form.Item label={_label} name={name}>
          <InputNumber min={1} />
        </Form.Item>
      )}
    </>
  )
}

export default GroupBuyItem
