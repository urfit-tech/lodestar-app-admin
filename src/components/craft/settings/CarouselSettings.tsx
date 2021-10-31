import { Collapse, Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { CarouselProps } from 'lodestar-app-element/src/components/common/Carousel'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { craftPageMessages } from '../../../helpers/translation'
import { AdminHeaderTitle, StyledInputNumber } from '../../admin'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import { CraftSettings, StyledCollapsePanel } from './CraftSettings'

type FieldValues = {
  slidesToShow: number
  slidesToScroll: number
  spaceStyle: CSSObject
  borderStyle: CSSObject
  backgroundStyle: CSSObject
}

const messages = defineMessages({
  slideToShow: { id: 'craft.settings.carousel.slideToShow', defaultMessage: '欄數' },
  slideToScroll: { id: 'craft.settings.carousel.slideToScroll', defaultMessage: '捲動數量' },
})
const CarouselSettings: CraftSettings<CarouselProps> = ({ props, onPropsChange }) => {
  const [form] = useForm<FieldValues>()
  const { formatMessage } = useIntl()

  const handleChange = () => {
    form.validateFields()
  }

  return (
    <Form form={form} layout="vertical" colon={false} onValuesChange={handleChange}>
      <Collapse accordion ghost expandIconPosition="right" defaultActiveKey="setting">
        <StyledCollapsePanel
          key="setting"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.carouselSetting)}</AdminHeaderTitle>}
        >
          <Form.Item label={formatMessage(messages.slideToShow)}>
            <StyledInputNumber
              min={1}
              value={props.slidesToShow}
              onChange={value => onPropsChange?.({ ...props, slidesToShow: Number(value) || 1 })}
            />
          </Form.Item>
          <Form.Item label={formatMessage(messages.slideToScroll)}>
            <StyledInputNumber
              min={1}
              value={props.slidesToScroll}
              onChange={value => onPropsChange?.({ ...props, slidesToScroll: Number(value) || 1 })}
            />
          </Form.Item>
        </StyledCollapsePanel>
        <StyledCollapsePanel
          key="style"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.carouselStyle)}</AdminHeaderTitle>}
        >
          <Form.Item>
            <SpaceStyleInput
              value={props.customStyle}
              onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
            />
          </Form.Item>
        </StyledCollapsePanel>
      </Collapse>
    </Form>
  )
}

export default CarouselSettings
