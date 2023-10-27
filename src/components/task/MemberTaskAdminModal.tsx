import Icon, { MoreOutlined } from '@ant-design/icons'
import { useApolloClient } from '@apollo/client'
import { Radio, RadioGroup, Stack, Text } from '@chakra-ui/react'
import { Button, DatePicker, Dropdown, Form, Input, InputNumber, Menu, Select } from 'antd'
import Checkbox from 'antd/lib/checkbox/Checkbox'
import { useForm } from 'antd/lib/form/Form'
import TextArea from 'antd/lib/input/TextArea'
import dayjs from 'dayjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { deleteMeeting, handleError } from '../../helpers'
import { commonMessages, errorMessages, memberMessages } from '../../helpers/translation'
import { GetMeetById, GetOverlapMeets, useMutateMeet, useMutateMeetMember } from '../../hooks/meet'
import { useMutateMemberTask } from '../../hooks/memberTask'
import { GetService } from '../../hooks/service'
import { ReactComponent as ExternalLinkIcon } from '../../images/icon/external-link-square.svg'
import { Meet } from '../../types/meet'
import { MemberTaskProps } from '../../types/member'
import { Service } from '../../types/service'
import { MemberTaskTag } from '../admin'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import CategorySelector from '../form/CategorySelector'
import { AllMemberSelector } from '../form/MemberSelector'

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
const MeetingButton = styled(Button)`
  width: 100%;
  border-radius: 4px;
  justify-content: center;
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
    meetingButtonOnClick?: () => void
    onRefetch?: () => void
    afterClose?: () => void
  } & AdminModalProps
> = ({ memberTask, initialMemberId, initialExecutorId, onRefetch, onCancel, afterClose, ...props }) => {
  const theme = useAppTheme()
  const apolloClient = useApolloClient()
  const { authToken, currentMemberId } = useAuth()
  const { id: appId, enabledModules } = useApp()
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { insertMemberTask, updateMemberTask, deleteMemberTask } = useMutateMemberTask()
  const { insertMeet, deleteMeet } = useMutateMeet()
  const { insertMeetMember, deleteMeetMember } = useMutateMeetMember()
  const [loading, setLoading] = useState(false)
  const [hasMeeting, setHasMeeting] = useState(!!memberTask?.meetingGateway || memberTask?.hasMeeting || false)
  const [invalidGateways, setInvalidGateways] = useState<string[]>([])

  const handleSubmit = (onSuccess?: () => void) => {
    form
      .validateFields()
      .then(async () => {
        setLoading(true)
        const values = form.getFieldsValue()
        if (!values.memberId) return handleError({ message: 'value memberId is necessary' })
        let memberTaskId = memberTask?.id
        let meetId = memberTask?.meet?.id || null
        let existedMeet = null
        let services: Service[] = []
        let overlapMeets: Pick<Meet, 'id' | 'target' | 'hostMemberId' | 'serviceId' | 'meetMembers'>[] = []
        let toBeUsedServiceId: string | null = null
        let updatedMeetId = memberTask?.meet?.id || null

        if (hasMeeting) {
          if (!values.dueAt) return handleError({ message: '當新增會議連結時，到期日為必填' })
          if (!values.executorId) return handleError({ message: '當新增會議連結時，指派人為必填' })
          if (meetId) {
            const meetData = await apolloClient.query<hasura.GetMeetById, hasura.GetMeetByIdVariables>({
              query: GetMeetById,
              variables: { meetId },
            })
            existedMeet = meetData.data.meet_by_pk
              ? { id: meetData.data.meet_by_pk.id, type: meetData.data.meet_by_pk.type }
              : null
            if (existedMeet && memberTask?.meetingGateway !== (values.meetingGateway ?? 'jitsi')) {
              return alert('已有建立的會議室, 不能更換預設會議系統')
            }
          }
          const overlapMeetsData = await apolloClient.query<hasura.GetOverlapMeets, hasura.GetOverlapMeetsVariables>({
            query: GetOverlapMeets,
            variables: {
              appId: appId,
              startedAt: values.dueAt.toDate().toISOString(),
              endedAt: dayjs(values.dueAt.toDate()).add(values.meetingHours, 'hour').toDate().toISOString(),
            },
          })
          overlapMeets =
            overlapMeetsData.data?.meet.map(v => ({
              id: v.id,
              target: v.target,
              hostMemberId: v.host_member_id,
              serviceId: v.service_id,
              meetMembers: v.meet_members.map(w => ({
                id: w.id,
                memberId: w.member_id,
              })),
            })) || []

          if (
            hasMeeting &&
            (!memberTask ||
              values.memberId !== memberTask?.member.id ||
              values.executorId !== memberTask.executor?.id ||
              values.dueAt.toDate().getTime() !== memberTask.dueAt?.getTime() ||
              (values.dueAt.toDate().getTime() === memberTask.dueAt?.getTime() &&
                values.meetingHours !== memberTask.meetingHours))
          ) {
            if (enabledModules.meet_service && values.meetingGateway === 'zoom') {
              const serviceData = await apolloClient.query<hasura.GetService, hasura.GetServiceVariables>({
                query: GetService,
                variables: { appId },
              })
              services =
                serviceData.data?.service.map(v => ({
                  id: v.id,
                  gateway: v.gateway,
                })) || []

              if (services.filter(service => service.gateway === 'zoom').length < 1) {
                return handleError({ message: '無zoom帳號' })
              }
              const zoomServiceIds = services.filter(service => service.gateway === 'zoom').map(service => service.id)
              const periodServiceIds = overlapMeets.map(periodService => periodService.serviceId)

              if (zoomServiceIds.filter(zoomServiceId => !periodServiceIds.includes(zoomServiceId)).length === 0) {
                return handleError({ message: '此時段無可用zoom帳號' })
              }
              toBeUsedServiceId = zoomServiceIds.filter(zoomServiceId => periodServiceIds.includes(zoomServiceId))[0]
            }

            console.log(overlapMeets)
            console.log(values.executorId)
            if (overlapMeets.filter(overlapMeet => overlapMeet.hostMemberId === values.executorId).length >= 1) {
              return handleError({ message: '此時段不可指派此執行人員' })
            }

            if (
              overlapMeets.filter(
                overlapMeet =>
                  values.memberId && overlapMeet.meetMembers.map(v => v.memberId).includes(values.memberId),
              ).length >= 1
            ) {
              return handleError({ message: '此時段不可指派此學員' })
            }
          }
        }

        if (memberTask) {
          if (
            (meetId && !hasMeeting) ||
            (meetId &&
              hasMeeting &&
              (dayjs(memberTask.dueAt).toDate().getTime() !== dayjs(values.dueAt?.toDate()).toDate().getTime() ||
                memberTask.executor?.id !== values.executorId ||
                memberTask.member.id !== values.memberId))
          ) {
            await deleteMeetMember({ variables: { meetId, memberId: memberTask.member.id } }).catch(error =>
              handleError({ message: `delete meet member failed. error:${error}` }),
            )
            await deleteMeet({ variables: { meetId } }).catch(error =>
              handleError({ message: `delete meet failed. error:${error}` }),
            )
            if (memberTask.meetingGateway === 'zoom') {
              await deleteMeeting(memberTask.meet.id, authToken).catch(handleError) // delete zoom meeting
            }
          }
        }

        await insertMemberTask({
          variables: {
            data: {
              id: memberTaskId,
              title: values.title,
              category_id: values.categoryId,
              member_id: values.memberId,
              author_id: currentMemberId,
              executor_id: values.executorId,
              priority: values.priority,
              status: values.status,
              due_at: values.dueAt?.toDate(),
              description: values.description,
              has_meeting: values.hasMeeting,
              meet_id: null,
              meeting_hours: hasMeeting ? values.meetingHours : 0,
              meeting_gateway: hasMeeting ? values.meetingGateway ?? 'jitsi' : null,
            },
          },
        }).then(async ({ data }) => {
          if (hasMeeting) {
            await insertMeet({
              variables: {
                meet: {
                  started_at: values.dueAt?.toDate().toISOString(),
                  ended_at: dayjs(values.dueAt?.toDate()).add(values.meetingHours, 'hours').toISOString(),
                  nbf_at: dayjs(values.dueAt?.toDate()).subtract(10, 'minutes').toISOString(),
                  exp_at: dayjs(values.dueAt?.toDate()).add(values.meetingHours, 'hours').toISOString(),
                  auto_recording: values.meetingGateway === 'zoom',
                  target: memberTaskId ?? data?.insert_member_task_one?.id,
                  type: 'memberTask',
                  app_id: appId,
                  host_member_id: values.executorId,
                  gateway: values.meetingGateway ?? 'jitsi',
                  service_id: values.meetingGateway === 'zoom' ? toBeUsedServiceId : null,
                  options: {},
                },
              },
            })
              .then(async ({ data }) => {
                updatedMeetId = data?.insert_meet_one?.id
                await insertMeetMember({
                  variables: {
                    meetMember: {
                      meet_id: data?.insert_meet_one?.id,
                      member_id: values.memberId,
                    },
                  },
                }).catch(error => handleError({ message: `insert meet member failed. error:${error}` }))
              })
              .catch(error => handleError({ message: `insert meet failed. error:${error}` }))

            if (!data?.insert_member_task_one?.id) return handleError({ message: 'can not get member task id' })

            await updateMemberTask({
              variables: {
                memberTaskId: data?.insert_member_task_one?.id,
                data: { meet_id: updatedMeetId },
              },
            }).catch(error => handleError({ message: `update member task meetId failed. error:${error}` }))
          }
        })

        onRefetch?.()
        onSuccess?.()
        if (!memberTask) {
          form.resetFields() //reset field when using createTask button
          setInvalidGateways([])
          setHasMeeting(false)
        }
      })
      .catch(error => {
        if (error?.errorFields) {
          const errorMessages = error.errorFields.map((v: { errors: any[] }) => v.errors.toString()).join(' ,')
          handleError({ message: errorMessages })
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
              setInvalidGateways([])
              setHasMeeting(false)
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
                      await deleteMeeting(memberTask.meet.id, authToken).catch(handleError) // delete zoom meeting
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
      afterClose={afterClose}
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
          meetingGateway: memberTask?.meetingGateway || 'jitsi',
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

        <Form.Item label={formatMessage(memberMessages.label.dueDate)} name="dueAt">
          <DatePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
            style={{ width: '100%' }}
            onChange={async () => {
              const values = form.getFieldsValue()
              if (hasMeeting && values.dueAt && enabledModules.meet_service) {
                const { data: serviceData } = await apolloClient.query<hasura.GetService, hasura.GetServiceVariables>({
                  query: GetService,
                  variables: {
                    appId,
                  },
                })
                const zoomServices = serviceData.service.filter(service => service.gateway === 'zoom')
                const { data: overLapMeetsData } = await apolloClient.query<
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
                if (zoomServices.length < 1) {
                  setInvalidGateways(prev => [...prev.filter(v => v !== 'zoom'), 'zoom'])
                  return handleError({ message: '無zoom帳號' })
                }
                const zoomServiceIds = zoomServices.map(zoomService => zoomService.id)
                const periodServiceIds = overLapMeetsData.meet.map(v => v.service_id)
                if (zoomServiceIds.filter(zoomServiceId => !periodServiceIds.includes(zoomServiceId)).length === 0) {
                  setInvalidGateways(prev => [...prev.filter(v => v !== 'zoom'), 'zoom'])
                  return handleError({ message: '此時段無可用zoom帳號' })
                } else {
                  setInvalidGateways(prev => [...prev.filter(v => v !== 'zoom')])
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
          <Form.Item name="meetingGateway">
            <RadioGroup>
              <Stack direction="row">
                <Radio
                  value="zoom"
                  disabled={invalidGateways.includes('zoom')}
                  _checked={{
                    background: `${theme.colors.primary[500]}`,
                    borderColor: `${theme.colors.primary[500]}`,
                  }}
                >
                  Zoom
                </Radio>
                <Radio
                  value="jitsi"
                  _checked={{
                    background: `${theme.colors.primary[500]}`,
                    borderColor: `${theme.colors.primary[500]}`,
                  }}
                >
                  Jitsi
                </Radio>
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
