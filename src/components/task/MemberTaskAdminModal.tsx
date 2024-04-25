import Icon, { MoreOutlined } from '@ant-design/icons'
import { useApolloClient } from '@apollo/client'
import { Stack, Text } from '@chakra-ui/react'
import { Button, DatePicker, Dropdown, Form, Input, InputNumber, Menu, Radio, Select } from 'antd'
import Checkbox from 'antd/lib/checkbox/Checkbox'
import { useForm } from 'antd/lib/form/Form'
import TextArea from 'antd/lib/input/TextArea'
import dayjs from 'dayjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment, { Moment } from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { deleteZoomMeet, handleError } from '../../helpers'
import { commonMessages, errorMessages, memberMessages } from '../../helpers/translation'
import { GetOverlapMeets, useMutateMeet, useMutateMeetMember } from '../../hooks/meet'
import { useMutateMemberTask } from '../../hooks/memberTask'
import { GetService } from '../../hooks/service'
import { ReactComponent as ExternalLinkIcon } from '../../images/icon/external-link-square.svg'
import { Meet } from '../../types/meet'
import { MemberTaskProps } from '../../types/member'
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

type FieldProps = {
  title: string
  categoryId: string | null
  memberId: string | null
  executorId: string | null
  priority: MemberTaskProps['priority']
  status: MemberTaskProps['status']
  dueAt: Moment | null
  createdAt: Moment | null
  description: string | null
  hasMeeting: boolean
  meetingHours: number
  meetingGateway: 'jitsi' | 'zoom'
  isPrivate: boolean
}

type OverlapMeets = Pick<Meet, 'id' | 'target' | 'hostMemberId' | 'serviceId' | 'meetMembers'>[]

const toMillisecond = (date: Date | null | undefined) => date && dayjs(date).toDate().getTime()
const toFormat = (date: moment.Moment | null) => date?.format('YYYY-MM-DDTHH:mm:00Z')

const MemberTaskAdminModal: React.FC<
  {
    memberTask?: MemberTaskProps
    initialMemberId?: string
    initialExecutorId?: string
    onRefetch?: () => void
    afterClose?: () => void
  } & AdminModalProps
