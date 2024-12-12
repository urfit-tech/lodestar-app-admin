import { Form } from 'antd'
import StyledBraftEditor from 'lodestar-app-element/src/components/common/StyledBraftEditor'
import { useIntl } from 'react-intl'
import programMessages from '../../translation'

interface PlanDescriptionProps {
  label?: string
  name: string
}

const PriceDescriptionItem: React.FC<PlanDescriptionProps> = ({ label, name }) => {
  const { formatMessage } = useIntl()
  const _label = label ? label : formatMessage(programMessages.PriceDescriptionItem.priceDescription)

  return (
    <Form.Item label={_label} name={name}>
      <StyledBraftEditor
        controls={['bold', 'italic', 'underline', 'strike-through', 'remove-styles', 'separator', 'media']}
      />
    </Form.Item>
  )
}

export default PriceDescriptionItem
