import { useForm } from 'antd/lib/form/Form'
import { CloseOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Dropdown, Form, Input, InputNumber, Menu, Modal, Radio, Select, message, Space } from 'antd'
import { Flex } from '@chakra-ui/react'
import { useIntl } from 'react-intl'
import DisplayModeSelector, { DisplayMode } from './DisplayModeSelector'
import { DeepPick } from 'ts-deep-pick'
import { ProgramContent } from '../../types/program'
import programMessages from './translation'
import { useMutateProgramContent } from '../../hooks/program'
import { handleError } from '../../helpers'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useState } from 'react'
import { commonMessages } from '../../helpers/translation'
import moment, { Moment } from 'moment'

type FieldProps = {
  title: string
  link: {
    type: string
    url: string
  }[]
  ratio: number
  isOn: boolean
  displayMode: DisplayMode
  publishedAt: Moment
  assessmentId: string
}

const linkMap = {
  accessLinks: 'test',
}

const transformParameters = (parameters: { [key: string]: [] }, linkMap: { [key: string]: string }) => {
  if (!parameters) return
  const result = []
  for (const [key, values] of Object.entries(parameters)) {
    if (linkMap[key] && Array.isArray(values)) {
      result.push(...values.map(value => ({ type: linkMap[key], url: value })))
    }
  }
  return result || []
}

