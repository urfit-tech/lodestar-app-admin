import Icon, { MoreOutlined } from '@ant-design/icons'
import hasura from '../../hasura'
import { useApolloClient } from '@apollo/client'
import { Text, Radio, RadioGroup, Stack } from '@chakra-ui/react'
import { Button, DatePicker, Dropdown, Form, Input, InputNumber, Menu, Select } from 'antd'
import Checkbox from 'antd/lib/checkbox/Checkbox'
import { useForm } from 'antd/lib/form/Form'
import TextArea from 'antd/lib/input/TextArea'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { deleteMeeting, handleError } from '../../helpers'
import { commonMessages, errorMessages, memberMessages } from '../../helpers/translation'
import { GetOverlapMeets, useMutateMeet, useMutateMeetMember } from '../../hooks/meet'
import { useMutateMemberTask } from '../../hooks/memberTask'
import { ReactComponent as ExternalLinkIcon } from '../../images/icon/external-link-square.svg'
import { MemberTaskProps } from '../../types/member'
import { MemberTaskTag } from '../admin'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import CategorySelector from '../form/CategorySelector'
import { AllMemberSelector } from '../form/MemberSelector'

import { GetService } from '../../hooks/service'
import { uniq } from 'ramda'

const StyledLinkIconWrapper = styled.span`
  cursor: pointer;
  & path {
    fill: ${props => props.theme['@primary-color']};
  }
  color: ${props => props.theme['@primary-color']};
`
const StyledFormItemWrapper = styled.div`
  & label {
    width: 100%;
  }
`

type FieldProps = {
  title: string
  categoryId: string | null
  memberId: string | null
  executorId: string | null
  priority: MemberTaskProps['priority']
  status: MemberTaskProps['status']
  dueAt: Moment | null
  description: string | null
  hasMeeting: boolean
  meetingHours: number
  meetingGateway: 'jitsi' | 'zoom'
}

const MemberTaskAdminModal: React.FC<
  {
    memberTask?: MemberTaskProps
    initialMemberId?: string
    initialExecutorId?: string
    onRefetch?: () => void
  } & AdminModalProps
