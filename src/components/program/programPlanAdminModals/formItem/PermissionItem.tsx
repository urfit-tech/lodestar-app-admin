import { Form, Radio } from 'antd'
import { useIntl } from 'react-intl'
import programMessages from '../../translation'

interface PermissionProps {
  label?: string
  name: string
}

const PermissionItem: React.FC<PermissionProps> = ({ label, name }) => {
  const { formatMessage } = useIntl()
  const _label = label ? label : formatMessage(programMessages.ProgramPlanAdminModal.permissionType)
  return (
    <Form.Item label={_label} name={name} rules={[{ required: true }]}>
      <Radio.Group>
        <Radio value={3} className="default d-block">
          {formatMessage(programMessages.ProgramPlanAdminModal.availableForAllContent)}
        </Radio>
        <Radio value={1} className="d-block">
          {formatMessage(programMessages.ProgramPlanAdminModal.availableForPastContent)}
        </Radio>
        <Radio value={2} className="d-block">
          {formatMessage(programMessages.ProgramPlanAdminModal.unavailableForPastContent)}
        </Radio>
      </Radio.Group>
    </Form.Item>
  )
}

export default PermissionItem
