import Icon, { MoreOutlined } from '@ant-design/icons'
import { Stack, Text } from '@chakra-ui/react'
import { Button, DatePicker, Dropdown, Form, Input, InputNumber, Menu, Radio, Select } from 'antd'
import Checkbox from 'antd/lib/checkbox/Checkbox'
import { useForm } from 'antd/lib/form/Form'
import TextArea from 'antd/lib/input/TextArea'
import dayjs from 'dayjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, memberMessages } from '../../helpers/translation'
import { useDeleteMeet, useGetOverlapMeet, useMutateMeet, useMutateMeetMember } from '../../hooks/meet'
import { useMutateMemberTask } from '../../hooks/memberTask'
import { useMeetingServiceCheck, useService } from '../../hooks/service'
import { ReactComponent as ExternalLinkIcon } from '../../images/icon/external-link-square.svg'
import { OverlapMeets } from '../../types/meet'
import { MeetingGateway, MemberTaskAdminModalFieldProps, MemberTaskProps } from '../../types/member'
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

const toMillisecond = (date: Date | null | undefined) => date && dayjs(date).toDate().getTime()
const toFormat = (date: moment.Moment | null) => date?.format('YYYY-MM-DDTHH:mm:00Z')

const checkMeetingMember = ({
  overlapMeets,
  memberTaskId,
  formExecutorId,
  formMemberId,
  formMeetingGateway,
}: {
  overlapMeets: OverlapMeets
  memberTaskId: string | undefined
  formExecutorId: string
  formMemberId: string
  formMeetingGateway?: string
}) => {
  let message = ''
  // FIXME:因應業務需求, 先跳過 google meet 的指派執行人員檢查
  if (formMeetingGateway !== 'google-meet') {
    if (
      overlapMeets.filter(
        overlapMeet => overlapMeet.target !== memberTaskId && overlapMeet.hostMemberId === formExecutorId,
      ).length > 0
    ) {
      message = '此時段不可指派此執行人員'
    }
  }

  if (
    overlapMeets.filter(
      overlapMeet =>
        overlapMeet.target !== memberTaskId &&
        formMemberId &&
        overlapMeet.meetMembers.map(v => v.memberId).includes(formMemberId),
    ).length > 0
  ) {
    message = '此時段不可指派此學員'
  }
  return {
    message,
  }
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
  const { currentMemberId, permissions } = useAuth()
  const { id: appId, enabledModules } = useApp()
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const [form] = useForm<MemberTaskAdminModalFieldProps>()
  const { insertMemberTask, updateMemberTask, deleteMemberTask } = useMutateMemberTask()
  const { insertMeet } = useMutateMeet()
  const { deleteMeet } = useDeleteMeet()
  const { insertMeetMember } = useMutateMeetMember()
  const { getOverlapMeets } = useGetOverlapMeet()
  const { getAvailableGatewayServiceId, getValidGatewaysWithinTimeRange, invalidGateways, setInvalidGateways } =
    useMeetingServiceCheck()
  const { services } = useService()
  const [meetingGateway, setMeetingGateWay] = useState<MeetingGateway>()
  const [hasMeeting, setHasMeeting] = useState(!!memberTask?.meetingGateway || memberTask?.hasMeeting || false)

  const handleSubmit = async (onSuccess?: () => void) => {
    try {
      await form.validateFields()
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
      const memberTaskMeetingGateway = memberTask?.meetingGateway
      const memberTaskExecutorId = memberTask?.executor?.id
      const memberTaskMemberId = memberTask?.member?.id
      const memberTaskMeetingHours = memberTask?.meetingHours
      const memberTaskDueAtTime = toMillisecond(memberTask?.dueAt)
      const formDueAtTime = toMillisecond(formDueAt?.toDate())
      const changeMeetingCondition =
        memberTaskExecutorId !== formExecutorId ||
        memberTaskMemberId !== formMemberId ||
        memberTaskMeetingGateway !== formMeetingGateway ||
        memberTaskDueAtTime !== formDueAtTime ||
        memberTaskMeetingHours !== formMeetingHours

      let toBeUsedServiceId: string | null = null

      if (memberTaskMemberId && memberTaskMeetingGateway && memberTaskMeetId) {
        if (!formHasMeeting || (formHasMeeting && changeMeetingCondition)) {
          try {
            await deleteMeet({
              memberTaskMeetId,
              memberTaskMemberId,
              memberTaskMeetingGateway,
            })
          } catch (err) {
            handleError(err)
          }
        }
      }

      if (formHasMeeting) {
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

        if (
          enabledModules.meet_service &&
          changeMeetingCondition &&
          (formMeetingGateway === 'zoom' || formMeetingGateway === 'google-meet')
        ) {
          toBeUsedServiceId = await getAvailableGatewayServiceId({
            gateway: formMeetingGateway,
            startedAt: formDueAt.toDate(),
            endedAt: dayjs(formDueAt.toDate()).add(formMeetingHours, 'hour').toDate(),
          })
        }

        const { message } = checkMeetingMember({
          overlapMeets,
          memberTaskId,
          formExecutorId,
          formMemberId,
          formMeetingGateway,
        })
        if (!!message) {
          return handleError({ message })
        }
      }

      try {
        setLoading(true)
        const { data: insertMemberTaskData } = await insertMemberTask({
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
              meet_id: formHasMeeting ? memberTask?.meet.id : null,
              meeting_hours: formHasMeeting ? formMeetingHours : 0,
              meeting_gateway: formHasMeeting ? formMeetingGateway ?? 'jitsi' : null,
              created_at: toFormat(formCreatedAt),
              is_private: formIsPrivate,
            },
          },
        })

        if (formHasMeeting && changeMeetingCondition) {
          const { data: insertMeetData } = await insertMeet({
            variables: {
              meet: {
                started_at: toFormat(formDueAt),
                ended_at: dayjs(toFormat(formDueAt)).add(formMeetingHours, 'hours'),
                nbf_at: dayjs(toFormat(formDueAt)).subtract(10, 'minutes'),
                exp_at: dayjs(toFormat(formDueAt)).add(formMeetingHours, 'hours'),
                auto_recording: formMeetingGateway !== 'jitsi',
                target: memberTaskId ?? insertMemberTaskData?.insert_member_task_one?.id,
                type: 'memberTask',
                app_id: appId,
                host_member_id: formExecutorId,
                gateway: formMeetingGateway ?? 'jitsi',
                service_id: formMeetingGateway !== 'jitsi' ? toBeUsedServiceId : null,
                options: {},
              },
            },
          })

          await insertMeetMember({
            variables: {
              meetMember: {
                meet_id: insertMeetData?.insert_meet_one?.id,
                member_id: formMemberId,
              },
            },
          }).catch(error => handleError({ message: `insert meet member failed. error:${error}` }))

          if (!insertMemberTaskData?.insert_member_task_one?.id)
            return handleError({ message: 'can not get member task id' })

          await updateMemberTask({
            variables: {
              memberTaskId: insertMemberTaskData?.insert_member_task_one?.id,
              data: { meet_id: insertMeetData?.insert_meet_one?.id || memberTaskMeetId },
            },
          }).catch(error => handleError({ message: `update member task meetId failed. error:${error}` }))
        }
      } catch (error) {
        handleError({ message: 'error' })
        setLoading(false)
      }

      onRefetch?.()
      onSuccess?.()
      if (!memberTask) {
        form.resetFields() //reset field when using createTask button
        setInvalidGateways([])
        setHasMeeting(false)
      }
      setLoading(false)
    } catch (error: any) {
      if (error?.errorFields) {
        const errorMessages = error.errorFields.map((v: { errors: any[] }) => v.errors.toString()).join(' ,')
        handleError({ message: errorMessages })
      }
    }
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

  const handleMeetingGateway = async (currentMeetingGateway: MeetingGateway, startedAt: Date, endedAt: Date) => {
    const defaultServiceGateways = Array.from(new Set(services.map(service => service.gateway)))
    const validGateways = await getValidGatewaysWithinTimeRange({ startedAt, endedAt })
    // FIXME:因應業務需求, 先跳過 google meet 的指派執行人員檢查
    // const gatewayPriority: MeetingGateway[] = [currentMeetingGateway, 'google-meet', 'zoom', 'jitsi']
    // const selectedGateway = gatewayPriority.find(gateway => validGateways.includes(gateway)) || 'jitsi'
    // form.setFieldsValue({ meetingGateway: selectedGateway })
    setInvalidGateways(
      defaultServiceGateways.filter(
        defaultServiceGateway => !validGateways.some(validGateway => validGateway === defaultServiceGateway),
      ),
    )
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
            onClick={() =>
              handleSubmit(() => {
                setVisible(false)
                const newUrl = `${window.location.pathname}`
                window.history.pushState({ path: newUrl }, '', newUrl)
              })
            }
            // FIXME:因應業務需求, 先跳過 google meet 的指派執行人員檢查
            // disabled={hasMeeting && meetingGateway && invalidGateways.includes(meetingGateway)}
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
          meetingGateway: memberTask?.meetingGateway || 'google-meet',
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
              <AllMemberSelector allowedPermissions={['BACKSTAGE_ENTER']} />
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
                  const { dueAt: formDueAt, meetingHours: formMeetingHours, meetingGateway } = formValues
                  if (hasMeeting && formDueAt && enabledModules.meet_service) {
                    handleMeetingGateway(
                      meetingGateway,
                      formDueAt.toDate(),
                      dayjs(formDueAt.toDate()).add(formMeetingHours, 'hour').toDate(),
                    )
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
            onChange={async e => {
              setHasMeeting(e.target.checked)
              const formValues = form.getFieldsValue()
              const { dueAt: formDueAt, meetingHours: formMeetingHours, meetingGateway } = formValues
              if (formDueAt) {
                handleMeetingGateway(
                  meetingGateway,
                  formDueAt.toDate(),
                  dayjs(formDueAt.toDate())
                    .add(formMeetingHours || 1, 'hour')
                    .toDate(),
                )
              }
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
                    value="google-meet"
                    // FIXME:因應業務需求, 先跳過 google meet 的指派執行人員檢查
                    // disabled={invalidGateways.includes('google-meet')}
                    onChange={e => setMeetingGateWay(e.target.value)}
                  >
                    Google meet
                  </Radio>
                  <Radio
                    value="zoom"
                    disabled={invalidGateways.includes('zoom')}
                    onChange={e => setMeetingGateWay(e.target.value)}
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