> = ({ memberTask, initialMemberId, initialExecutorId, onRefetch, onCancel, ...props }) => {
  const apolloClient = useApolloClient()
  const { currentMemberId, authToken } = useAuth()
  const { id: appId, enabledModules } = useApp()
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { insertMemberTask, updateMemberTask, deleteMemberTask } = useMutateMemberTask()
  const { insertMeet, updateMeet, deleteMeet } = useMutateMeet()
  const { insertMeetMember, deleteMeetMember } = useMutateMeetMember()
  const [loading, setLoading] = useState(false)
  const [hasMeeting, setHasMeeting] = useState(memberTask?.hasMeeting || false)
  const [invalidGateways, setInvalidGateways] = useState<string[]>([])

  const handleSubmit = (onSuccess?: () => void) => {
    setLoading(true)
    form
      .validateFields()
      .then(async () => {
        const values = form.getFieldsValue()
        if (!values.memberId) throw Error('value memberId is necessary')

        let memberTaskId = memberTask?.id
        let meetId = memberTask?.meet?.id

        const insertMemberTaskData = {
          title: values.title || '',
          category_id: values.categoryId,
          member_id: values.memberId,
          executor_id: values.executorId,
          priority: values.priority,
          status: values.status,
          due_at: values.dueAt?.toDate(),
          description: values.description || '',
          author_id: currentMemberId,
          meet_id: meetId,
          meeting_hours: values.meetingHours,
          has_meeting: values.hasMeeting,
          meeting_gateway: values.hasMeeting ? values.meetingGateway : null,
        }
        if (memberTask) {
          Object.assign(insertMemberTaskData, { id: memberTaskId })
        }
        await insertMemberTask({
          variables: {
            data: [insertMemberTaskData],
          },
        })
          .then(({ data }) => {
            memberTaskId = data?.insert_member_task?.returning[0].id
          })
          .catch(error => handleError(error))

        if (!memberTaskId) return handleError({ message: 'member task insert failed' })

        if (values.hasMeeting) {
          if (!values.dueAt) return handleError({ message: '當新增會議連結時，到期日為必填' })
          if (!values.executorId) return handleError({ message: '當新增會議連結時，指派人為必填' })
          const { data: serviceData } = await apolloClient.query<hasura.GetService, hasura.GetServiceVariables>({
            query: GetService,
            variables: {
              appId,
            },
          })
          const { data: overlapMeetsData } = await apolloClient.query<
            hasura.GetOverlapMeets,
            hasura.GetOverlapMeetsVariables
          >({
            query: GetOverlapMeets,
            variables: {
              appId,
              startedAt: values.dueAt.toDate(),
              endedAt: moment(values.dueAt).add(values.meetingHours, 'hours').toDate(),
            },
          })

          const zoomServices = serviceData.service.filter(service => service.gateway === 'zoom')
          const currentUseService = uniq(overlapMeetsData.meet.map(v => v.service_id))
          const overlapCreatorMeets = overlapMeetsData.meet.filter(
            overlapMeetData => overlapMeetData.host_member_id === memberTask?.executor?.id,
          )

          // check zoom service is enough
          if (
            zoomServices.length < 1 ||
            zoomServices.filter(zoomService => !currentUseService.includes(zoomService)).length < 1
          ) {
            return handleError('無可用的 zoom 帳號')
          }
          // check if the meeting schedules overlap
          if (overlapCreatorMeets.length >= 1) {
            return handleError('指派人員此時段不可新增代辦')
          }
        }

        try {
          if (memberTaskId) {
            // existed member task
            if (hasMeeting) {
              if (!values.dueAt) return handleError({ message: '當新增會議連結時，到期日為必填' })
              if (meetId) {
              } else {
                // createmeet?
              }
              // delete old meet member
              if (meetId) await deleteMeetMember({ variables: { meetId, memberId: values.memberId } })
              // insert new meet member
              await insertMeetMember({
                variables: {
                  meetMember: {
                    meet_id: memberTask?.meet.id,
                    member_id: values.memberId,
                  },
                },
              })
              await updateMeet({
                variables: {
                  meetId,
                  data: {
                    started_at: values.dueAt.toDate().toISOString(),
                    ended_at: moment(values.dueAt).add(values.meetingHours, 'hours').toDate().toISOString(),
                    nbf_at: moment(values.dueAt).add(-10, 'minutes').toDate().toISOString(),
                    exp_at: moment(values.dueAt).add(values.meetingHours, 'hours').toDate().toISOString(),
                    auto_recording: values.meetingGateway === 'zoom' ? true : false,
                    target: memberTaskId,
                    type: 'memberTask',
                    app_id: appId,
                    host_member_id: values.executorId,
                    gateway: values.meetingGateway ?? 'jitsi',
                  },
                },
              })
            } else {
              // remove meeting from memberTask, delete old meet member and meet
              if (meetId) {
                await deleteMeetMember({ variables: { meetId, memberId: values.memberId } })
                await deleteMeet({ variables: { meetId } })
              }
              // set member_task meet_id is null
              await updateMemberTask({ variables: { memberTaskId, data: { meet_id: null } } })
            }
          } else {
            // new member task
            if (hasMeeting) {
              if (!values.dueAt) return handleError({ message: '當新增會議連結時，到期日為必填' })
              const { data } = await insertMeet({
                variables: {
                  meet: {
                    started_at: values.dueAt.toDate().toISOString(),
                    ended_at: moment(values.dueAt).add(values.meetingHours, 'hours').toDate().toISOString(),
                    nbf_at: moment(values.dueAt).add(-10, 'minutes').toDate().toISOString(),
                    exp_at: moment(values.dueAt).add(values.meetingHours, 'hours').toDate().toISOString(),
                    auto_recording: values.meetingGateway === 'zoom' ? true : false,
                    target: memberTaskId,
                    type: 'memberTask',
                    app_id: appId,
                    host_member_id: values.executorId,
                    gateway: values.meetingGateway ?? 'jitsi',
                  },
                },
              })
              await insertMeetMember({
                variables: {
                  meetMember: {
                    meet_id: data?.insert_meet_one?.id,
                    member_id: values.memberId,
                  },
                },
              })
              await updateMemberTask({
                variables: {
                  memberTaskId,
                  data: {
                    meet_id: data?.insert_meet_one?.id,
                  },
                },
              })
            }
          }
        } catch (error) {
          handleError(error)
        }

        onRefetch?.()
        onSuccess?.()
        if (!memberTask) form.resetFields() //reset field when using createTask button
      })
      .catch(error => {
        if (error?.errorFields) {
          handleError({ message: '代辦清單資料錯誤' })
        }
      })
      .finally(() => setLoading(false))
  }

  return (
    <AdminModal
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button
            className="mr-2"
            onClick={e => {
              onCancel?.(e)
              setVisible(false)
            }}
          >
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(() => setVisible(false))}>
            {formatMessage(commonMessages.ui.confirm)}
          </Button>
          {memberTask && (
            <Dropdown
              trigger={['click']}
              overlay={
                <Menu>
                  <Menu.Item
                    className="cursor-pointer"
                    onClick={async () => {
                      setLoading(true)
                      await deleteMemberTask({ variables: { memberTaskId: memberTask.id } }).catch(handleError)
                      await deleteMeeting(memberTask.meet.id, authToken).catch(handleError)
                      onRefetch?.()
                    }}
                  >
                    {formatMessage(commonMessages.ui.delete)}
                  </Menu.Item>
                </Menu>
              }
            >
              <Button type="link" icon={<MoreOutlined />} />
            </Dropdown>
          )}
        </>
      )}
      onCancel={onCancel}
      {...props}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          title: memberTask?.title || '',
          categoryId: memberTask?.category?.id,
          memberId: memberTask?.member?.id || initialMemberId,
          executorId: memberTask?.executor?.id || initialExecutorId,
          priority: memberTask?.priority || 'high',
          status: memberTask?.status || 'pending',
          dueAt: memberTask?.dueAt ? moment(memberTask.dueAt) : null,
          hasMeeting: memberTask?.hasMeeting,
          meetingHours: memberTask?.meetingHours,
          description: memberTask?.description || '',
        }}
      >
        <Form.Item
          label={formatMessage(memberMessages.label.taskTitle)}
          name="title"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(memberMessages.label.taskTitle),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(memberMessages.label.category)} name="categoryId">
          <CategorySelector classType="task" single />
        </Form.Item>
        <div className="row">
          <StyledFormItemWrapper className="col-6">
            <Form.Item
              label={
                <span className="d-flex justify-content-between" style={{ width: 'inherit' }}>
                  {formatMessage(memberMessages.label.target)}
                  <StyledLinkIconWrapper
                    onClick={() => {
                      form.getFieldValue('memberId') &&
                        window.open(`${process.env.PUBLIC_URL}/members/${form.getFieldValue('memberId')}`, '_blank')
                    }}
                  >
                    <Icon component={() => <ExternalLinkIcon />} className="mr-1" />
                    {formatMessage(commonMessages.ui.check)}
                  </StyledLinkIconWrapper>
                </span>
              }
              name="memberId"
              rules={[
                {
                  required: true,
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(memberMessages.label.target),
                  }),
                },
              ]}
            >
              <AllMemberSelector />
            </Form.Item>
          </StyledFormItemWrapper>
          <div className="col-6">
            <Form.Item
              label={formatMessage(memberMessages.label.assign)}
              name="executorId"
              rules={[
                formInstance => ({
                  message: '若開啟會議，指派人為必填。',
                  validator(_, value) {
                    const hasMeeting = formInstance.getFieldValue('hasMeeting')
                    if (hasMeeting && !value) {
                      return Promise.reject(new Error())
                    }
                    return Promise.resolve()
                  },
                }),
              ]}
            >
              <AllMemberSelector />
            </Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-6">
            <Form.Item label={formatMessage(memberMessages.label.priority)} name="priority">
              <Select>
                <Select.Option value="high">
                  <MemberTaskTag variant="high">{formatMessage(memberMessages.status.priorityHigh)}</MemberTaskTag>
                </Select.Option>
                <Select.Option value="medium">
                  <MemberTaskTag variant="medium">{formatMessage(memberMessages.status.priorityMedium)}</MemberTaskTag>
                </Select.Option>
                <Select.Option value="low">
                  <MemberTaskTag variant="low">{formatMessage(memberMessages.status.priorityLow)}</MemberTaskTag>
                </Select.Option>
              </Select>
            </Form.Item>
          </div>
          <div className="col-6">
            <Form.Item label={formatMessage(memberMessages.label.status)} name="status">
              <Select>
                <Select.Option value="pending">
                  <MemberTaskTag variant="pending">{formatMessage(memberMessages.status.statusPending)}</MemberTaskTag>
                </Select.Option>
                <Select.Option value="in-progress">
                  <MemberTaskTag variant="in-progress">
                    {formatMessage(memberMessages.status.statusInProgress)}
                  </MemberTaskTag>
                </Select.Option>
                <Select.Option value="done">
                  <MemberTaskTag variant="done">{formatMessage(memberMessages.status.statusDone)}</MemberTaskTag>
                </Select.Option>
              </Select>
            </Form.Item>
          </div>
        </div>

        <Form.Item
          label={formatMessage(memberMessages.label.dueDate)}
          name="dueAt"
          rules={[
            formInstance => ({
              message: '若要開啟會議，到期日為必填。',
              validator(_, value) {
                const hasMeeting = formInstance.getFieldValue('hasMeeting')
                if (hasMeeting && !value) {
                  return Promise.reject(new Error())
                }
                return Promise.resolve()
              },
            }),
          ]}
        >
          <DatePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
            style={{ width: '100%' }}
            onChange={async () => {
              const values = form.getFieldsValue()
              if (hasMeeting && values.dueAt) {
                const { data: serviceData } = await apolloClient.query<hasura.GetService, hasura.GetServiceVariables>({
                  query: GetService,
                  variables: {
                    appId,
                  },
                })
                const zoomServices = serviceData.service.filter(service => service.gateway === 'zoom')
                const { data } = await apolloClient.query<hasura.GetOverlapMeets, hasura.GetOverlapMeetsVariables>({
                  query: GetOverlapMeets,
                  variables: {
                    appId,
                    startedAt: values.dueAt.toDate(),
                    endedAt: moment(values.dueAt).add(values.meetingHours, 'hours').toDate(),
                  },
                })
                const currentUseService = uniq(data.meet.map(v => v.service_id))
                if (
                  zoomServices.length >= 1 &&
                  zoomServices.filter(zoomService => !currentUseService.includes(zoomService)).length >= 1
                ) {
                  setInvalidGateways(prev => [...prev.filter(v => v === 'zoom')])
                } else {
                  setInvalidGateways(prev => [...prev, 'zoom'])
                  handleError({ message: '此時段無zoom會議可用' })
                }
              }
            }}
          />
        </Form.Item>
        <Form.Item
          label={formatMessage(memberMessages.label.meetingLink)}
          name="hasMeeting"
          valuePropName="checked"
          noStyle={hasMeeting}
        >
          <Checkbox
            style={{ display: 'flex', alignItems: 'center' }}
            onChange={e => {
              setHasMeeting(e.target.checked)
            }}
          >
            <Text color="var(--gary-dark)" size="sm">
              {formatMessage(memberMessages.label.hasMeeting)}
            </Text>
          </Checkbox>
        </Form.Item>
        {hasMeeting && enabledModules.meet_service ? (
          <Form.Item
            name="meetingGateway"
            initialValue={memberTask && memberTask?.meetingGateway ? memberTask.meetingGateway : 'jitsi'}
          >
            <RadioGroup>
              <Stack direction="row">
                <Radio value="zoom" disabled={invalidGateways.includes('zoom')}>
                  Zoom
                </Radio>
                <Radio value="jitsi">Jitsi</Radio>
              </Stack>
            </RadioGroup>
          </Form.Item>
        ) : null}
        <Form.Item
          label={formatMessage(memberMessages.label.meetingHours)}
          name="meetingHours"
          rules={[
            formInstance => ({
              message: '若要開啟會議，會議時長為必填。',
              validator(_, value) {
                const hasMeeting = formInstance.getFieldValue('hasMeeting')
                if (hasMeeting && !value) {
                  return Promise.reject(new Error())
                }
                return Promise.resolve()
              },
            }),
          ]}
        >
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item label={formatMessage(memberMessages.label.taskDescription)} name="description">
          <TextArea />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default MemberTaskAdminModal
