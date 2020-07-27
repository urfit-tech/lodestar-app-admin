import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { FormComponentProps } from '@ant-design/compatible/lib/form'
import Icon from '@ant-design/icons'
import { Button, Divider, message, Modal } from 'antd'
import BraftEditor from 'braft-editor'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { dateRangeFormatter, handleError } from '../../helpers'
import { appointmentMessages, commonMessages } from '../../helpers/translation'
import { useUpdateAppointmentResult } from '../../hooks/appointment'
import { ReactComponent as CalendarAltOIcon } from '../../images/icon/calendar-alt-o.svg'
import { ReactComponent as UserOIcon } from '../../images/icon/user-o.svg'
import AdminBraftEditor from '../admin/AdminBraftEditor'
import { AvatarImage } from '../common/Image'
import { BraftContent } from '../common/StyledBraftEditor'

const messages = defineMessages({
  appointmentText: { id: 'appointment.ui.appointmentText', defaultMessage: '{name} 已預約你的「{title}」' },
  addToCalendar: { id: 'appointment.ui.addToCalendar', defaultMessage: '加入行事曆' },
  joinMeeting: { id: 'appointment.ui.joinMeeting', defaultMessage: '進入會議' },
  appointmentIssueAndResult: { id: 'appointment.ui.appointmentIssueAndResult', defaultMessage: '提問紀錄單' },
  appointmentDate: { id: 'appointment.label.appointmentDate', defaultMessage: '諮詢日期' },
  appointmentIssue: { id: 'appointment.label.appointmentIssue', defaultMessage: '學員提問' },
  appointmentResult: { id: 'appointment.label.appointmentResult', defaultMessage: '諮詢重點紀錄' },
  appointmentResultNotation: {
    id: 'appointment.text.appointmentResultNotation',
    defaultMessage: '※此紀錄不會公開給學員看到',
  },
  appointmentCanceledAt: { id: 'appointment.label.appointmentCanceledAt', defaultMessage: '已於 {time} 取消預約' },
  orderUpdatedTime: { id: 'appointment.label.orderUpdatedTime', defaultMessage: '訂單更新日期' },
  canceledReason: { id: 'appointment.label.canceledReason', defaultMessage: '取消原因' },
})

const StyledWrapper = styled.div`
  margin-bottom: 0.75rem;
  padding: 2rem;
  border-radius: 4px;
  background-color: white;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
`
const StyledInfo = styled.div<{ withMask?: boolean }>`
  ${props => (props.withMask ? 'opacity: 0.2;' : '')}
`
const StyledTitle = styled.div`
  margin-bottom: 0.75rem;
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledMeta = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  letter-spacing: 0.4px;
`
const StyledButton = styled(Button)`
  line-height: normal;
  padding: 0 1.25rem;
`
const StyledCanceledText = styled.span`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
`
const StyledModal = styled(Modal)`
  && .ant-modal-footer {
    border-top: 0;
    padding: 0 1.5rem 1.5rem;
  }
`
const StyledModalTitle = styled.div`
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
`
const StyledModalMetaBlock = styled.div`
  padding: 0.75rem;
  background-color: var(--gray-lighter);
  font-size: 14px;
  border-radius: 4px;
`
const StyledModalMetaTitle = styled.div`
  margin-bottom: 0.75rem;
  color: var(--gray-darker);
  font-weight: bold;
  letter-spacing: 0.4px;
`
const StyledModalNotation = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  line-height: normal;
  letter-spacing: 0.4px;
