import { CloseOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Checkbox, Form, Input, Radio } from 'antd'
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

  const getInitialPathMatchTypes = (paths: string[]) =>
    paths.map(path => (path.endsWith('*') ? 'contains' : 'exactMatch'))

  const [pathMatchTypes, setPathMatchTypes] = useState<string[]>(() => getInitialPathMatchTypes(value))

  const handleRadioChange = (index: number, e: any) => {
    const updatedPathMatchTypes = [...pathMatchTypes]
    const updatedPaths = [...value]
    updatedPathMatchTypes[index] = e.target.value
    if (e.target.value === 'contains' && !updatedPaths[index].includes('*')) {
      updatedPaths[index] += '*'
    } else if (e.target.value === 'exactMatch') {
      updatedPaths[index] = updatedPaths[index].replace('*', '')
    }
    setPathMatchTypes(updatedPathMatchTypes)
    onChange && onChange(updatedPaths)
  }

  return (
    <>
      {value?.map((path, index) => (
        <div className="mb-3 position-relative" key={index}>
          <StyledNewPathInput>
            <Input.Group compact style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Radio.Group
                onChange={e => handleRadioChange(index, e)}
                value={pathMatchTypes[index]}
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
                  const updatedPaths = [...value]
                  updatedPaths.splice(index, 1, e.target.value.trim())
                  onChange && onChange(updatedPaths)
                }}
              />
            </Input.Group>
            <CloseOutlined
              onClick={() => {
                const pathsAfterDeletion = [...value]
                pathsAfterDeletion.splice(index, 1)
                onChange && onChange(pathsAfterDeletion)
              }}
            />
          </StyledNewPathInput>
        </div>
      ))}
      <Button
        icon={<PlusOutlined />}
        type="link"
        onClick={() => {
          const newPaths = [...value, '']
          const newPathMatchTypes = [...pathMatchTypes, 'exactMatch']
          setPathMatchTypes(newPathMatchTypes)
          onChange && onChange(newPaths)
        }}
      >
        <span>{formatMessage(announcementMessages.AnnouncementPathSettingsForm.addNewPath)}</span>
      </Button>
    </>
  )
}

export default AnnouncementPathSettingsForm
