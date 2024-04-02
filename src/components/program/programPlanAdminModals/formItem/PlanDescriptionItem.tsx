import { Form } from 'antd'
import { useIntl } from 'react-intl'
import AdminBraftEditor from '../../../form/AdminBraftEditor'
import programMessages from '../../translation'

interface PlanDescriptionProps {
  label?: string
  name: string
}

const PlanDescriptionItem: React.FC<PlanDescriptionProps> = ({ label, name }) => {
  const { formatMessage } = useIntl()
  const _label = label ? label : formatMessage(programMessages.ProgramPlanAdminModal.planDescription)

  return (
    <Form.Item label={_label} name={name}>
      <AdminBraftEditor variant="short" />
    </Form.Item>
  )
}

export default PlanDescriptionItem
