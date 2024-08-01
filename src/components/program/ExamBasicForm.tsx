import { QuestionCircleFilled } from '@ant-design/icons'
import { Checkbox, DatePicker, Form, Input, InputNumber, Select, Tooltip } from 'antd'
import moment from 'moment'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { ExamTimeUnit } from '../../types/program'
import { StyledTips } from '../admin'
import { BasicExam } from './ExerciseAdminModalBlock'
import IndividualExamTimeLimitModal from './IndividualExamTimeLimitModal'
import ProgramPlanSelector from './ProgramPlanSelector'
import programMessages from './translation'

type Examinable = 'unlimited' | 'bought' | 'limited'
type TimeLimit = 'unlimited' | 'limited'

const ExamBasicForm: React.VFC<{
  programId: string
  basicExam: BasicExam
  currentBasicExam: BasicExam
  onChange: React.Dispatch<React.SetStateAction<BasicExam>>
}> = ({ programId, basicExam, currentBasicExam, onChange }) => {
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

  // reset when cancel
  useEffect(() => {
    ;(typeof currentBasicExam.id === 'undefined' || currentBasicExam.id === null) &&
      setExaminable(
        basicExam.examinableAmount && basicExam.examinableUnit
          ? 'bought'
          : basicExam.examinableStartedAt && basicExam.examinableEndedAt
          ? 'limited'
          : 'unlimited',
      )
  }, [
    basicExam.examinableAmount,
    basicExam.examinableEndedAt,
    basicExam.examinableStartedAt,
    basicExam.examinableUnit,
    currentBasicExam.id,
  ])
  // reset when cancel
  useEffect(() => {
    ;(typeof currentBasicExam.id === 'undefined' || currentBasicExam.id === null) &&
      setTimeLimit(basicExam.timeLimitAmount && basicExam.timeLimitUnit ? 'limited' : 'unlimited')
  }, [basicExam.timeLimitAmount, basicExam.timeLimitUnit, currentBasicExam.id])

  return (
    <>
      <Form.Item name="title" label={formatMessage(programMessages['*'].exerciseTitle)}>
        <Input />
      </Form.Item>
      <Form.Item label={formatMessage(programMessages['*'].contentPlan)} name="planIds">
        <ProgramPlanSelector programId={programId} placeholder={formatMessage(programMessages['*'].contentPlan)} />
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
          {/* examinable */}
          <Form.Item>
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
              {/* examinableAmount */}
              <Form.Item>
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
              {/* examinableUnit */}
              <Form.Item>
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
                {basicExam?.id ? (
                  <IndividualExamTimeLimitModal
                    examId={basicExam.id}
                    currentStatus={{
                      examinableAmount: currentBasicExam.id
                        ? currentBasicExam.examinableAmount
                        : basicExam.examinableAmount,
                      examinableUnit: currentBasicExam.id ? currentBasicExam.examinableUnit : basicExam.examinableUnit,
                      examinableStartedAt: null,
                      examinableEndedAt: null,
                    }}
                  />
                ) : null}
              </Form.Item>
            </>
          )}
          {examinable === 'limited' && (
            <>
              {/* expiredAt */}
              <Form.Item>
                <DatePicker.RangePicker
                  style={{ width: '456px' }}
                  format="YYYY-MM-DD HH:mm:ss"
                  showTime={{
                    format: 'HH:mm:ss',
                    defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')],
                  }}
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
                {basicExam?.id ? (
                  <IndividualExamTimeLimitModal
                    examId={basicExam.id}
                    currentStatus={{
                      examinableAmount: null,
                      examinableUnit: null,
                      examinableStartedAt: currentBasicExam.id
                        ? currentBasicExam.examinableStartedAt
                        : basicExam.examinableStartedAt,
                      examinableEndedAt: currentBasicExam.id
                        ? currentBasicExam.examinableEndedAt
                        : basicExam.examinableEndedAt,
                    }}
                  />
                ) : null}
              </Form.Item>
            </>
          )}
        </Input.Group>
      </Form.Item>
      <Form.Item label={formatMessage(programMessages.ExamBasicForm.countDownAnswerTime)}>
        <Input.Group compact>
          {/* timeLimit */}
          <Form.Item>
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
                          ...currentBasicExam,
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
              {/* timeLimitAmount */}
              <Form.Item>
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
              {/* timeLimitUnit */}
              <Form.Item>
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
        {/* isAvailableAnnounceScore */}
        <Form.Item>
          <Checkbox
            checked={
              currentBasicExam.id ? !currentBasicExam.isAvailableAnnounceScore : !basicExam.isAvailableAnnounceScore
            }
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
        {/* isAvailableToGoBack */}
        <Form.Item>
          <Checkbox
            checked={currentBasicExam.id ? currentBasicExam.isAvailableToGoBack : basicExam.isAvailableToGoBack}
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
        {/* isAvailableToRetry */}
        <Form.Item>
          <Checkbox
            checked={currentBasicExam.id ? currentBasicExam.isAvailableToRetry : basicExam.isAvailableToRetry}
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
