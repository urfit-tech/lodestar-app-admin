import { Form } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { CarouselProps } from 'lodestar-app-element/src/components/common/Carousel'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { StyledInputNumber } from '../../admin'
import BackgroundStyleInput from '../inputs/BackgroundStyleInput'
import BorderStyleInput from '../inputs/BorderStyleInput'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import { CraftSettings } from './CraftSettings'

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
    form
      .validateFields()
      .then(values => {
        onPropsChange?.({
          slidesToShow: values.slidesToShow,
          slidesToScroll: values.slidesToScroll,
          customStyle: {
            ...props.customStyle,
            ...values.spaceStyle,
            ...values.borderStyle,
            ...values.backgroundStyle,
          },
        })
      })
      .catch(() => {})
  }

  return (
    <Form form={form} layout="vertical" initialValues={props} colon={false} onValuesChange={handleChange}>
      <Form.Item name="slideToShow" label={formatMessage(messages.slideToShow)}>
        <StyledInputNumber min={1} />
      </Form.Item>
      <Form.Item name="slideToScroll" label={formatMessage(messages.slideToScroll)}>
        <StyledInputNumber min={1} />
      </Form.Item>
      <Form.Item name="spaceStyle">
        <SpaceStyleInput />
      </Form.Item>
      <Form.Item name="borderStyle">
        <BorderStyleInput />
      </Form.Item>
      <Form.Item name="backgroundStyle">
        <BackgroundStyleInput />
      </Form.Item>
    </Form>
  )
}

export default CarouselSettings
