import { useNode } from '@craftjs/core'
import { Checkbox, Collapse, Form, InputNumber } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { CarouselProps } from 'lodestar-app-element/src/components/common/Carousel'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import { craftPageMessages } from '../../../helpers/translation'
import {
  CraftElementSettings,
  CraftSlider,
  StyledCollapsePanel,
} from '../../../pages/craft/CraftPageAdminPage/CraftSettingsPanel'
import { AdminHeaderTitle, StyledInputNumber } from '../../admin'
import SpaceStyleInput from '../inputs/SpaceStyleInput'

type FieldValues = {
  slidesToShow: number
  slidesToScroll: number
  spaceStyle: CSSObject
  borderStyle: CSSObject
  backgroundStyle: CSSObject
}

const messages = defineMessages({
  currentSlide: { id: 'craft.settings.carousel.currentSlide', defaultMessage: '目前輪播' },
  autoplay: { id: 'craft.settings.carousel.autoplay', defaultMessage: '自動播放' },
  autoplaySpeed: { id: 'craft.settings.carousel.autoplaySpeed', defaultMessage: '自動播放速度（毫秒）' },
  infinite: { id: 'craft.settings.carousel.infinite', defaultMessage: '無限輪播' },
  arrows: { id: 'craft.settings.carousel.arrows', defaultMessage: '顯示箭頭' },
  dots: { id: 'craft.settings.carousel.dots', defaultMessage: '顯示圓點' },
  slideToShow: { id: 'craft.settings.carousel.slideToShow', defaultMessage: '欄數' },
  slideToScroll: { id: 'craft.settings.carousel.slideToScroll', defaultMessage: '捲動數量' },
  arrowsVerticalPosition: { id: 'craft.settings.carousel.arrowsVerticalPosition', defaultMessage: '箭頭垂直位置' },
  arrowsLeftPosition: { id: 'craft.settings.carousel.arrowsLeftPosition', defaultMessage: '左箭頭位置' },
  arrowsLeftSize: { id: 'craft.settings.carousel.arrowsLeftSize', defaultMessage: '左箭頭大小' },
  arrowsRightPosition: { id: 'craft.settings.carousel.arrowsRightPosition', defaultMessage: '右箭頭位置' },
  arrowsRightSize: { id: 'craft.settings.carousel.arrowsRightSize', defaultMessage: '右箭頭大小' },
  dotsPosition: { id: 'craft.settings.carousel.dotsPosition', defaultMessage: '圓點位置' },
  dotsWidth: { id: 'craft.settings.carousel.dotsWidth', defaultMessage: '圓點寬度' },
  dotsHeight: { id: 'craft.settings.carousel.dotsHeight', defaultMessage: '圓點高度' },
  dotsMargin: { id: 'craft.settings.carousel.dotsMargin', defaultMessage: '圓點間距' },
  dotsRadius: { id: 'craft.settings.carousel.dotsRadius', defaultMessage: '圓點弧度' },
})
const CarouselSettings: CraftElementSettings<CarouselProps> = ({ props, onPropsChange }) => {
  const [form] = useForm<FieldValues>()
  const { formatMessage } = useIntl()

  const handleChange = () => {
    form.validateFields()
  }

  const { childNodes } = useNode(node => ({ childNodes: node.data.nodes }))

  const dotsStyle = (props.customStyle?.['.slick-dots'] || {}) as CSSObject
  const arrowStyle = (props.customStyle?.['.slick-arrow'] || {}) as CSSObject
  const prevArrowStyle = (props.customStyle?.['.slick-prev'] || {}) as CSSObject
  const nextArrowStyle = (props.customStyle?.['.slick-next'] || {}) as CSSObject

  return (
    <Form form={form} layout="vertical" colon={false} onValuesChange={handleChange}>
      <Collapse ghost expandIconPosition="right" defaultActiveKey="setting">
        <StyledCollapsePanel
          key="setting"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.carouselSetting)}</AdminHeaderTitle>}
        >
          <Form.Item label={formatMessage(messages.currentSlide)}>
            <CraftSlider
              dots
              min={1}
              max={childNodes.length}
              step={1}
              value={(props.currentSlide || 0) + 1}
              onChange={(e: number) => onPropsChange?.({ ...props, currentSlide: Number(e) - 1 || 0 })}
            />
          </Form.Item>
          <Form.Item>
            <Checkbox
              checked={props.autoplay}
              onChange={e => onPropsChange?.({ ...props, autoplay: e.target.checked })}
            >
              {formatMessage(messages.autoplay)}
            </Checkbox>
          </Form.Item>
          {props.autoplay && (
            <Form.Item label={formatMessage(messages.autoplaySpeed)}>
              <StyledInputNumber
                min={1}
                value={props.autoplaySpeed}
                onChange={value => onPropsChange?.({ ...props, autoplaySpeed: Number(value) || 3000 })}
              />
            </Form.Item>
          )}
          <Form.Item>
            <Checkbox
              checked={props.infinite}
              onChange={e => onPropsChange?.({ ...props, infinite: e.target.checked })}
            >
              {formatMessage(messages.infinite)}
            </Checkbox>
          </Form.Item>
          <Form.Item label={formatMessage(messages.slideToShow)}>
            <StyledInputNumber
              min={1}
              value={props.slidesToShow || 1}
              onChange={value => onPropsChange?.({ ...props, slidesToShow: Number(value) || 1 })}
            />
          </Form.Item>
          <Form.Item label={formatMessage(messages.slideToScroll)}>
            <StyledInputNumber
              min={1}
              value={props.slidesToScroll || 1}
              onChange={value => onPropsChange?.({ ...props, slidesToScroll: Number(value) || 1 })}
            />
          </Form.Item>
        </StyledCollapsePanel>
        <StyledCollapsePanel
          key="style"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.carouselStyle)}</AdminHeaderTitle>}
        >
          <Form.Item label={formatMessage(craftPageMessages.label.height)}>
            <InputNumber
              min={100}
              value={Number(props.customStyle?.height?.toString().replace('px', ''))}
              onChange={v =>
                onPropsChange?.({ ...props, customStyle: { ...props.customStyle, height: Number(v) + 'px' } })
              }
            />
          </Form.Item>
          <Form.Item>
            <SpaceStyleInput
              value={props.customStyle}
              onChange={value => onPropsChange?.({ ...props, customStyle: { ...props.customStyle, ...value } })}
            />
          </Form.Item>
          <Form.Item>
            <Checkbox
              checked={props.arrows === undefined ? true : props.arrows}
              onChange={e => onPropsChange?.({ ...props, arrows: e.target.checked })}
            >
              {formatMessage(messages.arrows)}
            </Checkbox>
          </Form.Item>
          {(props.arrows === undefined || props.arrows) && (
            <>
              <Form.Item label={formatMessage(messages.arrowsVerticalPosition)}>
                <CraftSlider
                  min={0}
                  max={100}
                  tipFormatter={v => v + '%'}
                  value={Number(arrowStyle.top?.toString().replace('%', ''))}
                  onChange={(v: Number) =>
                    onPropsChange?.({
                      ...props,
                      customStyle: {
                        '.slick-arrow': {
                          top: Number(v) + '%',
                        },
                      },
                    })
                  }
                />
              </Form.Item>
              <Form.Item label={formatMessage(messages.arrowsLeftPosition)}>
                <CraftSlider
                  min={-100}
                  max={100}
                  value={-Number(prevArrowStyle.left?.toString().replace('px', ''))}
                  onChange={(v: Number) =>
                    onPropsChange?.({
                      ...props,
                      customStyle: {
                        ...props.customStyle,
                        '.slick-prev': {
                          ...prevArrowStyle,
                          left: -Number(v) + 'px',
                        },
                      },
                    })
                  }
                />
              </Form.Item>
              <Form.Item label={formatMessage(messages.arrowsLeftSize)}>
                <CraftSlider
                  min={20}
                  max={100}
                  value={Number(
                    ((prevArrowStyle['&::before'] || {}) as CSSObject)?.fontSize?.toString().replace('px', ''),
                  )}
                  onChange={(v: Number) =>
                    onPropsChange?.({
                      ...props,
                      customStyle: {
                        ...props.customStyle,
                        '.slick-prev': {
                          '&::before': {
                            fontSize: Number(v) + 'px',
                          },
                        },
                      },
                    })
                  }
                />
              </Form.Item>

              <Form.Item label={formatMessage(messages.arrowsRightPosition)}>
                <CraftSlider
                  min={-100}
                  max={100}
                  value={-Number(nextArrowStyle.right?.toString().replace('px', ''))}
                  onChange={(v: Number) =>
                    onPropsChange?.({
                      ...props,
                      customStyle: {
                        ...props.customStyle,
                        '.slick-next': {
                          ...nextArrowStyle,
                          right: -Number(v) + 'px',
                        },
                      },
                    })
                  }
                />
              </Form.Item>
              <Form.Item label={formatMessage(messages.arrowsRightSize)}>
                <CraftSlider
                  min={20}
                  max={100}
                  value={Number(
                    ((nextArrowStyle['&::before'] || {}) as CSSObject)?.fontSize?.toString().replace('px', ''),
                  )}
                  onChange={(v: Number) =>
                    onPropsChange?.({
                      ...props,
                      customStyle: {
                        ...props.customStyle,
                        '.slick-next': {
                          '&::before': {
                            fontSize: Number(v) + 'px',
                          },
                        },
                      },
                    })
                  }
                />
              </Form.Item>
            </>
          )}
          <Form.Item>
            <Checkbox
              checked={props.dots === undefined ? true : props.dots}
              onChange={e => onPropsChange?.({ ...props, dots: e.target.checked })}
            >
              {formatMessage(messages.dots)}
            </Checkbox>
          </Form.Item>
          {(props.dots === undefined || props.dots) && (
            <>
              <Form.Item label={formatMessage(messages.dotsPosition)}>
                <CraftSlider
                  min={-100}
                  max={100}
                  step={1}
                  value={-Number(dotsStyle.bottom?.toString().replace('px', ''))}
                  onChange={(v: Number) =>
                    onPropsChange?.({
                      ...props,
                      customStyle: {
                        ...props.customStyle,
                        '.slick-dots': {
                          bottom: -v + 'px',
                        },
                      },
                    })
                  }
                />
              </Form.Item>
              <Form.Item label={formatMessage(messages.dotsWidth)}>
                <CraftSlider
                  min={10}
                  step={1}
                  value={Number(((dotsStyle['button::before'] || {}) as CSSObject).width?.toString().replace('px', ''))}
                  onChange={(v: number) =>
                    onPropsChange?.({
                      ...props,
                      customStyle: {
                        ...props.customStyle,
                        '.slick-dots': {
                          'button::before': {
                            width: v + 'px',
                          },
                        },
                      },
                    })
                  }
                />
              </Form.Item>
              <Form.Item label={formatMessage(messages.dotsHeight)}>
                <CraftSlider
                  min={10}
                  step={1}
                  value={Number(
                    ((dotsStyle['button::before'] || {}) as CSSObject).height?.toString().replace('px', ''),
                  )}
                  onChange={(v: number) =>
                    onPropsChange?.({
                      ...props,
                      customStyle: {
                        ...props.customStyle,
                        '.slick-dots': {
                          'button::before': {
                            height: v + 'px',
                          },
                        },
                      },
                    })
                  }
                />
              </Form.Item>
              <Form.Item label={formatMessage(messages.dotsRadius)}>
                <CraftSlider
                  min={0}
                  max={100}
                  step={1}
                  tipFormatter={v => v + '%'}
                  value={Number(
                    ((dotsStyle['button::before'] || {}) as CSSObject).borderRadius?.toString().replace('%', ''),
                  )}
                  onChange={(v: number) =>
                    onPropsChange?.({
                      ...props,
                      customStyle: {
                        ...props.customStyle,
                        '.slick-dots': {
                          'button::before': {
                            borderRadius: v + '%',
                          },
                        },
                      },
                    })
                  }
                />
              </Form.Item>
              <Form.Item label={formatMessage(messages.dotsMargin)}>
                <CraftSlider
                  step={1}
                  value={Number(
                    ((dotsStyle['li'] || {}) as CSSObject).margin?.toString().split(' ').pop()?.replace('px', ''),
                  )}
                  onChange={(v: number) =>
                    onPropsChange?.({
                      ...props,
                      customStyle: {
                        ...props.customStyle,
                        '.slick-dots': {
                          li: {
                            margin: `0 ${v}px`,
                          },
                        },
                      },
                    })
                  }
                />
              </Form.Item>
            </>
          )}
        </StyledCollapsePanel>
      </Collapse>
    </Form>
  )
}

export default CarouselSettings