`

export type AppointmentPeriodProps = {
  id: string
  avatarUrl: string | null
  member: {
    name: string
    email: string | null
    phone: string | null
  }
  appointmentPlanTitle: string
  startedAt: Date
  endedAt: Date
  canceledAt: Date | null
  creator: {
    id: string
    name: string
  }
  orderProduct: {
    id: string
    options: any
    orderLog?: {
      createdAt: Date
      updatedAt: Date | null
    }
  }
  appointmentIssue: string | null
  appointmentResult: string | null
}
type AppointmentPeriodCardProps = FormComponentProps &
  AppointmentPeriodProps & {
    onRefetch?: () => void
  }
const AppointmentPeriodCard: React.FC<AppointmentPeriodCardProps> = ({
  avatarUrl,
  member,
  appointmentPlanTitle,
  startedAt,
  endedAt,
  canceledAt,
  creator,
  orderProduct,
  appointmentIssue,
  appointmentResult,
  onRefetch,
  form,
}) => {
  const { formatMessage } = useIntl()
  const updateAppointmentResult = useUpdateAppointmentResult(orderProduct.id, orderProduct.options)

  const [visible, setVisible] = useState(false)
  const [issueModalVisible, setIssueModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const startedTime = moment(startedAt).utc().format('YYYYMMDD[T]HHmmss[Z]')
  const endedTime = moment(endedAt).utc().format('YYYYMMDD[T]HHmmss[Z]')
  const isFinished = endedAt.getTime() < Date.now()

  const handleSubmit = () => {
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }

      setLoading(true)
      updateAppointmentResult(values.appointmentResult.toRAW())
        .then(() => {
          onRefetch && onRefetch()
          setIssueModalVisible(false)
          message.success(formatMessage(commonMessages.event.successfullySaved))
        })
        .catch(handleError)
        .finally(() => setLoading(false))
    })
  }

  return (
    <StyledWrapper className="d-flex align-items-center justify-content-between">
      <StyledInfo className="d-flex align-items-center justify-content-start" withMask={!!canceledAt}>
        <AvatarImage src={avatarUrl} size={48} className="mr-4" />
        <div>
          <StyledTitle>
            {formatMessage(messages.appointmentText, { name: member.name, title: appointmentPlanTitle })}
          </StyledTitle>
          <StyledMeta>
            <Icon component={() => <CalendarAltOIcon />} className="mr-1" />
            <span>{dateRangeFormatter({ startedAt, endedAt, dateFormat: 'MM/DD(dd)' })}</span>
            {creator.name && (
              <>
                <Icon component={() => <UserOIcon />} className="ml-3 mr-1" />
                <span>{creator.name}</span>
              </>
            )}
          </StyledMeta>
        </div>
      </StyledInfo>

      <div>
        <Button type="link" size="small" onClick={() => setIssueModalVisible(true)}>
          {formatMessage(messages.appointmentIssueAndResult)}
        </Button>
        <Divider type="vertical" />
        <Button type="link" size="small" onClick={() => setVisible(true)}>
          {formatMessage(commonMessages.ui.detail)}
        </Button>
        <Divider type="vertical" />

        {canceledAt ? (
          <StyledCanceledText className="ml-2">
            {formatMessage(messages.appointmentCanceledAt, { time: moment(canceledAt).format('MM/DD(dd) HH:mm') })}
          </StyledCanceledText>
        ) : isFinished ? (
          <StyledButton type="link" size="small" disabled>
            {formatMessage(appointmentMessages.status.finished)}
          </StyledButton>
        ) : (
          <>
            <a
              href={`https://www.google.com/calendar/render?action=TEMPLATE&text=${appointmentPlanTitle}&dates=${startedTime}%2F${endedTime}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button type="link" size="small">
                {formatMessage(messages.addToCalendar)}
              </Button>
            </a>
            <a
              href={`https://meet.jit.si/${orderProduct.id}#config.startWithVideoMuted=true&userInfo.displayName="${creator.name}"`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <StyledButton type="primary" className="ml-2" disabled={!orderProduct.id}>
                {formatMessage(messages.joinMeeting)}
              </StyledButton>
            </a>
          </>
        )}
      </div>

      <Modal footer={null} width={312} destroyOnClose centered visible={visible} onCancel={() => setVisible(false)}>
        <div className="text-center mb-4">
          <AvatarImage src={avatarUrl} size={72} className="mx-auto mb-3" />
          <StyledTitle>{member.name}</StyledTitle>
          <StyledMeta>
            <Icon component={() => <CalendarAltOIcon />} className="mr-1" />
            <span>{dateRangeFormatter({ startedAt, endedAt, dateFormat: 'MM/DD(dd)' })}</span>
          </StyledMeta>
        </div>

        {member.email && (
          <StyledMeta className="d-flex justify-content-between mb-3">
            <div>{formatMessage(commonMessages.term.email)}</div>
            <div>{member.email}</div>
          </StyledMeta>
        )}
        {member.phone && (
          <StyledMeta className="d-flex justify-content-between mb-3">
            <div>{formatMessage(commonMessages.term.phone)}</div>
            <div>{member.phone}</div>
          </StyledMeta>
        )}
        {orderProduct.orderLog?.createdAt && (
          <StyledMeta className="d-flex justify-content-between mb-3">
            <div>{formatMessage(messages.orderUpdatedTime)}</div>
            <div>
              {moment(orderProduct.orderLog?.updatedAt || orderProduct.orderLog?.createdAt).format('YYYY-MM-DD HH:mm')}
            </div>
          </StyledMeta>
        )}
        {orderProduct.options?.appointmentCanceledReason && (
          <StyledModalMetaBlock>
            <StyledModalMetaTitle>{formatMessage(messages.canceledReason)}</StyledModalMetaTitle>
            {orderProduct.options.appointmentCanceledReason}
          </StyledModalMetaBlock>
        )}
      </Modal>

      <StyledModal
        width={660}
        visible={issueModalVisible}
        okText={formatMessage(commonMessages.ui.save)}
        cancelText={formatMessage(commonMessages.ui.cancel)}
        okButtonProps={{ loading }}
        onOk={handleSubmit}
        onCancel={() => setIssueModalVisible(false)}
      >
        <StyledModalTitle className="mb-4">{formatMessage(messages.appointmentIssueAndResult)}</StyledModalTitle>
        <StyledModalMetaBlock className="mb-4">
          <span className="mr-2">{formatMessage(messages.appointmentDate)}</span>
          <span>{dateRangeFormatter({ startedAt, endedAt, dateFormat: 'MM/DD(dd)' })}</span>
        </StyledModalMetaBlock>

        <div className="mb-4">
          <strong className="mb-3">{formatMessage(messages.appointmentIssue)}</strong>
          <BraftContent>{appointmentIssue}</BraftContent>
        </div>

        <div>
          <strong>{formatMessage(messages.appointmentResult)}</strong>
          <StyledModalNotation className="mb-2">
            {formatMessage(messages.appointmentResultNotation)}
          </StyledModalNotation>
        </div>
        <Form>
          <Form.Item>
            {form.getFieldDecorator('appointmentResult', {
              initialValue: BraftEditor.createEditorState(appointmentResult),
            })(<AdminBraftEditor />)}
          </Form.Item>
        </Form>
      </StyledModal>
    </StyledWrapper>
  )
}

export default Form.create<AppointmentPeriodCardProps>()(AppointmentPeriodCard)
