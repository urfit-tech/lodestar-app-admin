import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { commonMessages } from 'lodestar-app-element/src/helpers/translation'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { Announcement } from '../../types/announcement'
import announcementMessages from './translations'

const StyledNewPathInput = styled.div`
  width: 80%;
  display: flex;
  align-items: center;
  gap: 12px;
`

type FieldProps = { pathList: string[]; isUniversalDisplay: boolean }

type AnnouncementPathSettingsFormProps = {
  announcement: Announcement
  saveLoading: boolean
  onSave: (data: Pick<Announcement, 'id' | 'isUniversalDisplay'> & { path: string[] }) => void
}

const AnnouncementPathSettingsForm = ({ announcement, onSave, saveLoading }: AnnouncementPathSettingsFormProps) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [isChecked, setIsChecked] = useState(announcement.isUniversalDisplay)

  const handleSubmit = async () => {
    await form.validateFields()
    const values = form.getFieldsValue()
    onSave({
      id: announcement.id,
      isUniversalDisplay: isChecked,
      path: values.pathList,
    })
  }

  return (
    <Form
      form={form}
      colon={false}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 12 } }}
      initialValues={{ isUniversalDisplay: isChecked, pathList: announcement.announcementPages.map(page => page.path) }}
      onFinish={handleSubmit}
    >
      <Form.Item
        label={formatMessage(announcementMessages.AnnouncementBasicSettingsForm.isSiteWideAnnouncement)}
        name="isUniversalDisplay"
      >
        <Checkbox
          checked={isChecked}
          onChange={e => {
            setIsChecked(e.target.checked)
          }}
        />
      </Form.Item>
      <Form.Item label={formatMessage(announcementMessages.AnnouncementPathSettingsForm.path)} name="pathList">
        <PathInput />
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

const PathInput: React.FC<{ value?: string[]; onChange?: (value: string[]) => void }> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()

  return (
    <>
      {value?.map((phone, index) => (
        <div className="mb-3 position-relative">
          <StyledNewPathInput>
            <Input
              key={index}
              className={'mr-3 mb-0'}
              value={phone}
              onChange={e => {
                const newValue = [...value]
                newValue.splice(index, 1, e.target.value.trim())
                onChange && onChange(newValue)
              }}
            />
            <CloseOutlined
              onClick={() => {
                const newValue = [...value]
                newValue.splice(index, 1)
                onChange && onChange(newValue)
              }}
            />
          </StyledNewPathInput>
        </div>
      ))}
      <Button
        icon={<PlusOutlined />}
        type="link"
        onClick={() => {
          if (value) {
            const newValue = [...value]
            newValue.splice(newValue.length, 0, '')
            onChange && onChange(newValue)
          }
        }}
      >
        <span>{formatMessage(announcementMessages.AnnouncementPathSettingsForm.addNewPath)}</span>
      </Button>
    </>
  )
}

export default AnnouncementPathSettingsForm
