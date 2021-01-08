import { Button, Form, Input, Radio, Select, TimePicker } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, memberMessages } from '../../helpers/translation'
import DefaultAvatar from '../../images/default/avatar.svg'
import { MemberNoteAdminProps } from '../../types/member'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import FileUploader from '../common/FileUploader'
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
  description: string
}

const MemberNoteAdminModal: React.FC<
  AdminModalProps & {
    member: {
      avatarUrl: string | null
      name: string
    }
    note?: MemberNoteAdminProps
    onSubmit?: (values: FieldProps & { attachment: File | null }) => Promise<any>
  }
> = ({ member, note, onSubmit, ...props }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const [type, setType] = useState(note?.type || '')
  const [status, setStatus] = useState<FieldProps['status']>(note?.status || 'answered')
  const [attachments, setAttachments] = useState<File[]>(note?.attachment?.data ? [note.attachment.data] : [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetModal = () => {
    setType(note?.type || '')
    setStatus(note?.status || 'answered')
    setAttachments(note?.attachment?.data ? [note.attachment.data] : [])
    form.resetFields()
  }

  const handleSubmit = (onSuccess: () => void) => {
    setIsSubmitting(true)

    const pendingFiles = attachments.filter(
      attachment =>
        attachment.name !== note?.attachment?.data?.name &&
        attachment.lastModified !== note?.attachment?.data?.lastModified,
    )

    form
      .validateFields()
      .then(() => {
        const values = form.getFieldsValue()
        onSubmit?.({
          type: values.type || null,
          status: values.type ? values.status : null,
          duration: values.duration && moment(values.duration).diff(moment().startOf('day'), 'seconds'),
          description: values.description,
          attachment: pendingFiles[0] || null,
        })
          .then(() => {
            onSuccess()
            !note && resetModal()
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
        requiredMark={false}
        layout="vertical"
        initialValues={{
          type,
          status,
          duration: note?.duration && moment(moment().startOf('day').seconds(note.duration), 'HH:mm:ss'),
          description: note?.description || '',
        }}
        onValuesChange={(_, values) => {
          setType(values.type || '')
          setStatus(values.status)
        }}
      >
        <Form.Item name="type" label={formatMessage(memberMessages.label.callType)}>
          <Radio.Group>
            <Radio value="">{formatMessage(memberMessages.status.null)}</Radio>
            <Radio value="outbound">{formatMessage(memberMessages.status.outbound)}</Radio>
            <Radio value="inbound">{formatMessage(memberMessages.status.inbound)}</Radio>
          </Radio.Group>
        </Form.Item>

        <div className={`row ${!type ? 'd-none' : ''}`}>
          <div className="col-5">
            <Form.Item name="status" label={formatMessage(memberMessages.label.status)}>
              <Select>
                <Select.Option value="answered">{formatMessage(memberMessages.status.answered)}</Select.Option>
                <Select.Option value="missed">{formatMessage(memberMessages.status.missed)}</Select.Option>
              </Select>
            </Form.Item>
          </div>

          {status === 'answered' && (
            <div className="col-7">
              <Form.Item name="duration" label={formatMessage(memberMessages.label.duration)}>
                <TimePicker style={{ width: '100%' }} showNow={false} />
              </Form.Item>
            </div>
          )}

          <div className="col-12">
            <Form.Item label={formatMessage(memberMessages.label.attachment)}>
              <FileUploader fileList={attachments} onChange={files => setAttachments(files)} showUploadList />
            </Form.Item>
          </div>
        </div>

        <StyledFormLabel>{formatMessage(memberMessages.label.description)}</StyledFormLabel>

        <Form.Item name="description">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default MemberNoteAdminModal
