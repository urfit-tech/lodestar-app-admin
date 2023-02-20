import { Collapse, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { CollapseProps } from 'lodestar-app-element/src/components/collapses/Collapse'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import {
  CraftElementSettings,
  CraftSettingLabel,
  StyledCollapsePanel,
} from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import { AdminHeaderTitle } from '../../admin'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import TypographyStyleInput from '../inputs/TypographyStyleInput'
import craftMessages from '../translation'

type FieldProps = {
  spaceStyle: CSSObject
  borderStyle: CSSObject
  backgroundStyle: CSSObject

  titleStyle: {
    spaceStyle: CSSObject
    borderStyle: CSSObject
    backgroundStyle: CSSObject
  }

  paragraphStyle: {
    spaceStyle: CSSObject
    borderStyle: CSSObject
    backgroundStyle: CSSObject
  }
}

const CollapseSettings: CraftElementSettings<CollapseProps> = ({ props, onPropsChange }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        onPropsChange?.({
          list: [],
          customStyle: {
            ...props.customStyle,
            ...values.spaceStyle,
            ...values.borderStyle,
            ...values.backgroundStyle,
            '.title': {
              ...values.titleStyle.spaceStyle,
              ...values.titleStyle.borderStyle,
              ...values.titleStyle.backgroundStyle,
            },
            '.paragraph': {
              ...values.paragraphStyle.spaceStyle,
              ...values.paragraphStyle.borderStyle,
              ...values.paragraphStyle.backgroundStyle,
            },
          },
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
      initialValues={props}
      onValuesChange={handleChange}
    >
      <Collapse
        className="mt-2 p-0"
        bordered={false}
        expandIconPosition="right"
        ghost
        defaultActiveKey={['collapseStyle']}
      >
        <StyledCollapsePanel
          key="titleStyle"
          header={<AdminHeaderTitle>{formatMessage(craftMessages['*'].titleStyle)}</AdminHeaderTitle>}
        >
          <Form.Item>
            <TypographyStyleInput
              value={props.customStyle?.['.title'] as CSSObject}
              onChange={value =>
                onPropsChange?.({
                  ...props,
                  customStyle: {
                    ...props.customStyle,
                    '.title': { ...(props.customStyle?.['.title'] as CSSObject), ...value },
                  },
                })
              }
            />
          </Form.Item>
          <Form.Item>
            <SpaceStyleInput
              value={props.customStyle?.['.title'] as CSSObject}
              onChange={value =>
                onPropsChange?.({
                  ...props,
                  customStyle: {
                    ...props.customStyle,
                    '.title': { ...(props.customStyle?.['.title'] as CSSObject), ...value },
                  },
                })
              }
            />
          </Form.Item>
        </StyledCollapsePanel>
        <StyledCollapsePanel
          key="paragraphStyle"
          header={<AdminHeaderTitle>{formatMessage(craftMessages['*'].paragraphStyle)}</AdminHeaderTitle>}
        >
          <Form.Item>
            <TypographyStyleInput
              value={props.customStyle?.['.paragraph'] as CSSObject}
              onChange={value =>
                onPropsChange?.({
                  ...props,
                  customStyle: {
                    ...props.customStyle,
                    '.paragraph': { ...(props.customStyle?.['.paragraph'] as CSSObject), ...value },
                  },
                })
              }
            />
          </Form.Item>
          <Form.Item>
            <SpaceStyleInput
              value={props.customStyle?.['.paragraph'] as CSSObject}
              onChange={value =>
                onPropsChange?.({
                  ...props,
                  customStyle: {
                    ...props.customStyle,
                    '.paragraph': { ...(props.customStyle?.['.paragraph'] as CSSObject), ...value },
                  },
                })
              }
            />
          </Form.Item>
        </StyledCollapsePanel>
        <StyledCollapsePanel
          key="advancedSetting"
          header={<AdminHeaderTitle>{formatMessage(craftMessages['*'].advancedSetting)}</AdminHeaderTitle>}
        >
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

export default CollapseSettings
