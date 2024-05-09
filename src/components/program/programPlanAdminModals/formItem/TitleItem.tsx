import { Form, Input } from 'antd'
import { useIntl } from 'react-intl'
import { errorMessages } from '../../../../helpers/translation'
import programMessages from '../../translation'

interface TitleProps {
  label?: string
  name: string
}

const TitleItem: React.FC<TitleProps> = ({ label, name }) => {
  const { formatMessage } = useIntl()
  const _label = label ? label : formatMessage(programMessages.ProgramPlanAdminModal.planTitle)

  return (
    <Form.Item
      label={_label}
      name={name}
      rules={[
        {
          required: true,
          message: formatMessage(errorMessages.form.isRequired, {
            field: formatMessage(programMessages.ProgramPlanAdminModal.planTitle),
          }),
        },
      ]}
    >
      <Input />
    </Form.Item>
  )
}

export default TitleItem
