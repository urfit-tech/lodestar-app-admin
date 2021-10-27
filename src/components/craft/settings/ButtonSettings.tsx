import { Checkbox, Form, Input, Radio, Space } from 'antd'
import Collapse from 'antd/lib/collapse'
import { useForm } from 'antd/lib/form/Form'
import { ButtonProps } from 'lodestar-app-element/src/components/buttons/Button'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { craftPageMessages } from '../../../helpers/translation'
import { AdminHeaderTitle } from '../../admin'
import CustomStyleInput from '../inputs/CustomStyleInput'
import { CraftSettingLabel, CraftSettings, StyledCollapsePanel, StyledUnderLineInput } from './CraftSettings'

type FieldValues = {
  title: string
  link: string | null
  openNewTab: boolean
  block: boolean
  size: ButtonProps['size']
  variant: ButtonProps['variant']
  customStyle: CSSObject
}

const ButtonSettings: CraftSettings<ButtonProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldValues>()

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        onPropsChange?.({
          title: values.title,
          link: values.link || undefined,
          openNewTab: values.openNewTab,
          size: values.size,
          block: values.block,
          variant: values.variant,
          customStyle: values.customStyle,
        })
      })
      .catch(() => {})
  }

  const initialValues: FieldValues = {
    title: props.title,
    link: props.link || null,
    openNewTab: props.openNewTab || false,
    size: props.size,
    block: props.block || false,
    variant: props.variant,
    customStyle: props.customStyle || {},
  }
  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={initialValues}
      onValuesChange={handleChange}
    >
      <Collapse accordion ghost expandIconPosition="right" defaultActiveKey="buttonSetting">
        <StyledCollapsePanel
          key="buttonSetting"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.buttonSetting)}</AdminHeaderTitle>}
        >
          <Form.Item
            name="title"
            label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.title)}</CraftSettingLabel>}
          >
            <Input className="mt-2" />
          </Form.Item>

          <Form.Item
            className="m-0"
            name="link"
            label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.link)}</CraftSettingLabel>}
          >
            <StyledUnderLineInput className="mb-2" placeholder="https://" />
          </Form.Item>
          <Form.Item name="openNewTab" valuePropName="checked">
            <Checkbox>{formatMessage(craftPageMessages.label.openNewTab)}</Checkbox>
          </Form.Item>
        </StyledCollapsePanel>
        <StyledCollapsePanel
          key="buttonStyleExtra"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.buttonStyle)}</AdminHeaderTitle>}
        >
          <Form.Item className="mb-2">
            <Form.Item
              name="align"
              label={
                <CraftSettingLabel className="mb-1">
                  {formatMessage(craftPageMessages.label.textAlign)}
                </CraftSettingLabel>
              }
              style={{ display: 'inline-block' }}
            >
              <Radio.Group buttonStyle="solid">
                <Space direction="vertical">
                  <Radio value="start">{formatMessage(craftPageMessages.label.left)}</Radio>
                  <Radio value="center">{formatMessage(craftPageMessages.label.center)}</Radio>
                  <Radio value="end">{formatMessage(craftPageMessages.label.right)}</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              name="size"
              className="ml-4"
              label={
                <CraftSettingLabel className="mb-1">{formatMessage(craftPageMessages.label.size)}</CraftSettingLabel>
              }
              style={{ display: 'inline-block' }}
            >
              <Radio.Group>
                <Space direction="vertical">
                  <Radio value="lg">{formatMessage(craftPageMessages.label.large)}</Radio>
                  <Radio value="md">{formatMessage(craftPageMessages.label.middle)}</Radio>
                  <Radio value="sm">{formatMessage(craftPageMessages.label.small)}</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          </Form.Item>
          <Form.Item
            name="block"
            valuePropName="checked"
            label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.width)}</CraftSettingLabel>}
          >
            <Checkbox>{formatMessage(craftPageMessages.label.buttonBlock)}</Checkbox>
          </Form.Item>
        </StyledCollapsePanel>
        <StyledCollapsePanel
          key="buttonStyle"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.buttonStyle)}</AdminHeaderTitle>}
        >
          <Form.Item name="customStyle">
            <CustomStyleInput space border background typography />
          </Form.Item>
        </StyledCollapsePanel>
      </Collapse>
    </Form>
  )
}

export default ButtonSettings
