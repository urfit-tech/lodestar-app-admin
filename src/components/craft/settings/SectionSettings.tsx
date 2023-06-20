import { Checkbox, Collapse, Input, Radio } from 'antd'
import Form from 'antd/lib/form/'
import { useForm } from 'antd/lib/form/Form'
import { SectionProps } from 'lodestar-app-element/src/components/common/Section'
import { useIntl } from 'react-intl'
import {
  CraftElementSettings,
  CraftSettingLabel,
  StyledCollapsePanel,
  StyledUnderLineInput,
} from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import { AdminHeaderTitle } from '../../admin'
import BackgroundStyleInput from '../inputs/BackgroundStyleInput'
import BorderStyleInput from '../inputs/BorderStyleInput'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import craftMessages from '../translation'

const SectionSettings: CraftElementSettings<SectionProps> = ({ props, onPropsChange }) => {
  const [form] = useForm()
  const { formatMessage } = useIntl()
  const handleChange = () => {
    form.validateFields()
  }
  let horizontalAlign, verticalAlign
  if (props.horizontal) {
    horizontalAlign =
      props.customStyle?.justifyContent === 'start'
        ? 'left'
        : props.customStyle?.justifyContent === 'end'
        ? 'right'
        : props.customStyle?.justifyContent === 'center'
        ? 'center'
        : 'none'
    verticalAlign =
      props.customStyle?.alignItems === 'start'
        ? 'top'
        : props.customStyle?.alignItems === 'end'
        ? 'bottom'
        : props.customStyle?.alignItems === 'center'
        ? 'center'
        : 'none'
  } else {
    horizontalAlign =
      props.customStyle?.alignItems === 'start'
        ? 'left'
        : props.customStyle?.alignItems === 'end'
        ? 'right'
        : props.customStyle?.alignItems === 'center'
        ? 'center'
        : 'none'
    verticalAlign =
      props.customStyle?.justifyContent === 'start'
        ? 'top'
        : props.customStyle?.justifyContent === 'end'
        ? 'bottom'
        : props.customStyle?.justifyContent === 'center'
        ? 'center'
        : 'none'
  }
  return (
    <Form form={form} layout="vertical" colon={false} requiredMark={false} onValuesChange={handleChange}>
      <Form.Item>
        <Radio.Group
          buttonStyle="solid"
          value={props.display ? props.display : 'normal'}
          onChange={e => onPropsChange?.({ ...props, display: e.target.value })}
        >
          <Radio.Button value="normal">{formatMessage(craftMessages.SectionSettings.normal)}</Radio.Button>
          <Radio.Button value="hide">{formatMessage(craftMessages.SectionSettings.hide)}</Radio.Button>
          <Radio.Button value="appearAfterLogin">
            {formatMessage(craftMessages.SectionSettings.appearAfterLogin)}
          </Radio.Button>
          <Radio.Button value="disappearAfterLogin">
            {formatMessage(craftMessages.SectionSettings.disappearAfterLogin)}
          </Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item>
        <Radio.Group
          buttonStyle="solid"
          value={props.horizontal ? 'horizontal' : 'vertical'}
          onChange={e => onPropsChange?.({ ...props, horizontal: e.target.value === 'horizontal' })}
        >
          <Radio.Button value="horizontal">{formatMessage(craftMessages.SectionSettings.horizontal)}</Radio.Button>
          <Radio.Button value="vertical">{formatMessage(craftMessages.SectionSettings.vertical)}</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label={formatMessage(craftMessages.SectionSettings.horizontalAlign)}>
        <Radio.Group
          buttonStyle="solid"
          value={horizontalAlign}
          onChange={e =>
            onPropsChange?.({
              ...props,
              customStyle: {
                ...props.customStyle,
                justifyContent: props.horizontal
                  ? e.target.value === 'left'
                    ? 'start'
                    : e.target.value === 'right'
                    ? 'end'
                    : e.target.value === 'center'
                    ? 'center'
                    : e.target.value === 'none'
                    ? 'initial'
                    : undefined
                  : props.customStyle?.justifyContent,
                alignItems: props.horizontal
                  ? props.customStyle?.alignItems
                  : e.target.value === 'left'
                  ? 'start'
                  : e.target.value === 'right'
                  ? 'end'
                  : e.target.value === 'center'
                  ? 'center'
                  : e.target.value === 'none'
                  ? 'initial'
                  : undefined,
              },
            })
          }
        >
          <Radio.Button value="none">{formatMessage(craftMessages.SectionSettings.none)}</Radio.Button>
          <Radio.Button value="left">{formatMessage(craftMessages.SectionSettings.left)}</Radio.Button>
          <Radio.Button value="center">{formatMessage(craftMessages.SectionSettings.center)}</Radio.Button>
          <Radio.Button value="right">{formatMessage(craftMessages.SectionSettings.right)}</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item label={formatMessage(craftMessages.SectionSettings.verticalAlign)}>
        <Radio.Group
          buttonStyle="solid"
          value={verticalAlign}
          onChange={e =>
            onPropsChange?.({
              ...props,
              customStyle: {
                ...props.customStyle,
                justifyContent: props.horizontal
                  ? props.customStyle?.justifyContent
                  : e.target.value === 'top'
                  ? 'start'
                  : e.target.value === 'bottom'
                  ? 'end'
                  : e.target.value === 'center'
                  ? 'center'
                  : e.target.value === 'none'
                  ? 'initial'
                  : undefined,
                alignItems: props.horizontal
                  ? e.target.value === 'top'
                    ? 'start'
                    : e.target.value === 'bottom'
                    ? 'end'
                    : e.target.value === 'center'
                    ? 'center'
                    : e.target.value === 'none'
                    ? 'initial'
                    : undefined
                  : props.customStyle?.alignItems,
              },
            })
          }
        >
          <Radio.Button value="none">{formatMessage(craftMessages.SectionSettings.none)}</Radio.Button>
          <Radio.Button value="top">{formatMessage(craftMessages.SectionSettings.top)}</Radio.Button>
          <Radio.Button value="center">{formatMessage(craftMessages.SectionSettings.center)}</Radio.Button>
          <Radio.Button value="bottom">{formatMessage(craftMessages.SectionSettings.bottom)}</Radio.Button>
        </Radio.Group>
      </Form.Item>
      <Form.Item
        className="m-0"
        label={<CraftSettingLabel>{formatMessage(craftMessages.SectionSettings.link)}</CraftSettingLabel>}
      >
        <StyledUnderLineInput
          className="mb-2"
          placeholder="https://"
          value={props.link}
          onChange={e => onPropsChange?.({ ...props, link: e.target.value })}
        />
      </Form.Item>
      <Form.Item valuePropName="checked">
        <Checkbox checked={props.openTab} onChange={e => onPropsChange?.({ ...props, openTab: e.target.checked })}>
          {formatMessage(craftMessages.SectionSettings.openNewTab)}
        </Checkbox>
      </Form.Item>
      <Form.Item>
        <SpaceStyleInput
          value={props.customStyle}
          onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
        />
      </Form.Item>
      <Form.Item>
        <BorderStyleInput
          value={props.customStyle}
          onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
        />
      </Form.Item>
      <Form.Item>
        <BackgroundStyleInput
          value={props.customStyle}
          onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
        />
      </Form.Item>
      <Collapse ghost expandIconPosition="right" defaultActiveKey="buttonSetting">
        <StyledCollapsePanel
          key="advancedSetting"
          header={<AdminHeaderTitle>{formatMessage(craftMessages['*'].advancedSetting)}</AdminHeaderTitle>}
        >
          <Form.Item
            label={<CraftSettingLabel>{formatMessage(craftMessages.SectionSettings.sectionId)}</CraftSettingLabel>}
          >
            <Input value={props.id} onChange={e => onPropsChange?.({ ...props, id: e.target.value })} />
          </Form.Item>
          <Form.Item label={<CraftSettingLabel>{formatMessage(craftMessages['*'].className)}</CraftSettingLabel>}>
            <Input
              className="mt-2"
              value={props.className}
              onChange={e => onPropsChange?.({ ...props, className: e.target.value.toString() })}
            />
          </Form.Item>
        </StyledCollapsePanel>
      </Collapse>
    </Form>
  )
}

export default SectionSettings
