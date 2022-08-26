import { useNode } from '@craftjs/core'
import { Collapse, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { BaseCarouselProps } from 'lodestar-app-element/src/components/common/BaseCarousel'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import {
  CraftElementSettings,
  CraftSettingLabel,
  StyledCollapsePanel,
} from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import { AdminHeaderTitle } from '../../admin'
import craftMessages from '../translation'
import CarouselSettingGroup from './CarouselSettingGroup'

type FieldValues = {
  slidesToShow: number
  slidesToScroll: number
  spaceStyle: CSSObject
  borderStyle: CSSObject
  backgroundStyle: CSSObject
}

const CarouselSettings: CraftElementSettings<BaseCarouselProps> = ({ props, onPropsChange }) => {
  const [form] = useForm<FieldValues>()
  const { formatMessage } = useIntl()

  const handleChange = () => {
    form.validateFields()
  }

  const { childNodes } = useNode(node => ({ childNodes: node.data.nodes }))

  return (
    <Form form={form} layout="vertical" colon={false} onValuesChange={handleChange}>
      <Collapse ghost expandIconPosition="right" defaultActiveKey="setting">
        <CarouselSettingGroup
          slides={childNodes.length}
          value={props}
          onChange={value => onPropsChange?.({ ...props, ...value })}
        />

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

export default CarouselSettings
