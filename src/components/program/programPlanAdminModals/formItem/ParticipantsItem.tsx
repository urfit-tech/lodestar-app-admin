import { Form, Radio } from 'antd'
import { useIntl } from 'react-intl'
import programMessages from '../../translation'

interface ParticipantsProps {
  label?: string
  name: string
}

const ParticipantsItem: React.FC<ParticipantsProps> = ({ label, name }) => {
  const { formatMessage } = useIntl()
  const _label = label ? label : formatMessage(programMessages.ProgramPlanAdminModal.isParticipantsVisible)

  return (
    <Form.Item label={_label} name={name}>
      <Radio.Group>
        <Radio value={false} className="d-block">
          {formatMessage(programMessages.ProgramPlanAdminModal.invisible)}
        </Radio>
        <Radio value={true} className="d-block">
          {formatMessage(programMessages.ProgramPlanAdminModal.visible)}
        </Radio>
      </Radio.Group>
    </Form.Item>
  )
}

export default ParticipantsItem
