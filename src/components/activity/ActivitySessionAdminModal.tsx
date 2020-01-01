import { Button, Checkbox, DatePicker, Form, Icon, Input, InputNumber } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import moment from 'moment'
import React, { useState } from 'react'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import { ActivitySessionProps } from './ActivitySessionsAdminBlock'

type ActivitySessionAdminModalProps = AdminModalProps &
  FormComponentProps & {
    activitySession?: ActivitySessionProps
    onSubmit?: (
      setLoading: React.Dispatch<React.SetStateAction<boolean>>,
      setVisible: React.Dispatch<React.SetStateAction<boolean>>,
      values: any,
    ) => void
  }
const ActivitySessionAdminModal: React.FC<ActivitySessionAdminModalProps> = ({
  form,
  activitySession,
  onSubmit,
  ...props
}) => {
  const [loading, setLoading] = useState(false)
  const [withThreshold, setWithThreshold] = useState<boolean>(
    !!activitySession && typeof activitySession.threshold === 'number',
  )

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      if (onSubmit) {
        onSubmit(setLoading, setVisible, {
          ...values,
          activitySessionId: activitySession ? activitySession.id : undefined,
          description: null,
          threshold: withThreshold ? values.threshold : null,
        })
      }
    })
  }

  return (
    <AdminModal
      icon={!activitySession ? <Icon type="file-add" /> : <Icon type="edit" />}
      title="場次"
      maskClosable={false}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            取消
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleSubmit(setVisible)}>
            確定
          </Button>
        </>
      )}
      {...props}
    >
      <Form hideRequiredMark>
        <Form.Item label="場次名稱" colon={false}>
          {form.getFieldDecorator('title', {
            rules: [{ required: true, message: '請輸入名稱' }],
            initialValue: activitySession ? activitySession.title : '',
          })(<Input />)}
        </Form.Item>
        <Form.Item label="開始時間" colon={false}>
          {form.getFieldDecorator('startedAt', {
            rules: [{ required: true, message: '請選擇開始時間' }],
            initialValue: activitySession ? moment(activitySession.startedAt) : null,
          })(
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              disabledDate={current => !!current && current < moment().startOf('day')}
            />,
          )}
        </Form.Item>
        <Form.Item label="結束時間" colon={false}>
          {form.getFieldDecorator('endedAt', {
            rules: [{ required: true, message: '請選擇結束時間' }],
            initialValue: activitySession ? moment(activitySession.endedAt) : null,
          })(
            <DatePicker
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
              disabledDate={current => !!current && current < moment().startOf('day')}
            />,
          )}
        </Form.Item>
        <Form.Item label="地址" colon={false}>
          {form.getFieldDecorator('location', {
            rules: [{ required: true, message: '請輸入地址' }],
            initialValue: activitySession ? activitySession.location : '',
          })(<Input />)}
        </Form.Item>

        <Checkbox defaultChecked={withThreshold} onChange={e => setWithThreshold(e.target.checked)}>
          最少人數
        </Checkbox>
        <Form.Item className={withThreshold ? 'd-block' : 'd-none'}>
          {form.getFieldDecorator('threshold', {
            initialValue: activitySession && activitySession.threshold ? activitySession.threshold : 0,
          })(<InputNumber min={0} />)}
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default Form.create<ActivitySessionAdminModalProps>()(ActivitySessionAdminModal)
