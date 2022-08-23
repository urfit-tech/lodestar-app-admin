import { Collapse, Form, Input, Select, Switch } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { ProgramPackageCollectionProps } from 'lodestar-app-element/src/components/collections/ProgramPackageCollection'
import { useIntl } from 'react-intl'
import {
  CraftElementSettings,
  CraftSettingLabel,
  StyledCollapsePanel,
} from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import { AdminHeaderTitle } from '../../admin'
import LayoutInput from '../../common/LayoutInput'
import ProgramPackageCollectionSelector from '../../programPackage/ProgramPackageCollectionSelector'
import craftMessages from '../translation'
import CarouselSettingGroup from './CarouselSettingGroup'

const ProgramPackageCollectionSettings: CraftElementSettings<ProgramPackageCollectionProps> = ({
  props,
  onPropsChange,
}) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  return (
    <Form
      className="pt-3"
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      onValuesChange={() => {
        form.validateFields()
      }}
    >
      <Form.Item label={<CraftSettingLabel>{formatMessage(craftMessages['*'].collectionVariant)}</CraftSettingLabel>}>
        <Select
          value={props.collectionVariant || 'grid'}
          onChange={collectionVariant => onPropsChange?.({ ...props, collectionVariant })}
        >
          <Select.Option value="grid">{formatMessage(craftMessages['*'].grid)}</Select.Option>
          <Select.Option value="carousel">{formatMessage(craftMessages['*'].carousel)}</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item className="mb-0">
        <ProgramPackageCollectionSelector
          value={props.source}
          onChange={source => {
            onPropsChange?.({ ...props, source })
          }}
        />
      </Form.Item>
      <Form.Item
        valuePropName="checked"
        label={<CraftSettingLabel>{formatMessage(craftMessages['*'].categorySelectorEnabled)}</CraftSettingLabel>}
      >
        <Switch checked={props.withSelector} onChange={withSelector => onPropsChange?.({ ...props, withSelector })} />
      </Form.Item>
      <Form.Item>
        <LayoutInput value={props.layout} onChange={layout => onPropsChange?.({ ...props, layout })} />
      </Form.Item>
      {props.collectionVariant === 'carousel' && (
        <CarouselSettingGroup
          value={props.carousel}
          onChange={carousel =>
            onPropsChange?.({ ...props, carousel, customStyle: { ...props.customStyle, ...carousel.customStyle } })
          }
        />
      )}

      <Collapse ghost expandIconPosition="right" defaultActiveKey="buttonSetting">
        <StyledCollapsePanel
          key="advancedSetting"
          header={<AdminHeaderTitle>{formatMessage(craftMessages['*'].advancedSetting)}</AdminHeaderTitle>}
        >
          <Form.Item
            label={
              <CraftSettingLabel>
                {formatMessage(craftMessages.ProgramPackageCollectionSettings.programPackageSectionId)}
              </CraftSettingLabel>
            }
          >
            <Input value={props.name} onChange={e => onPropsChange?.({ ...props, name: e.target.value })} />
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

export default ProgramPackageCollectionSettings
