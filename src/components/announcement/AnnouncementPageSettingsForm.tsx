import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { commonMessages } from 'lodestar-app-element/src/helpers/translation'
import { useIntl } from 'react-intl'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'
import { AnnouncementPage } from '../../types/announcement'
import announcementMessages from './translations'

const StyledNewPathInput = styled.div`
  width: 80%;
  display: flex;
  align-items: center;
  gap: 12px;
`

type FieldProps = { pathList: string[] }

type AnnouncementPageSettingsFormProps = {
  announcementPages: AnnouncementPage[]
  saveLoading: boolean
  onSave: (values: Pick<AnnouncementPage, 'announcementId' | 'path'>[]) => void
}

const AnnouncementPageSettingsForm = ({
  announcementPages,
  onSave,
  saveLoading,
}: AnnouncementPageSettingsFormProps) => {
  const { announcementId } = useParams<{ announcementId: string }>()
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const handleSubmit = async () => {
    await form.validateFields()
    const values = form.getFieldsValue()
    onSave(values.pathList.map(path => ({ announcementId, path })))
  }

  return (
    <Form
      form={form}
      colon={false}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 12 } }}
      initialValues={{ pathList: announcementPages.map(page => page.path) }}
      onFinish={handleSubmit}
    >
      <Form.Item label={formatMessage(announcementMessages.AnnouncementPageSettingsForm.path)} name="pathList">
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
        <span>{formatMessage(announcementMessages.AnnouncementPageSettingsForm.addNewPath)}</span>
      </Button>
    </>
  )
}

export default AnnouncementPageSettingsForm
