import { DatePicker, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import TextArea from 'antd/lib/input/TextArea'
import moment from 'moment'
import React from 'react'
import { useIntl } from 'react-intl'
import { memberMessages } from '../../helpers/translation'
import { MemberTaskProps } from '../../types/member'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'

const MemberTaskAdminModal: React.FC<
  {
    memberTask?: MemberTaskProps
    onSubmit?: () => void
  } & AdminModalProps
> = ({ memberTask, onSubmit, ...props }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()

  return (
    <AdminModal {...props}>
      <Form form={form} layout="vertical" colon={false} hideRequiredMark>
        <Form.Item label={formatMessage(memberMessages.label.taskTitle)} name="title">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(memberMessages.label.classification)} name="classification"></Form.Item>

        <div className="row">
          <div className="col-6">
            <Form.Item></Form.Item>
          </div>
          <div className="col-6">
            <Form.Item></Form.Item>
          </div>
        </div>

        <div className="row">
          <div className="col-6">
            <Form.Item></Form.Item>
          </div>
          <div className="col-6">
            <Form.Item></Form.Item>
          </div>
        </div>

        <Form.Item>
          <DatePicker
            format="YYYY-MM-DD HH:mm"
            showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
          />
        </Form.Item>
        <Form.Item>
          <TextArea />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default MemberTaskAdminModal
