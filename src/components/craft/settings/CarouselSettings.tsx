import { useNode } from '@craftjs/core'
import { Checkbox, Collapse, Form, Input, InputNumber } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { CarouselProps } from 'lodestar-app-element/src/components/common/Carousel'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import {
  CraftElementSettings,
  CraftSettingLabel,
  CraftSlider,
  StyledCollapsePanel,
} from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import { AdminHeaderTitle, StyledInputNumber } from '../../admin'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import craftMessages from '../translation'

type FieldValues = {
  slidesToShow: number
  slidesToScroll: number
  spaceStyle: CSSObject
  borderStyle: CSSObject
  backgroundStyle: CSSObject
}

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
          header={<AdminHeaderTitle>{formatMessage(craftMessages.CarouselSettings.carouselSetting)}</AdminHeaderTitle>}
        >
          <Form.Item label={formatMessage(craftMessages.CarouselSettings.currentSlide)}>
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
              {formatMessage(craftMessages.CarouselSettings.autoplay)}
            </Checkbox>
          </Form.Item>
          {props.autoplay && (
            <Form.Item label={formatMessage(craftMessages.CarouselSettings.autoplaySpeed)}>
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
              {formatMessage(craftMessages.CarouselSettings.infinite)}
            </Checkbox>
          </Form.Item>
          <Form.Item label={formatMessage(craftMessages.CarouselSettings.slideToShow)}>
            <StyledInputNumber
              min={1}
              value={props.slidesToShow || 1}
              onChange={value => onPropsChange?.({ ...props, slidesToShow: Number(value) || 1 })}
            />
          </Form.Item>
          <Form.Item label={formatMessage(craftMessages.CarouselSettings.slideToScroll)}>
            <StyledInputNumber
              min={1}
              value={props.slidesToScroll || 1}
              onChange={value => onPropsChange?.({ ...props, slidesToScroll: Number(value) || 1 })}
            />
          </Form.Item>
        </StyledCollapsePanel>
        <StyledCollapsePanel
          key="style"
          header={<AdminHeaderTitle>{formatMessage(craftMessages.CarouselSettings.carouselStyle)}</AdminHeaderTitle>}
        >
          <Form.Item label={formatMessage(craftMessages.CarouselSettings.height)}>
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
              {formatMessage(craftMessages.CarouselSettings.arrows)}
            </Checkbox>
          </Form.Item>
          {(props.arrows === undefined || props.arrows) && (
            <>
              <Form.Item label={formatMessage(craftMessages.CarouselSettings.arrowsVerticalPosition)}>
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
              <Form.Item label={formatMessage(craftMessages.CarouselSettings.arrowsLeftPosition)}>
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
              <Form.Item label={formatMessage(craftMessages.CarouselSettings.arrowsLeftSize)}>
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

              <Form.Item label={formatMessage(craftMessages.CarouselSettings.arrowsRightPosition)}>
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
              <Form.Item label={formatMessage(craftMessages.CarouselSettings.arrowsRightSize)}>
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
              {formatMessage(craftMessages.CarouselSettings.dots)}
            </Checkbox>
          </Form.Item>
          {(props.dots === undefined || props.dots) && (
            <>
              <Form.Item label={formatMessage(craftMessages.CarouselSettings.dotsPosition)}>
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
              <Form.Item label={formatMessage(craftMessages.CarouselSettings.dotsWidth)}>
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
              <Form.Item label={formatMessage(craftMessages.CarouselSettings.dotsHeight)}>
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
              <Form.Item label={formatMessage(craftMessages.CarouselSettings.dotsRadius)}>
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
              <Form.Item label={formatMessage(craftMessages.CarouselSettings.dotsMargin)}>
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
