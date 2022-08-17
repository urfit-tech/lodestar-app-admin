import { QuestionCircleFilled } from '@ant-design/icons'
import { Checkbox, DatePicker, Form, Input, InputNumber, Select, Tooltip } from 'antd'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { StyledTips } from '../admin'
import IndividualExamTimeLimitModal from './IndividualExamTimeLimitModal'
import programMessages from './translation'

type Examinable = 'unlimited' | 'bought' | 'limited'
type TimeLimit = 'unlimited' | 'limited'

const ExamBasicForm: React.VFC<{ examId: string; examinable: Examinable; timeLimit: TimeLimit }> = ({
  examId,
  examinable: defaultExaminable,
  timeLimit: defaultTimeLimit,
}) => {
  const { formatMessage } = useIntl()
  const [examinable, setExaminable] = useState<Examinable>(defaultExaminable)
  const [timeLimit, setTimeLimit] = useState<TimeLimit>(defaultTimeLimit)

  return (
    <>
      <Form.Item name="title" label={formatMessage(programMessages['*'].exerciseTitle)}>
        <Input />
      </Form.Item>
      <Form.Item
        label={
          <span className="d-flex align-items-center">
            {formatMessage(programMessages.ExamBasicForm.examinableTime)}
            <Tooltip
              placement="bottom"
              title={<StyledTips>{formatMessage(programMessages.ExamBasicForm.examinableTimeTip)}</StyledTips>}
            >
              <QuestionCircleFilled className="ml-2" />
            </Tooltip>
          </span>
        }
      >
        <Input.Group compact>
          <Form.Item name="examinable">
            <Select className="mr-2" style={{ width: '160px' }} onChange={v => setExaminable(v as Examinable)}>
              <Select.Option key="unlimited" value="unlimited">
                {formatMessage(programMessages.ExamBasicForm.unlimitedPeriod)}
              </Select.Option>
              <Select.Option key="bought" value="bought">
                {formatMessage(programMessages.ExamBasicForm.bought)}
              </Select.Option>
              <Select.Option key="limited" value="limited">
                {formatMessage(programMessages.ExamBasicForm.limitedPeriod)}
              </Select.Option>
            </Select>
          </Form.Item>
          {examinable === 'bought' && (
            <>
              <Form.Item name="examinableAmount">
                <InputNumber className="mr-2" style={{ width: '80px' }} min={0} />
              </Form.Item>
              <Form.Item name="examinableUnit">
                <Select style={{ width: '80px' }}>
                  <Select.Option key="day" value="day">
                    {formatMessage(programMessages.ExamBasicForm.day)}
                  </Select.Option>
                  <Select.Option key="hour" value="hour">
                    {formatMessage(programMessages.ExamBasicForm.hour)}
                  </Select.Option>
                  <Select.Option key="minute" value="minute">
                    {formatMessage(programMessages.ExamBasicForm.minute)}
                  </Select.Option>
                </Select>
              </Form.Item>
              <Form.Item className="ml-2">
                <IndividualExamTimeLimitModal examId={examId} />
              </Form.Item>
            </>
          )}
          {examinable === 'limited' && (
            <>
              <Form.Item name="expiredAt">
                <DatePicker.RangePicker style={{ width: '456px' }} format="YYYY-MM-DD" />
              </Form.Item>
              <Form.Item className="ml-2">
                <IndividualExamTimeLimitModal examId={examId} />
              </Form.Item>
            </>
          )}
        </Input.Group>
      </Form.Item>
      <Form.Item label={formatMessage(programMessages.ExamBasicForm.countDownAnswerTime)}>
        <Input.Group compact>
          <Form.Item name="timeLimit">
            <Select className="mr-2" style={{ width: '160px' }} onChange={v => setTimeLimit(v as TimeLimit)}>
              <Select.Option key="unlimited" value="unlimited">
                {formatMessage(programMessages.ExamBasicForm.unlimitedTime)}
              </Select.Option>
              <Select.Option key="limited" value="limited">
                {formatMessage(programMessages.ExamBasicForm.limitedTime)}
              </Select.Option>
            </Select>
          </Form.Item>
          {timeLimit === 'limited' && (
            <>
              <Form.Item name="timeLimitAmount">
                <InputNumber className="mr-2" style={{ width: '80px' }} min={0} />
              </Form.Item>
              <Form.Item name="timeLimitUnit">
                <Select style={{ width: '80px' }}>
                  <Select.Option key="day" value="day">
                    {formatMessage(programMessages.ExamBasicForm.day)}
                  </Select.Option>
                  <Select.Option key="hour" value="hour">
                    {formatMessage(programMessages.ExamBasicForm.hour)}
                  </Select.Option>
                  <Select.Option key="minute" value="minute">
                    {formatMessage(programMessages.ExamBasicForm.minute)}
                  </Select.Option>
                </Select>
              </Form.Item>
            </>
          )}
        </Input.Group>
      </Form.Item>

      <Input.Group compact>
        <Form.Item name="isAvailableAnnounceScore" valuePropName="checked">
          <Checkbox>{formatMessage(programMessages.ExamBasicForm.unAnnounceScore)}</Checkbox>
        </Form.Item>
        <Form.Item name="isAvailableToGoBack" valuePropName="checked">
          <Checkbox>{formatMessage(programMessages.ExamBasicForm.canGoBack)}</Checkbox>
        </Form.Item>
        <Form.Item name="isAvailableToRetry" valuePropName="checked">
          <Checkbox>{formatMessage(programMessages.ExamBasicForm.canRetry)}</Checkbox>
        </Form.Item>
      </Input.Group>
    </>
  )
}

export default ExamBasicForm
