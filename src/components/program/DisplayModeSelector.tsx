import { DatePicker, Form, Select } from 'antd'
import moment from 'moment'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import programMessages from './translation'

export type DisplayMode = 'conceal' | 'trial' | 'loginToTrial' | 'payToWatch'

const DisplayModeSelector: React.VFC<{
  contentType: 'program' | 'exercise' | 'practice'
  displayMode: DisplayMode
}> = ({ contentType, displayMode }) => {
  const { formatMessage } = useIntl()
  const [currentOption, setCurrentOption] = useState<DisplayMode>(displayMode)

  return (
    <>
      <Form.Item name="displayMode" className="mb-0 mr-2">
        <Select style={{ width: '120px' }} onChange={(v: DisplayMode) => setCurrentOption(v)}>
          <Select.Option key="conceal" value="conceal">
            {formatMessage(programMessages.DisplayModeSelector.conceal)}
          </Select.Option>
          <Select.Option key="trial" value="trial">
            {formatMessage(programMessages.DisplayModeSelector.trial)}
          </Select.Option>
          {contentType === 'program' ? (
            <>
              <Select.Option key="loginToTrial" value="loginToTrial">
                {formatMessage(programMessages.DisplayModeSelector.loginToTrial)}
              </Select.Option>
              <Select.Option key="payToWatch" value="payToWatch">
                {formatMessage(programMessages.DisplayModeSelector.payToWatch)}
              </Select.Option>
            </>
          ) : null}
        </Select>
      </Form.Item>
      {currentOption === 'payToWatch' && (
        <Form.Item name="publishedAt" className="mb-0 mr-2">
          <DatePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm', defaultValue: moment('00:00', 'HH:mm') }}
          />
        </Form.Item>
      )}
    </>
  )
}

export default DisplayModeSelector
