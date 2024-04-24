import { Form } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useIntl } from 'react-intl'
import GiftPlanInput from '../../../form/GiftPlanInput'
import formMessages from '../../../form/translation'

interface GiftProps {
  label?: string
  name: string
}

const GiftItem: React.FC<GiftProps> = ({ label, name }) => {
  const { enabledModules } = useApp()
  const { formatMessage } = useIntl()
  const { permissions } = useAuth()
  const _label = label ? label : formatMessage(formMessages.GiftPlanInput.whetherProvideGift)
  return (
    <>
      {!!enabledModules.gift && (Boolean(permissions.GIFT_PLAN_ADMIN) || Boolean(permissions.GIFT_PLAN_NORMAL)) && (
        <Form.Item label={_label} name={name} rules={[{ required: true }]}>
          <GiftPlanInput />
        </Form.Item>
      )}
    </>
  )
}

export default GiftItem
