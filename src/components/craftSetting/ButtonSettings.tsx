import { useNode } from '@craftjs/core'
import { Checkbox, Form, Input, Radio, Space } from 'antd'
import Collapse, { CollapseProps } from 'antd/lib/collapse'
import { useForm } from 'antd/lib/form/Form'
import { CraftButtonProps } from 'lodestar-app-element/src/types/craft'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../helpers/translation'
import ColorPickerBlock from './ColorPickerBlock'
import { AdminHeaderTitle, CraftSettingLabel, StyledCollapsePanel, StyledUnderLineInput } from './styled'

type FieldProps = CraftButtonProps

const ButtonSetting: React.VFC<CollapseProps> = ({ ...collapseProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props as CraftButtonProps,
    selected: node.events.selected,
  }))

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        setProp((props: CraftButtonProps) => {
          props.title = values.title
          props.link = values.link
          props.openNewTab = values.openNewTab
          props.size = values.size
          props.align = values.align
          props.block = values.block
          props.variant = values.variant
          props.color = values.color
          props.outlineColor = values.outlineColor
          props.backgroundColor = values.backgroundType === 'solidColor' ? values.backgroundColor : undefined
          props.backgroundType = values.backgroundType
        })
      })
      .catch(() => {})
  }

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={{
        title: props.title || '',
        link: props.link || '',
        openNewTab: props.openNewTab || false,
        size: props.size || 'md',
        block: props.block || false,
        align: props.align || 'start',
        variant: props.variant || 'solid',
        color: props.color || '#585858',
        outlineColor: props.outlineColor,
        backgroundColor: props.backgroundColor,
        backgroundType: props.backgroundType || 'none',
      }}
      onValuesChange={handleChange}
    >
      <Collapse
        {...collapseProps}
        className="mt-2 p-0"
        bordered={false}
        expandIconPosition="right"
        ghost
        defaultActiveKey={['buttonSetting']}
      >
        <StyledCollapsePanel
          key="buttonSetting"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.buttonSetting)}</AdminHeaderTitle>}
        >
          <Form.Item
            name="title"
            label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.title)}</CraftSettingLabel>}
          >
            <Input className="mt-2" value={props.title} />
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
      </Collapse>

      <Collapse
        {...collapseProps}
        className="mt-4 p-0"
        bordered={false}
        expandIconPosition="right"
        ghost
        defaultActiveKey={['buttonStyle']}
      >
        <StyledCollapsePanel
          key="buttonStyle"
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

          <Form.Item
            name="variant"
            label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.variant)}</CraftSettingLabel>}
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="text">{formatMessage(craftPageMessages.label.plainText)}</Radio>
                <Radio value="solid">{formatMessage(craftPageMessages.label.coloring)}</Radio>
                <Radio value="outline">{formatMessage(craftPageMessages.label.outline)}</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item name="color" noStyle={props.variant !== 'text'}>
            {props.variant === 'text' && <ColorPickerBlock />}
          </Form.Item>

          <Form.Item name="outlineColor" noStyle={props.variant !== 'outline'}>
            {props.variant === 'outline' && <ColorPickerBlock />}
          </Form.Item>
        </StyledCollapsePanel>
      </Collapse>
      <Form.Item
        name="backgroundType"
        label={formatMessage(craftPageMessages.label.background)}
        noStyle={props.variant !== 'solid'}
      >
        {props.variant === 'solid' && (
          <Radio.Group buttonStyle="solid">
            <Radio.Button value="none">{formatMessage(craftPageMessages.ui.empty)}</Radio.Button>
            <Radio.Button value="solidColor">{formatMessage(craftPageMessages.ui.solidColor)}</Radio.Button>
          </Radio.Group>
        )}
      </Form.Item>
      <Form.Item name="backgroundColor" noStyle={props.variant !== 'solid' && props.backgroundType !== 'solidColor'}>
        {props.variant === 'solid' && props.backgroundType === 'solidColor' && <ColorPickerBlock />}
      </Form.Item>
    </Form>
  )
}

export default ButtonSetting
