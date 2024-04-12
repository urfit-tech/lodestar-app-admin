import { Button, Form, Input, Radio, Select, TimePicker } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, memberMessages } from '../../helpers/translation'
import DefaultAvatar from '../../images/default/avatar.svg'
import { MemberNote, NoteAdminProps } from '../../types/member'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import FileUploader from '../common/FileUploader'
import { CustomRatioImage } from '../common/Image'

const StyledMemberName = styled.div`
  color: var(--gray-darker);
  line-height: 1.5;
  letter-spacing: 0.2px;
`
const StyledMemberEmail = styled.div`
  color: var(--gray-dark);
  font-size: 12px;
  letter-spacing: 0.6px;
`

type FieldProps = {
  type: NoteAdminProps['type']
  status: string | null
  duration: number
  description: string
  note: string
}

const MemberNoteAdminModal: React.FC<
  | AdminModalProps & {
      note?: Pick<
        MemberNote,
        | 'id'
        | 'createdAt'
        | 'type'
        | 'status'
        | 'author'
        | 'member'
        | 'duration'
        | 'description'
        | 'note'
        | 'attachments'
        | 'metadata'
      >
      onSubmit?: (values: FieldProps & { attachments: File[] }) => Promise<any>
      info?: {
        email: string
        name: string
        pictureUrl: string
      }
    }
> = ({ info, note, onSubmit, onCancel, ...props }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { currentUserRole } = useAuth()
  const { enabledModules } = useApp()

  const [type, setType] = useState(note?.type || '')
  const [status, setStatus] = useState<FieldProps['status']>(note?.status || 'answered')
  const [attachments, setAttachments] = useState<File[]>(note?.attachments?.map(attachment => attachment.data) || [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setType(note?.type || '')
    setStatus(note?.status || 'answered')
    setAttachments(note?.attachments?.map(attachment => attachment.data) || [])
    form.resetFields()
  }, [form, note])

  const resetModal = () => {
    setType(note?.type || '')
    setStatus(note?.status || 'answered')
    setAttachments(note?.attachments?.map(attachment => attachment.data) || [])
    form.resetFields()
  }

  const handleSubmit = async (onSuccess: () => void) => {
    setIsSubmitting(true)

    const values = await form.validateFields().catch(() => {})
    if (!values) {
      return
    }

    onSubmit?.({
      type: values.type || null,
      status: values.type ? values.status : null,
      duration: values.duration ? moment(values.duration).diff(moment().startOf('day'), 'seconds') : 0,
      description: values.description || '',
      note: values.note || '',
      attachments,
    })
      .then(() => onSuccess())
      .finally(() => {
        setIsSubmitting(false)
        form.resetFields()
      })
  }

  return (
    <AdminModal
      footer={null}
      onCancel={e => onCancel?.(e)}
      renderFooter={({ setVisible }) => (
        <>
          <Button
            className="mr-2"
            onClick={e => {
              onCancel?.(e)
              setVisible(false)
              resetModal()
            }}
          >
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button loading={isSubmitting} type="primary" onClick={() => {
            handleSubmit(() => setVisible(false))
          }}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </>
      )}
      maskClosable={false}
      {...props}
    >
      <div className="d-flex align-items-center mb-4">
        <CustomRatioImage
          src={note?.member?.pictureUrl || info?.pictureUrl || DefaultAvatar}
          shape="circle"
          width="36px"
          ratio={1}
          className="mr-2"
        />
        <div className="flex-grow-1">
          <StyledMemberName>{note?.member?.name || info?.name}</StyledMemberName>
          <StyledMemberEmail>{note?.member?.email || info?.email}</StyledMemberEmail>
        </div>
      </div>

      <Form
        form={form}
        requiredMark={false}
        layout="vertical"
        onValuesChange={(_, values) => {
          setType(values.type || '')
          setStatus(values.status)
        }}
      >
        <Form.Item name="type" label={formatMessage(memberMessages.label.callType)} initialValue={note?.type || ''}>
          <Radio.Group>
            <Radio value="">{formatMessage(memberMessages.status.null)}</Radio>
            <Radio value="outbound">{formatMessage(memberMessages.status.outbound)}</Radio>
            <Radio value="inbound">{formatMessage(memberMessages.status.inbound)}</Radio>
            {enabledModules.member_note_demo && <Radio value="demo">{formatMessage(memberMessages.status.demo)}</Radio>}
          </Radio.Group>
        </Form.Item>

        <div className={type ? 'row' : 'd-none'}>
          <div className="col-5">
            <Form.Item
              name="status"
              label={formatMessage(memberMessages.label.status)}
              initialValue={note?.status || 'answered'}
            >
              <Select>
                <Select.Option value="answered">{formatMessage(memberMessages.status.answered)}</Select.Option>
                <Select.Option value="missed">{formatMessage(memberMessages.status.missed)}</Select.Option>
              </Select>
            </Form.Item>
          </div>

          {status === 'answered' && (
            <div className="col-7">
              <Form.Item
                name="duration"
                label={formatMessage(memberMessages.label.duration)}
                initialValue={
                  note?.duration
                    ? moment(moment().startOf('day').seconds(note.duration), 'HH:mm:ss')
                    : moment().startOf('day')
                }
              >
                <TimePicker style={{ width: '100%' }} showNow={false} />
              </Form.Item>
            </div>
          )}

          <div className="col-12">
            <Form.Item label={formatMessage(memberMessages.label.attachment)}>
              <FileUploader
                multiple
                showUploadList
                fileList={attachments}
                onChange={files => setAttachments(files)}
                downloadableLink={
                  note?.attachments
                    ? note?.metadata?.meetId
                      ? file => file.name
                      : file => {
                          const attachmentId = note.attachments?.find(
                            v => v.data.name === file.name && v.data.lastModified,
                          )?.id
                          return `attachments/${attachmentId}`
                        }
                    : undefined
                }
              />
            </Form.Item>
          </div>
        </div>

        <Form.Item
          label={formatMessage(memberMessages.label.description)}
          name="description"
          initialValue={note?.description}
        >
          <Input.TextArea />
        </Form.Item>

        <Form.Item
          label={formatMessage(memberMessages.label.noteForPermission)}
          name="note"
          initialValue={note?.note}
          className={currentUserRole === 'app-owner' ? '' : 'd-none'}
        >
          <Input.TextArea />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default MemberNoteAdminModal
