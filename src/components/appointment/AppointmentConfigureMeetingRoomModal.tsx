import { Button, Form, Input, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useMutateMeetMember } from '../../hooks/meet'
import { Meet } from '../../types/meet'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import { StyledModalTitle } from '../common'
import appointmentMessages from './translation'

type FieldProps = {
  joinUrl: string
}

const StyledLabel = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  line-height: normal;
  letter-spacing: 0.4px;
`

const AppointmentConfigureMeetingRoomModal: React.VFC<
  AdminModalProps & {
    appointmentEnrollmentId: string
    appointmentId: string
    meetingLinkUrl: string
    meetId: string
    meet: Meet | null
    memberId: string
    onRefetch?: () => void
    orderProduct: { id: string; options: any }
    onModalVisibleTypeChange: (type: '') => void
  }
> = ({
  appointmentId,
  memberId,
  appointmentEnrollmentId,
  meetingLinkUrl,
  meetId,
  meet,
  onRefetch,
  onModalVisibleTypeChange,
  orderProduct,
  ...props
}) => {
  const { id: appId } = useApp()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const { formatMessage } = useIntl()
  const { moveMeetMember } = useMutateMeetMember()

  const handleSubmit = async (onSuccess: () => void) => {
    try {
      await form.validateFields()
      // the buyer can only be moved out of an existing room
      if (!meet?.id) return handleError({ message: formatMessage(commonMessages.event.failedSave) })
      setLoading(true)
      const values = form.getFieldsValue()
      const newMeetId = uuid()
      const { data } = await moveMeetMember({
        variables: {
          meet: {
            id: newMeetId,
            started_at: meet.startedAt,
            ended_at: meet.endedAt,
            nbf_at: meet.nbfAt,
            exp_at: meet.expAt,
            auto_recording: false,
            target: appointmentId,
            type: 'appointmentPlan',
            app_id: appId,
            host_member_id: meet.hostMemberId,
            gateway: 'jitsi',
            service_id: null,
            options: {
              startUrl: values.joinUrl,
              joinUrl: values.joinUrl,
            },
          },
          previousMeetId: meet.id,
          newMeetId,
          memberId,
        },
      })
      if (data?.assert_meet_member_moved.length !== 1 || data.assert_meet_member_moved[0].ok !== true) {
        return handleError({ message: formatMessage(commonMessages.event.failedSave) })
      }

      message.success(formatMessage(commonMessages.event.successfullySaved))
      onSuccess()
      form.resetFields()
      onRefetch?.()
    } catch (err) {
      handleError(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminModal
      width={520}
      centered
      footer={null}
      onCancel={() => onModalVisibleTypeChange('')}
      renderFooter={() => (
        <>
          <Button className="mr-2" onClick={() => onModalVisibleTypeChange('')}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button
            type="primary"
            loading={loading}
            onClick={() => {
              if (form.getFieldValue('joinUrl') !== meet?.options?.startUrl) {
                handleSubmit(() => onModalVisibleTypeChange(''))
              } else {
                onModalVisibleTypeChange('')
              }
            }}
          >
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </>
      )}
      {...props}
    >
      <StyledModalTitle className="mb-4">
        {formatMessage(appointmentMessages['*'].appointmentConfigureMeetingRoom)}
      </StyledModalTitle>
      <StyledLabel className="mb-1">
        {formatMessage(appointmentMessages.AppointmentConfigureMeetingRoomModal.meetingLink)}
      </StyledLabel>
      <Form
        form={form}
        initialValues={{
          joinUrl: meetingLinkUrl,
        }}
      >
        <Form.Item name="joinUrl">
          <Input />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default AppointmentConfigureMeetingRoomModal
