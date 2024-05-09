import { Checkbox, Form } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { useIntl } from 'react-intl'
import PeriodSelector from '../../../form/PeriodSelector'
import programMessages from '../../translation'

interface ProgramExpirationNoticeProps {
  label?: string
  name: string
  isChecked: boolean
  onChange: (e: CheckboxChangeEvent) => void
}

const ProgramExpirationNoticeItem: React.FC<ProgramExpirationNoticeProps> = ({ label, name, isChecked, onChange }) => {
  const { formatMessage } = useIntl()
  const _label = label ? label : formatMessage(programMessages.ProgramPlanAdminModal.programExpirationNotice)
  return (
    <div>
      <Checkbox
        checked={isChecked}
        className="mb-2"
        onChange={e => {
          onChange(e)
        }}
      >
        {_label}
      </Checkbox>
      {isChecked && (
        <Form.Item name={name}>
          <PeriodSelector />
        </Form.Item>
      )}
    </div>
  )
}

export default ProgramExpirationNoticeItem
