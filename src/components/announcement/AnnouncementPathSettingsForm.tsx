import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, Input, Radio } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { commonMessages } from 'lodestar-app-element/src/helpers/translation'
import { useEffect, useState } from 'react'
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
      path: isChecked ? [] : values.pathList,
    })
  }

  return (
    <Form
      form={form}
      colon={false}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 12 } }}
      initialValues={{
        isUniversalDisplay: isChecked,
        pathList: announcement.announcementPages.map(page => page.path),
      }}
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
            if (e.target.checked) {
              form.setFieldsValue({ pathList: [] })
            }
          }}
        />
      </Form.Item>

      {!isChecked && (
        <Form.Item label={formatMessage(announcementMessages.AnnouncementPathSettingsForm.path)} name="pathList">
          <PathInput />
        </Form.Item>
      )}

      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button
          className="mr-2"
          onClick={() => {
            form.resetFields()
            setIsChecked(announcement.isUniversalDisplay)
          }}
        >
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={saveLoading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const PathInput: React.FC<{ value?: string[]; onChange?: (value: string[]) => void }> = ({ value = [], onChange }) => {
  const { formatMessage } = useIntl()
  const [radioValues, setRadioValues] = useState<string[]>(
    value?.map(path => (path.endsWith('*') ? 'contains' : 'exactMatch')) || [],
  )

  const handleRadioChange = (index: number, e: any) => {
    const newRadioValues = [...radioValues]
    const newValue = [...value]
    newRadioValues[index] = e.target.value
    if (e.target.value === 'contains' && !newValue[index].includes('*')) {
      newValue[index] += '*'
    } else if (e.target.value === 'exactMatch') {
      newValue[index] = newValue[index].replace('*', '')
    }
    setRadioValues(newRadioValues)
    onChange && onChange(newValue)
  }

  useEffect(() => {
    const initialRadioValues = value.map(path => (path.endsWith('*') ? 'contains' : 'exactMatch'))
    setRadioValues(initialRadioValues)
  }, [value])

  return (
    <>
      {value?.map((path, index) => (
        <div className="mb-3 position-relative" key={index}>
          <StyledNewPathInput>
            <Input.Group compact style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Radio.Group
                onChange={e => handleRadioChange(index, e)}
                value={radioValues[index]}
                style={{ display: 'flex', gap: '10px' }}
              >
                <Radio value="contains">
                  {formatMessage(announcementMessages.AnnouncementPathSettingsForm.contains)}
                </Radio>
                <Radio value="exactMatch">
                  {formatMessage(announcementMessages.AnnouncementPathSettingsForm.exactMatch)}
                </Radio>
              </Radio.Group>
              <Input
                className={'mr-3 mb-0'}
                value={path}
                onChange={e => {
                  const newValue = [...value]
                  newValue.splice(index, 1, e.target.value.trim())
                  onChange && onChange(newValue)
                }}
              />
            </Input.Group>
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
          const newValue = [...(value || ''), '']
          const newRadioValues = [...radioValues, 'contains']
          setRadioValues(newRadioValues)
          onChange && onChange(newValue)
        }}
      >
        <span>{formatMessage(announcementMessages.AnnouncementPathSettingsForm.addNewPath)}</span>
      </Button>
    </>
  )
}

export default AnnouncementPathSettingsForm
