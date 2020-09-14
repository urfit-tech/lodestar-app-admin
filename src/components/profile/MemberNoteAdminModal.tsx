import { Button, Form, Input, Radio, Select, TimePicker } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import moment from 'moment'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import EmptyCover from '../../images/default/empty-cover.png'
import AdminModal from '../admin/AdminModal'
import { CustomRatioImage } from '../common/Image'

const messages = defineMessages({
  callType: { id: 'commonMessages.label.callType', defaultMessage: '通話類型' },
  description: { id: 'commonMessages.label.description', defaultMessage: '內容' },
  status: { id: 'commonMessages.label.status', defaultMessage: '狀態' },
  duration: { id: 'commonMessages.label.duration', defaultMessage: '通時' },
  null: { id: 'commonMessages.type.null', defaultMessage: '無' },
  inbound: { id: 'commonMessages.type.inbound', defaultMessage: '外撥' },
  outbound: { id: 'commonMessages.type.outbound', defaultMessage: '進線' },
  missed: { id: 'commonMessages.status.missed', defaultMessage: '未接聽' },
  answered: { id: 'commonMessages.status.answered', defaultMessage: '已接聽' },
})

const StyledFormLabel = styled.h3`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.71;
  letter-spacing: 0.4px;
  color: var(--gray-darker);
`

const StyledMemberInfo = styled.div`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.4px;
  color: var(--gray-dark);
`

const MemberNoteAdminModal: React.FC<{
  title: string
  member: {
    avatarUrl: string | null
    name: string
  }
  renderTrigger: React.FC<{ setVisible: React.Dispatch<React.SetStateAction<boolean>> }>
  onSubmit: () => void
  note?: {
    type: 'inbound' | 'outbound' | null
    status: string | null
    duration: number | null
    description: number | null
  }
}> = ({ title, member, renderTrigger, onSubmit, note }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [type, setType] = useState<'inbound' | 'outbound' | null>(note?.type || null)
  const [status, setStatus] = useState<string | null>(note?.status || 'answered')

  return (
    <AdminModal
      title={title}
      renderTrigger={({ setVisible }) => renderTrigger({ setVisible })}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" onClick={() => onSubmit()}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </>
      )}
    >
      <StyledMemberInfo className="d-flex align-items-center mb-4">
        <CustomRatioImage
          src={member?.avatarUrl || EmptyCover}
          shape="circle"
          width="36px"
          ratio={1}
          className="mr-2"
        />
        <span>{member.name}</span>
      </StyledMemberInfo>
      <Form
        form={form}
        initialValues={{
          type,
          status,
          duration: note?.duration || moment('00:00:00', 'HH:mm:ss'),
          description: note?.description,
        }}
      >
        <StyledFormLabel>{formatMessage(messages.callType)}</StyledFormLabel>
        <Form.Item name="type">
          <Radio.Group onChange={e => setType(e.target.value)}>
            <Radio value={null}>{formatMessage(messages.null)}</Radio>
            <Radio value="inbound">{formatMessage(messages.inbound)}</Radio>
            <Radio value="outbound">{formatMessage(messages.outbound)}</Radio>
          </Radio.Group>
        </Form.Item>
        {type === 'inbound' && (
          <div className="row">
            <div className="col-5">
              <StyledFormLabel>{formatMessage(messages.status)}</StyledFormLabel>
              <Form.Item name="status">
                <Select onSelect={val => setStatus(val as string)}>
                  <Select.Option value="answered">{formatMessage(messages.answered)}</Select.Option>
                  <Select.Option value="missed">{formatMessage(messages.missed)}</Select.Option>
                </Select>
              </Form.Item>
            </div>
            {status === 'answered' && (
              <div className="col-7">
                <StyledFormLabel>{formatMessage(messages.duration)}</StyledFormLabel>
                <Form.Item name="duration">
                  <TimePicker style={{ width: '100%' }} />
                </Form.Item>
              </div>
            )}
          </div>
        )}
        <StyledFormLabel>{formatMessage(messages.description)}</StyledFormLabel>
        <Form.Item name="description">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default MemberNoteAdminModal