> = ({ memberTask, initialMemberId, initialExecutorId, onRefetch, onCancel, afterClose, ...props }) => {
  const apolloClient = useApolloClient()
  const { authToken, currentMemberId, permissions } = useAuth()
  const { id: appId, enabledModules } = useApp()
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { insertMemberTask, updateMemberTask, deleteMemberTask } = useMutateMemberTask()
  const { insertMeet, deleteGeneralMeet } = useMutateMeet()
  const { insertMeetMember, deleteMeetMember } = useMutateMeetMember()
  const [loading, setLoading] = useState(false)
  const [meetingGateway, setMeetingGateWay] = useState<'zoom' | 'jitsi'>()
  const [hasMeeting, setHasMeeting] = useState(!!memberTask?.meetingGateway || memberTask?.hasMeeting || false)
  const [invalidGateways, setInvalidGateways] = useState<string[]>([])

  const getOverlapMeets = async ({ startedAt, endedAt }: { startedAt: string; endedAt: string }) => {
    let overlapMeets: OverlapMeets = []
    const { data: overlapMeetsData } = await apolloClient.query<
      hasura.GetOverlapMeets,
      hasura.GetOverlapMeetsVariables
    >({
      query: GetOverlapMeets,
      variables: {
        appId,
        startedAt,
        endedAt,
      },
      fetchPolicy: 'network-only',
    })
    overlapMeets =
      overlapMeetsData?.meet.map(v => ({
        id: v.id,
        target: v.target,
        hostMemberId: v.host_member_id,
        serviceId: v.service_id,
        meetMembers: v.meet_members.map(meetMember => ({
          id: meetMember.id,
          memberId: meetMember.member_id,
        })),
        meetingGateway: v.gateway,
      })) || []

    return {
      overlapMeets,
    }
  }

  const zoomServiceCheck = async ({ overlapMeets }: { overlapMeets: OverlapMeets }) => {
    const { data: serviceData } = await apolloClient.query<hasura.GetService, hasura.GetServiceVariables>({
      query: GetService,
      variables: {
        appId,
      },
    })
    const zoomServices = serviceData.service.filter(service => service.gateway === 'zoom')

    if (zoomServices.length === 0) {
      setInvalidGateways(prev => [...prev.filter(v => v !== 'zoom'), 'zoom'])
      return handleError({ message: '無zoom帳號' })
    }
    const zoomServiceIds = zoomServices.map(service => service.id)
    const periodUsedServiceId = overlapMeets.map(meet => meet.serviceId)
    const availableZoomServiceId = zoomServiceIds.find(serviceId => !periodUsedServiceId.includes(serviceId))
    if (!availableZoomServiceId) {
      setInvalidGateways(prev => [...prev.filter(v => v !== 'zoom'), 'zoom'])
      return handleError({ message: '此時段無可用zoom帳號' })
    } else {
      setInvalidGateways(prev => [...prev.filter(v => v !== 'zoom')])
    }
    return availableZoomServiceId
  }

  const deleteMeet = async ({
    memberTaskMeetId,
    memberTaskMemberId,
    memberTaskMeetingGateway,
  }: {
    memberTaskMeetId: string
    memberTaskMemberId: string
    memberTaskMeetingGateway: string
  }) => {
    await deleteMeetMember({ variables: { meetId: memberTaskMeetId, memberId: memberTaskMemberId } }).catch(error =>
      handleError({ message: `delete meet member failed. error:${error}` }),
    )
    // The general meet is no need service id meet. e.g. jitsi
    await deleteGeneralMeet({ variables: { meetId: memberTaskMeetId } }).catch(error =>
      handleError({ message: `delete meet failed. error:${error}` }),
    )
    if (memberTaskMeetingGateway === 'zoom') {
      await deleteZoomMeet(memberTaskMeetId, authToken).catch(handleError)
    }
  }

  const handleSubmit = (onSuccess?: () => void) => {
    setLoading(true)
    form
      .validateFields()
      .then(async () => {
        const formValues = form.getFieldsValue()
        const {
          memberId: formMemberId,
          dueAt: formDueAt,
          executorId: formExecutorId,
          meetingHours: formMeetingHours,
          meetingGateway: formMeetingGateway,
          title: formTitle,
          priority: formPriority,
          categoryId: formCategoryId,
          status: formStatus,
          description: formDescription,
          hasMeeting: formHasMeeting,
          createdAt: formCreatedAt,
          isPrivate: formIsPrivate,
        } = formValues

        if (!formMemberId) return handleError({ message: 'value memberId is necessary' })
        const memberTaskId = memberTask?.id
        const memberTaskMeetId = memberTask?.meet?.id || null
        let toBeUsedServiceId: string | null = null
        let updatedMeetId = memberTask?.meet?.id || null

        if (hasMeeting) {
          if (!formDueAt)
            return handleError({
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(memberMessages.label.executeDate),
              }),
            })
          if (!formExecutorId)
            return handleError({
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(memberMessages.label.assign),
              }),
            })

          const { overlapMeets } = await getOverlapMeets({
            startedAt: formDueAt.toDate().toISOString(),
            endedAt: dayjs(formDueAt.toDate()).add(formMeetingHours, 'hour').toDate().toISOString(),
          })

          if (enabledModules.meet_service && formMeetingGateway === 'zoom') {
            const availableZoomServiceId = await zoomServiceCheck({ overlapMeets })
            toBeUsedServiceId = availableZoomServiceId
          }

          if (
            overlapMeets.filter(
              overlapMeet => overlapMeet.target !== memberTaskId && overlapMeet.hostMemberId === formExecutorId,
            ).length > 0
          ) {
            return handleError({ message: '此時段不可指派此執行人員' })
          }

          if (
            overlapMeets.filter(
              overlapMeet =>
                overlapMeet.target !== memberTaskId &&
                formMemberId &&
                overlapMeet.meetMembers.map(v => v.memberId).includes(formMemberId),
            ).length > 0
          ) {
            return handleError({ message: '此時段不可指派此學員' })
          }
        }

        if (memberTask && memberTaskMeetId) {
          const {
            executor: memberTaskExecutor,
            member: memberTaskMember,
            dueAt: memberTaskDueAt,
            meetingGateway: memberTaskMeetingGateway,
            meetingHours: memberTaskMeetingHours,
          } = memberTask

          const memberTaskExecutorId = memberTaskExecutor?.id
          const memberTaskMemberId = memberTaskMember.id
          const memberTaskDueAtTime = toMillisecond(memberTaskDueAt)
          const formDueAtTime = toMillisecond(formDueAt?.toDate())

          if (
            !hasMeeting ||
            (hasMeeting &&
              (memberTaskDueAtTime !== formDueAtTime ||
                memberTaskExecutorId !== formExecutorId ||
                memberTaskMemberId !== formMemberId ||
                memberTaskMeetingGateway !== formMeetingGateway ||
                memberTaskMeetingHours !== formMeetingHours
              ))
          ) {
            deleteMeet({
              memberTaskMeetId,
              memberTaskMemberId,
              memberTaskMeetingGateway,
            })
          }
        }

        await insertMemberTask({
          variables: {
            data: {
              id: memberTaskId,
              title: formTitle,
              category_id: formCategoryId,
              member_id: formMemberId,
              author_id: currentMemberId,
              executor_id: formExecutorId,
              priority: formPriority,
              status: formStatus,
              due_at: toFormat(formDueAt),
              description: formDescription,
              has_meeting: formHasMeeting,
              meet_id: hasMeeting ? memberTask?.meet.id : null,
              meeting_hours: hasMeeting ? formMeetingHours : 0,
              meeting_gateway: hasMeeting ? formMeetingGateway ?? 'jitsi' : null,
              created_at: toFormat(formCreatedAt),
              is_private: formIsPrivate,
            },
          },
        }).then(async ({ data }) => {
          if (hasMeeting) {
            await insertMeet({
              variables: {
                meet: {
                  started_at: toFormat(formDueAt),
                  ended_at: dayjs(toFormat(formDueAt)).add(formMeetingHours, 'hours'),
                  nbf_at: dayjs(toFormat(formDueAt)).subtract(10, 'minutes'),
                  exp_at: dayjs(toFormat(formDueAt)).add(formMeetingHours, 'hours'),
                  auto_recording: formMeetingGateway === 'zoom',
                  target: memberTaskId ?? data?.insert_member_task_one?.id,
                  type: 'memberTask',
                  app_id: appId,
                  host_member_id: formExecutorId,
                  gateway: formMeetingGateway ?? 'jitsi',
                  service_id: formMeetingGateway === 'zoom' ? toBeUsedServiceId : null,
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
                      member_id: formMemberId,
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

  const handleCancel = ({
    e,
    setVisible,
  }: {
    e: React.MouseEvent<HTMLElement, MouseEvent>
    setVisible?: React.Dispatch<React.SetStateAction<boolean>>
  }) => {
    onCancel?.(e)
    setInvalidGateways([])
    setHasMeeting(false)
    setVisible?.(false)
    form.resetFields()
  }

  return (
    <AdminModal
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={e => handleCancel({ e, setVisible })}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={() => handleSubmit(() => setVisible(false))}
            disabled={hasMeeting && invalidGateways.includes('zoom') && meetingGateway === 'zoom'}
          >
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
                      const { id: memberTaskId, meet, member, meetingGateway } = memberTask
                      const memberTaskMeetId = meet?.id
                      const memberTaskMemberId = member.id
                      await deleteMemberTask({ variables: { memberTaskId } }).catch(handleError)
                      await deleteMeet({
                        memberTaskMeetId,
                        memberTaskMemberId,
                        memberTaskMeetingGateway: meetingGateway,
                      })
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
      onCancel={e => {
        handleCancel({
          e,
        })
      }}
      afterClose={afterClose}
      {...props}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        // onValuesChange={(changedValues, allValues) => {
        //   console.log(changedValues)

        //   if ('isPrivate' in changedValues) {
        //     form.setFieldsValue({ isPrivate: changedValues.isPrivate })
        //   }
        // }}
        initialValues={{
          title: memberTask?.title || '',
          categoryId: memberTask?.category?.id,
          memberId: memberTask?.member?.id || initialMemberId,
          executorId: memberTask?.executor?.id || initialExecutorId,
          priority: memberTask?.priority || 'high',
          status: memberTask?.status || 'pending',
          dueAt: memberTask?.dueAt ? moment(memberTask.dueAt) : null,
          createdAt: memberTask?.createdAt ? moment(memberTask.createdAt) : moment(moment(), 'HH:mm:ss'),
          hasMeeting: memberTask?.hasMeeting || false,
          meetingGateway: memberTask?.meetingGateway || 'jitsi',
          meetingHours: memberTask?.meetingHours || 1,
          description: memberTask?.description || '',
          isPrivate: memberTask?.isPrivate || false,
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
        <Form.Item name="isPrivate" valuePropName="checked">
          <Checkbox
          // checked={form.getFieldValue('isPrivate')}
          // onChange={e => {
          //   form.setFieldsValue({ isPrivate: e.target.value })
          // }}
          >
            {formatMessage(memberMessages.label.isPrivate)}
          </Checkbox>
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
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(memberMessages.label.assign),
                  }),
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
        <div className="row">
          {!!permissions.TASK_CREATED_AT_WRITE && (
            <div className="col-6">
              <Form.Item label={formatMessage(memberMessages.label.createdDate)} name="createdAt">
                <DatePicker
                  format="YYYY-MM-DD HH:mm"
                  showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                  style={{ width: '100%' }}
                  disabledDate={value => {
                    return value.valueOf() > new Date().valueOf()
                  }}
                />
              </Form.Item>
            </div>
          )}
          <div className={`${!!permissions.TASK_CREATED_AT_WRITE ? 'col-6' : 'col-12'}`}>
            <Form.Item
              label={formatMessage(memberMessages.label.executeDate)}
              name="dueAt"
              rules={[
                formInstance => ({
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(memberMessages.label.executeDate),
                  }),
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
                  const formValues = form.getFieldsValue()
                  const { dueAt: formDueAt, meetingHours: formMeetingHours } = formValues
                  if (hasMeeting && formDueAt && enabledModules.meet_service) {
                    const { overlapMeets } = await getOverlapMeets({
                      startedAt: formDueAt.toDate().toISOString(),
                      endedAt: dayjs(formDueAt.toDate()).add(formMeetingHours, 'hour').toDate().toISOString(),
                    })
                    await zoomServiceCheck({ overlapMeets })
                  }
                }}
              />
            </Form.Item>
          </div>
        </div>

        <Form.Item
          label={formatMessage(memberMessages.label.meetingLink)}
          name="hasMeeting"
          valuePropName="checked"
          style={{ marginBottom: hasMeeting ? '0px' : '24px' }}
        >
          <Checkbox
            style={{ display: 'flex', alignItems: 'center', width: 'fit-content' }}
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
          <>
            <Form.Item name="meetingGateway">
              <Radio.Group>
                <Stack direction="row">
                  <Radio
                    value="zoom"
                    disabled={invalidGateways.includes('zoom')}
                    onChange={async e => {
                      const formValues = form.getFieldsValue()
                      const { dueAt: formDueAt, meetingHours: formMeetingHours } = formValues
                      setMeetingGateWay(e.target.value)
                      if (hasMeeting && formDueAt && enabledModules.meet_service) {
                        const { overlapMeets } = await getOverlapMeets({
                          startedAt: formDueAt.toDate().toISOString(),
                          endedAt: dayjs(formDueAt.toDate()).add(formMeetingHours, 'hour').toDate().toISOString(),
                        })
                        await zoomServiceCheck({ overlapMeets })
                      }
                    }}
                  >
                    Zoom
                  </Radio>
                  <Radio value="jitsi" onChange={e => setMeetingGateWay(e.target.value)}>
                    Jitsi
                  </Radio>
                </Stack>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label={formatMessage(memberMessages.label.meetingHours)}
              name="meetingHours"
              rules={[
                formInstance => ({
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(memberMessages.label.meetingHours),
                  }),
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
              <InputNumber min={1} />
            </Form.Item>
          </>
        ) : null}
        <Form.Item label={formatMessage(memberMessages.label.taskDescription)} name="description">
          <TextArea />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default MemberTaskAdminModal
