import { QuestionCircleFilled } from '@ant-design/icons'
import { Checkbox, DatePicker, Form, Input, InputNumber, Select, Tooltip } from 'antd'
import moment from 'moment'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { ExamTimeUnit } from '../../types/program'
import { StyledTips } from '../admin'
import { BasicExam } from './ExerciseAdminModal'
import IndividualExamTimeLimitModal from './IndividualExamTimeLimitModal'
import programMessages from './translation'

type Examinable = 'unlimited' | 'bought' | 'limited'
type TimeLimit = 'unlimited' | 'limited'

const ExamBasicForm: React.VFC<{
  basicExam: BasicExam
  currentBasicExam: BasicExam
  onChange: React.Dispatch<React.SetStateAction<BasicExam>>
}> = ({ basicExam, currentBasicExam, onChange }) => {
  const { formatMessage } = useIntl()
  const [examinable, setExaminable] = useState<Examinable>(
    basicExam.examinableAmount && basicExam.examinableUnit
      ? 'bought'
      : basicExam.examinableStartedAt && basicExam.examinableEndedAt
      ? 'limited'
      : 'unlimited',
  )
  const [timeLimit, setTimeLimit] = useState<TimeLimit>(
    basicExam.timeLimitAmount && basicExam.timeLimitUnit ? 'limited' : 'unlimited',
  )

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
            <Select
              className="mr-2"
              style={{ width: '160px' }}
              defaultValue={examinable}
              onChange={v => {
                setExaminable(v as Examinable)
                if (v === 'unlimited') {
                  onChange(prevState =>
                    currentBasicExam.id
                      ? {
                          ...prevState,
                          ...currentBasicExam,
                          examinableAmount: null,
                          examinableUnit: null,
                          examinableStartedAt: null,
                          examinableEndedAt: null,
                        }
                      : {
                          ...prevState,
                          ...basicExam,
                          examinableAmount: null,
                          examinableUnit: null,
                          examinableStartedAt: null,
                          examinableEndedAt: null,
                        },
                  )
                } else if (v === 'bought') {
                  onChange(prevState =>
                    currentBasicExam.id
                      ? {
                          ...prevState,
                          ...currentBasicExam,
                          examinableAmount: currentBasicExam.examinableAmount || 7,
                          examinableUnit: currentBasicExam.examinableUnit || 'd',
                          examinableStartedAt: null,
                          examinableEndedAt: null,
                        }
                      : {
                          ...prevState,
                          ...basicExam,
                          examinableAmount: basicExam.examinableAmount || 7,
                          examinableUnit: basicExam.examinableUnit || 'd',
                          examinableStartedAt: null,
                          examinableEndedAt: null,
                        },
                  )
                } else if (v === 'limited') {
                  onChange(prevState =>
                    currentBasicExam.id
                      ? {
                          ...prevState,
                          ...currentBasicExam,
                          examinableAmount: null,
                          examinableUnit: null,
                          examinableStartedAt: currentBasicExam.examinableStartedAt || new Date(),
                          examinableEndedAt:
                            currentBasicExam.examinableEndedAt || new Date(moment().add(7, 'd').toString()),
                        }
                      : {
                          ...prevState,
                          ...basicExam,
                          examinableAmount: null,
                          examinableUnit: null,
                          examinableStartedAt: basicExam.examinableStartedAt || new Date(),
                          examinableEndedAt: basicExam.examinableEndedAt || new Date(moment().add(7, 'd').toString()),
                        },
                  )
                }
              }}
            >
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
                <InputNumber
                  className="mr-2"
                  style={{ width: '80px' }}
                  min={0}
                  defaultValue={Number(basicExam.examinableAmount) || 7}
                  onChange={v =>
                    onChange(prevState =>
                      currentBasicExam.id
                        ? {
                            ...prevState,
                            ...currentBasicExam,
                            examinableAmount: Number(v),
                          }
                        : {
                            ...prevState,
                            ...basicExam,
                            examinableAmount: Number(v),
                          },
                    )
                  }
                />
              </Form.Item>
              <Form.Item name="examinableUnit">
                <Select
                  style={{ width: '80px' }}
                  defaultValue={(basicExam.examinableUnit || 'd') as ExamTimeUnit}
                  onChange={v =>
                    onChange(prevState =>
                      currentBasicExam.id
                        ? {
                            ...prevState,
                            ...currentBasicExam,
                            examinableUnit: v.toString() as ExamTimeUnit,
                          }
                        : {
                            ...prevState,
                            ...basicExam,
                            examinableUnit: v.toString() as ExamTimeUnit,
                          },
                    )
                  }
                >
                  <Select.Option key="d" value="d">
                    {formatMessage(programMessages.ExamBasicForm.day)}
                  </Select.Option>
                  <Select.Option key="h" value="h">
                    {formatMessage(programMessages.ExamBasicForm.hour)}
                  </Select.Option>
                  <Select.Option key="m" value="m">
                    {formatMessage(programMessages.ExamBasicForm.minute)}
                  </Select.Option>
                </Select>
              </Form.Item>
              <Form.Item className="ml-2">
                <IndividualExamTimeLimitModal
                  examId={basicExam.id}
                  currentStatus={{
                    examinableAmount: currentBasicExam.examinableAmount || 7,
                    examinableUnit: currentBasicExam.examinableUnit || 'd',
                    examinableStartedAt: null,
                    examinableEndedAt: null,
                  }}
                />
              </Form.Item>
            </>
          )}
          {examinable === 'limited' && (
            <>
              <Form.Item name="expiredAt">
                <DatePicker.RangePicker
                  style={{ width: '456px' }}
                  format="YYYY-MM-DD"
                  defaultValue={[
                    basicExam.examinableStartedAt ? moment(basicExam.examinableStartedAt) : moment(),
                    basicExam.examinableEndedAt ? moment(basicExam.examinableEndedAt) : moment().add(7, 'd'),
                  ]}
                  onChange={v =>
                    onChange(prevState =>
                      currentBasicExam.id
                        ? {
                            ...prevState,
                            ...currentBasicExam,
                            examinableStartedAt: v?.[0] ? new Date(v[0].toString()) : null,
                            examinableEndedAt: v?.[1] ? new Date(v[1].toString()) : null,
                          }
                        : {
                            ...prevState,
                            ...basicExam,
                            examinableStartedAt: v?.[0] ? new Date(v[0].toString()) : null,
                            examinableEndedAt: v?.[1] ? new Date(v[1].toString()) : null,
                          },
                    )
                  }
                />
              </Form.Item>
              <Form.Item className="ml-2">
                <IndividualExamTimeLimitModal
                  examId={basicExam.id}
                  currentStatus={{
                    examinableAmount: null,
                    examinableUnit: null,
                    examinableStartedAt: currentBasicExam.examinableStartedAt,
                    examinableEndedAt: currentBasicExam.examinableEndedAt,
                  }}
                />
              </Form.Item>
            </>
          )}
        </Input.Group>
      </Form.Item>
      <Form.Item label={formatMessage(programMessages.ExamBasicForm.countDownAnswerTime)}>
        <Input.Group compact>
          <Form.Item name="timeLimit">
            <Select
              className="mr-2"
              style={{ width: '160px' }}
              defaultValue={timeLimit}
              onChange={v => {
                setTimeLimit(v as TimeLimit)
                if (v === 'unlimited') {
                  onChange(prevState =>
                    currentBasicExam.id
                      ? {
                          ...prevState,
                          ...currentBasicExam,
                          timeLimitAmount: null,
                          timeLimitUnit: null,
                        }
                      : {
                          ...prevState,
                          ...basicExam,
                          timeLimitAmount: null,
                          timeLimitUnit: null,
                        },
                  )
                } else if (v === 'limited') {
                  onChange(prevState =>
                    currentBasicExam.id
                      ? {
                          ...prevState,
                          ...basicExam,
                          timeLimitAmount: currentBasicExam.timeLimitAmount || 1,
                          timeLimitUnit: currentBasicExam.timeLimitUnit || 'h',
                        }
                      : {
                          ...prevState,
                          ...basicExam,
                          timeLimitAmount: basicExam.timeLimitAmount || 1,
                          timeLimitUnit: basicExam.timeLimitUnit || 'h',
                        },
                  )
                }
              }}
            >
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
                <InputNumber
                  className="mr-2"
                  style={{ width: '80px' }}
                  min={0}
                  defaultValue={basicExam.timeLimitAmount || 1}
                  onChange={v =>
                    onChange(prevState =>
                      currentBasicExam.id
                        ? {
                            ...prevState,
                            ...currentBasicExam,
                            timeLimitAmount: Number(v),
                          }
                        : {
                            ...prevState,
                            ...basicExam,
                            timeLimitAmount: Number(v),
                          },
                    )
                  }
                />
              </Form.Item>
              <Form.Item name="timeLimitUnit">
                <Select
                  style={{ width: '80px' }}
                  defaultValue={basicExam.timeLimitUnit || 'h'}
                  onChange={v =>
                    onChange(prevState =>
                      currentBasicExam.id
                        ? {
                            ...prevState,
                            ...currentBasicExam,
                            timeLimitUnit: v.toString() as ExamTimeUnit,
                          }
                        : {
                            ...prevState,
                            ...basicExam,
                            timeLimitUnit: v.toString() as ExamTimeUnit,
                          },
                    )
                  }
                >
                  <Select.Option key="d" value="d">
                    {formatMessage(programMessages.ExamBasicForm.day)}
                  </Select.Option>
                  <Select.Option key="h" value="h">
                    {formatMessage(programMessages.ExamBasicForm.hour)}
                  </Select.Option>
                  <Select.Option key="m" value="m">
                    {formatMessage(programMessages.ExamBasicForm.minute)}
                  </Select.Option>
                </Select>
              </Form.Item>
            </>
          )}
        </Input.Group>
      </Form.Item>

      <Input.Group compact>
        <Form.Item name="isAvailableAnnounceScore">
          <Checkbox
            defaultChecked={!basicExam.isAvailableAnnounceScore}
            onChange={v =>
              onChange(prevState =>
                currentBasicExam.id
                  ? { ...prevState, ...currentBasicExam, isAvailableAnnounceScore: !v.target.checked }
                  : { ...prevState, ...basicExam, isAvailableAnnounceScore: !v.target.checked },
              )
            }
          >
            {formatMessage(programMessages.ExamBasicForm.unAnnounceScore)}
          </Checkbox>
        </Form.Item>
        <Form.Item name="isAvailableToGoBack">
          <Checkbox
            defaultChecked={basicExam.isAvailableToGoBack}
            onChange={v =>
              onChange(prevState =>
                currentBasicExam.id
                  ? { ...prevState, ...currentBasicExam, isAvailableToGoBack: v.target.checked }
                  : { ...prevState, ...basicExam, isAvailableToGoBack: v.target.checked },
              )
            }
          >
            {formatMessage(programMessages.ExamBasicForm.canGoBack)}
          </Checkbox>
        </Form.Item>
        <Form.Item name="isAvailableToRetry">
          <Checkbox
            defaultChecked={basicExam.isAvailableToRetry}
            onChange={v => {
              onChange(prevState =>
                currentBasicExam.id
                  ? { ...prevState, ...currentBasicExam, isAvailableToRetry: v.target.checked }
                  : { ...prevState, ...basicExam, isAvailableToRetry: v.target.checked },
              )
            }}
          >
            {formatMessage(programMessages.ExamBasicForm.canRetry)}
          </Checkbox>
        </Form.Item>
      </Input.Group>
    </>
  )
}

export default ExamBasicForm
