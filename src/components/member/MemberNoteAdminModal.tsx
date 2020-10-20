import { Button, Form, Input, Radio, Select, TimePicker } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import moment from 'moment'
import { contains } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, memberMessages } from '../../helpers/translation'
import DefaultAvatar from '../../images/default/avatar.svg'
import { MemberNoteAdminProps } from '../../types/member'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import { CustomRatioImage } from '../common/Image'

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

type FieldProps = {
  type: MemberNoteAdminProps['type']
  status: string | null
  duration: number | null
  description: string | null
}

const MemberNoteAdminModal: React.FC<
  AdminModalProps & {
    member: {
      avatarUrl: string | null
      name: string
    }
    note?: FieldProps
    onSubmit?: (values: FieldProps) => Promise<any>
  }
> = ({ member, note, onSubmit, ...props }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [type, setType] = useState<MemberNoteAdminProps['type']>(note?.type || null)
  const [status, setStatus] = useState<string | null>(note?.status || 'answered')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetModal = () => {
    setType(null)
    setStatus('answered')
    form.resetFields()
  }

  const handleSubmit = (onSuccess: () => void) => {
    setIsSubmitting(true)
    form
      .validateFields()
      .then(() => {
        const values = form.getFieldsValue()
        onSubmit?.({
          ...values,
          duration: values.duration && moment(values.duration).diff(moment().startOf('day'), 'seconds'),
        })
          .then(() => {
            onSuccess()
            resetModal()
          })
          .finally(() => setIsSubmitting(false))
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button
            className="mr-2"
            onClick={() => {
              setVisible(false)
              resetModal()
            }}
          >
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button loading={isSubmitting} type="primary" onClick={() => handleSubmit(() => setVisible(false))}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </>
      )}
      maskClosable={false}
      {...props}
    >
      <StyledMemberInfo className="d-flex align-items-center mb-4">
        <CustomRatioImage
          src={member?.avatarUrl || DefaultAvatar}
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
          duration: note?.duration && moment(moment().startOf('day').seconds(note.duration), 'HH:mm:ss'),
          description: note?.description,
        }}
      >
        <StyledFormLabel>{formatMessage(memberMessages.label.callType)}</StyledFormLabel>
        <Form.Item name="type">
          <Radio.Group onChange={e => setType(e.target.value)}>
            <Radio value={null}>{formatMessage(memberMessages.status.null)}</Radio>
            <Radio value="outbound">{formatMessage(memberMessages.status.outbound)}</Radio>
            <Radio value="inbound">{formatMessage(memberMessages.status.inbound)}</Radio>
          </Radio.Group>
        </Form.Item>
        {contains(type, ['outbound', 'inbound']) && (
          <div className="row">
            <div className="col-5">
              <StyledFormLabel>{formatMessage(memberMessages.label.status)}</StyledFormLabel>
              <Form.Item name="status">
                <Select onSelect={val => setStatus(val as string)}>
                  <Select.Option value="answered">{formatMessage(memberMessages.status.answered)}</Select.Option>
                  <Select.Option value="missed">{formatMessage(memberMessages.status.missed)}</Select.Option>
                </Select>
              </Form.Item>
            </div>
            {status === 'answered' && (
              <div className="col-7">
                <StyledFormLabel>{formatMessage(memberMessages.label.duration)}</StyledFormLabel>
                <Form.Item name="duration">
                  <TimePicker style={{ width: '100%' }} showNow={false} />
                </Form.Item>
              </div>
            )}
          </div>
        )}
        <StyledFormLabel>{formatMessage(memberMessages.label.description)}</StyledFormLabel>
        <Form.Item name="description">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default MemberNoteAdminModal
