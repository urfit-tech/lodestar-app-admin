import { Form, Radio } from 'antd'
import { useIntl } from 'react-intl'
import programMessages from '../../translation'

interface PublishProps {
  label?: string
  name: string
}

const PublishItem: React.FC<PublishProps> = ({ label, name }) => {
  const { formatMessage } = useIntl()
  const _label = label ? label : formatMessage(programMessages.ProgramPlanAdminModal.isPublished)

  return (
    <Form.Item label={_label} name={name}>
      <Radio.Group>
        <Radio value={true} className="d-block">
          {formatMessage(programMessages.ProgramPlanAdminModal.published)}
        </Radio>
        <Radio value={false} className="d-block">
          {formatMessage(programMessages.ProgramPlanAdminModal.unpublished)}
        </Radio>
      </Radio.Group>
    </Form.Item>
  )
}

export default PublishItem
