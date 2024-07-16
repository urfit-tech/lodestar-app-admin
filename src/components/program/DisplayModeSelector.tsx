import { Flex } from '@chakra-ui/react'
import { DatePicker, Form, Select } from 'antd'
import moment from 'moment'
import { useIntl } from 'react-intl'
import programMessages from './translation'

export type DisplayMode = 'conceal' | 'trial' | 'loginToTrial' | 'payToWatch'

const DisplayModeSelector: React.VFC<{
  contentType: string | null
  displayMode: DisplayMode
  onDisplayModeChange: (displayMode: DisplayMode) => void
}> = ({ contentType, displayMode, onDisplayModeChange }) => {
  const { formatMessage } = useIntl()

  return (
    <Flex flexWrap="wrap" gridGap="2">
      <Form.Item name="displayMode" className="mb-0">
        <Select style={{ width: '120px' }} onChange={(v: DisplayMode) => onDisplayModeChange(v)}>
          <Select.Option key="conceal" value="conceal">
            {formatMessage(programMessages.DisplayModeSelector.conceal)}
          </Select.Option>
          {contentType && ['video', 'text', 'audio', 'ebook'].includes(contentType) ? (
            <>
              <Select.Option key="trial" value="trial">
                {formatMessage(
                  contentType === 'audio'
                    ? programMessages.DisplayModeSelector.audioTrial
                    : programMessages.DisplayModeSelector.trial,
                )}
              </Select.Option>
              <Select.Option key="loginToTrial" value="loginToTrial">
                {formatMessage(
                  contentType === 'audio'
                    ? programMessages.DisplayModeSelector.loginToAudioTrial
                    : programMessages.DisplayModeSelector.loginToTrial,
                )}
              </Select.Option>
            </>
          ) : null}
          <Select.Option key="payToWatch" value="payToWatch">
            {formatMessage(
              contentType === 'audio'
                ? programMessages.DisplayModeSelector.payToListen
                : programMessages.DisplayModeSelector.payToWatch,
            )}
          </Select.Option>
        </Select>
      </Form.Item>
      {displayMode === 'payToWatch' && (
        <Form.Item name="publishedAt" className="mb-0 mr-2">
          <DatePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm', defaultValue: moment('00:00', 'HH:mm') }}
          />
        </Form.Item>
      )}
    </Flex>
  )
}

export default DisplayModeSelector
