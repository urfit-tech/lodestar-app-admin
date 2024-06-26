import { Button, DatePicker, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import { commonMessages } from 'lodestar-app-element/src/helpers/translation'
import { PeriodType } from 'lodestar-app-element/src/types/data'
import moment from 'moment'
import { useIntl } from 'react-intl'
import { Announcement } from '../../types/announcement'
import AdminBraftEditor from '../form/AdminBraftEditor'
import PeriodSelector from '../form/PeriodSelector'
import announcementMessages from './translations'

type FieldProps = {
  title: string
  content: EditorState
  period: { type: PeriodType; amount: number }
  startedAt: Date | null
  endedAt: Date | null
}

type AnnouncementBasicSettingsFormProps = {
  announcement: Announcement
  onSave: (
    data: Pick<
      Announcement,
      'id' | 'title' | 'content' | 'remindPeriodAmount' | 'remindPeriodType' | 'startedAt' | 'endedAt'
    >,
  ) => void
  saveLoading: boolean
}

const AnnouncementBasicSettingsForm = ({ announcement, onSave, saveLoading }: AnnouncementBasicSettingsFormProps) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const handleSubmit = async () => {
    await form.validateFields()
    const values = form.getFieldsValue()
    const updatedData = {
      id: announcement.id,
      title: values.title,
      content: values.content?.getCurrentContent().hasText() ? values.content.toHTML() : null,
      startedAt: values.startedAt || null,
      endedAt: values.endedAt || null,
      remindPeriodAmount: values.period?.amount,
      remindPeriodType: values.period?.type,
    }
    onSave(updatedData)
  }

  return (
    <Form
      form={form}
      colon={false}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 10 } }}
      initialValues={{
        title: announcement.title,
        content: BraftEditor.createEditorState(announcement.content),
        period: {
          amount: announcement.remindPeriodAmount || 1,
          type: announcement.remindPeriodType || 'D',
        },
        startedAt: announcement.startedAt ? moment(announcement.startedAt) : null,
        endedAt: announcement.endedAt ? moment(announcement.endedAt) : null,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        label={formatMessage(announcementMessages.AnnouncementBasicSettingsForm.announcementTitle)}
        name="title"
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={formatMessage(announcementMessages.AnnouncementBasicSettingsForm.announcementContent)}
        wrapperCol={{ md: { span: 20 } }}
        name="content"
      >
        <AdminBraftEditor />
      </Form.Item>
      <Form.Item label={formatMessage(announcementMessages.AnnouncementBasicSettingsForm.startTime)} name="startedAt">
        <DatePicker format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label={formatMessage(announcementMessages.AnnouncementBasicSettingsForm.endTime)} name="endedAt">
        <DatePicker format="YYYY-MM-DD HH:mm" showTime={{ format: 'HH:mm' }} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        label={formatMessage(announcementMessages.AnnouncementBasicSettingsForm.nextTimeRemindPeriod)}
        name="period"
      >
        <PeriodSelector />
      </Form.Item>
      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button className="mr-2" onClick={() => form.resetFields()}>
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={saveLoading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

export default AnnouncementBasicSettingsForm
