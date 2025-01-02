import { Form } from 'antd'
import StyledBraftEditor from 'lodestar-app-element/src/components/common/StyledBraftEditor'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useIntl } from 'react-intl'
import { createUploadFn } from '../../../form/AdminBraftEditor'
import programMessages from '../../translation'

interface PlanDescriptionProps {
  label?: string
  name: string
}

const PriceDescriptionItem: React.FC<PlanDescriptionProps> = ({ label, name }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { authToken } = useAuth()
  const _label = label ? label : formatMessage(programMessages.PriceDescriptionItem.priceDescription)

  return (
    <Form.Item label={_label} name={name}>
      <StyledBraftEditor
        controls={['bold', 'italic', 'underline', 'strike-through', 'remove-styles', 'separator', 'media']}
        media={{
          uploadFn: createUploadFn(appId, authToken),
          accepts: { video: false, audio: false },
          externals: { image: true, video: false, audio: false, embed: true },
        }}
      />
    </Form.Item>
  )
}

export default PriceDescriptionItem