const ExternalLinkAdminModalBlock: React.FC<{
  programContent: DeepPick<ProgramContent, '!videos'> &
    DeepPick<ProgramContent, 'videos.[].id' | 'videos.[].size' | 'videos.[].duration' | 'videos.[].options'>
  displayMode: DisplayMode
  programContentId: string
  onDisplayModeChange: (displayMode: DisplayMode) => void
  onRefetch?: () => void
  onClose: () => void
}> = ({ programContent, displayMode, programContentId, onDisplayModeChange, onClose, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { settings } = useApp()
  const [loading, setLoading] = useState(false)
  const { updateProgramContent, updateProgramContentBody, deleteProgramContent } = useMutateProgramContent()
  const [form] = useForm()

  let linkTypeOptions: { id: string; name: string }[] = []
  if (!!settings['trigger.program_content']) {
    try {
      const triggerProgramContentSettings: {
        name: string
        display: string
        parameters: { name: string; type: string; display: string }[]
        testTypeOptions: { id: string; name: string }[]
      }[] = JSON.parse(settings['trigger.program_content'])
      linkTypeOptions =
        triggerProgramContentSettings.find(item => item.name === 'externalTestRequirement')?.testTypeOptions || []
    } catch (err) {
      console.error(err)
    }
  }

  const transformedData = transformParameters(programContent?.programContentBody?.data?.parameters, linkMap)

  const handleSubmit = async (values: FieldProps) => {
    setLoading(true)
    try {
      await updateProgramContent({
        variables: {
          programContentId,
          programContentBodyId: programContent?.programContentBody.id,
          title: values.title || '',
          isNotifyUpdate: false,
          pinnedStatus: false,
          displayMode: values.displayMode,
          publishedAt: values.publishedAt
            ? values.publishedAt.toDate()
            : values.displayMode !== 'conceal'
            ? new Date()
            : null,
        },
      })
      await updateProgramContentBody({
        variables: {
          programContentId,
          data: {
            trigger: 'externalTestRequirement',
            parameters: {
              assessmentId: values.assessmentId,
              accessLinks: values.link.filter(item => item.type === 'test').map(item => item.url),
              programPackageCompleteRatio: values.ratio,
            },
            isOn: values.isOn,
          },
          type: 'link',
        },
      })
      onRefetch?.()
      setLoading(false)
      onClose()
      form.resetFields()
      message.success(formatMessage(commonMessages.event.successfullySaved))
      Modal.destroyAll()
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          title: programContent.title || '',
          assessmentId: programContent?.programContentBody?.data?.parameters?.assessmentId,
          displayMode: programContent.displayMode,
          isOn: programContent?.programContentBody?.data?.isOn ?? true,
          ratio: programContent?.programContentBody?.data?.parameters?.programPackageCompleteRatio || 0,
          publishedAt: programContent.publishedAt ? moment(programContent.publishedAt) : moment().startOf('minute'),
          link: transformedData || [{ amount: 1 }],
        }}
        onFinish={handleSubmit}
      >
        <Flex
          alignItems={{ base: 'flex-end', md: 'center' }}
          justifyContent="space-between"
          marginBottom="16px"
          flexDirection={{ base: 'column-reverse', md: 'row' }}
        >
          <Flex flexWrap="wrap" gridGap="2">
            {programContent.displayMode && (
              <DisplayModeSelector
                contentType="exam"
                displayMode={displayMode}
                onDisplayModeChange={onDisplayModeChange}
              />
            )}
          </Flex>
          <Flex alignItems="center" marginBottom={{ base: '12px', md: '0' }}>
            <Button
              onClick={() => {
                form.resetFields()
                onClose()
                Modal.destroyAll()
              }}
              className="mr-2"
            >
              {formatMessage(programMessages['*'].cancel)}
            </Button>
            <Button type="primary" htmlType="submit" className="mr-2" loading={!!loading}>
              {formatMessage(programMessages['*'].save)}
            </Button>
            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              overlayStyle={{ zIndex: 9999 }}
              overlay={
                <Menu>
                  <Menu.Item
                    onClick={() => {
                      window.confirm(formatMessage(programMessages.ProgramContentAdminModal.deleteContentWarning)) &&
                        deleteProgramContent({ variables: { programContentId: programContentId } })
                          .then(() => {
                            onRefetch?.()
                          })
                          .catch(err => handleError(err))
                    }}
                  >
                    {formatMessage(programMessages['*'].deleteContent)}
                  </Menu.Item>
                </Menu>
              }
            >
              <MoreOutlined />
            </Dropdown>
          </Flex>
        </Flex>

        <Form.Item label={formatMessage(programMessages.ExternalLinkForm.title)} name="title">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(programMessages.ExternalLinkForm.examLink)} name="assessmentId">
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(programMessages.ExternalLinkForm.links)}>
          <Form.List name="link">
            {(fields, { add, remove }) => (
              <div>
                {fields.map(field => (
                  <Space key={field.key} className="d-flex align-items-center justify-content-start">
                    <Form.Item
                      label={field.key === 0 ? formatMessage(programMessages.ExternalLinkForm.typeLabel) : undefined}
                      name={[field.name, 'type']}
                      fieldKey={[field.key, 'type']}
                    >
                      {linkTypeOptions.length > 0 && (
                        <Select style={{ width: '200px' }}>
                          {linkTypeOptions.map(option => (
                            <Select.Option value={option.id} key={option.id}>
                              {option.name}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                    <Form.Item
                      label={field.key === 0 ? formatMessage(programMessages.ExternalLinkForm.linkLabel) : undefined}
                      name={[field.name, 'url']}
                      fieldKey={[field.key, 'url']}
                    >
                      <Input />
                    </Form.Item>

                    {fields.length > 1 && (
                      <div className={field.key === 0 ? 'mt-2 ml-2' : 'mb-4 ml-2'}>
                        <CloseOutlined className="cursor-pointer" onClick={() => remove(field.name)} />
                      </div>
                    )}
                  </Space>
                ))}

                <Button icon={<PlusOutlined />} onClick={() => add({ amount: 1 })} disabled={!!loading}>
                  {formatMessage(programMessages['*'].add)}
                </Button>
              </div>
            )}
          </Form.List>
        </Form.Item>
        <Form.Item label={formatMessage(programMessages.ExternalLinkForm.programPackageCompleteRatio)} name="ratio">
          <InputNumber min={0} max={100} formatter={value => `${value}%`} />
        </Form.Item>
        <Form.Item label={formatMessage(programMessages.ExternalLinkForm.isOn)} name="isOn">
          <Radio.Group>
            <Radio value={true}>{formatMessage(programMessages['*'].on)}</Radio>
            <Radio value={false}>{formatMessage(programMessages['*'].off)}</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </>
  )
}

export default ExternalLinkAdminModalBlock
