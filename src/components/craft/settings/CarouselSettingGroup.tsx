import { Checkbox, Collapse, Form, InputNumber } from 'antd'
import { BaseCarouselProps } from 'lodestar-app-element/src/components/common/BaseCarousel'
import React from 'react'
import { useIntl } from 'react-intl'
import { CSSObject } from 'styled-components'
import {
  CraftSettingsProps,
  CraftSlider,
  StyledCollapsePanel,
} from '../../../pages/CraftPageAdminPage/CraftSettingsPanel'
import { AdminHeaderTitle, StyledInputNumber } from '../../admin'
import SpaceStyleInput from '../inputs/SpaceStyleInput'
import craftMessages from '../translation'

type CarouselSettingGroupProps = {
  slides?: number
  value?: CraftSettingsProps<BaseCarouselProps>
  onChange?: (value: CraftSettingsProps<BaseCarouselProps>) => void
}

// adaptiveHeight
// draggable
// fade
// rows
// slidesPerRow
// slidesToScroll
// slidesToShow
// speed
// swipeToSlide
// swipe
// vertical
const CarouselSettingGroup: React.FC<CarouselSettingGroupProps> = ({ slides, value, onChange }) => {
  const { formatMessage } = useIntl()
  const dotsStyle = (value?.customStyle?.['.slick-dots'] || {}) as CSSObject
  const arrowStyle = (value?.customStyle?.['.slick-arrow'] || {}) as CSSObject
  const prevArrowStyle = (value?.customStyle?.['.slick-prev'] || {}) as CSSObject
  const nextArrowStyle = (value?.customStyle?.['.slick-next'] || {}) as CSSObject
  return (
    <Collapse ghost expandIconPosition="right">
      <StyledCollapsePanel
        key="setting"
        header={<AdminHeaderTitle>{formatMessage(craftMessages.CarouselSettings.carouselSetting)}</AdminHeaderTitle>}
      >
        <Form.Item label={formatMessage(craftMessages.CarouselSettings.currentSlide)}>
          <CraftSlider
            dots
            min={1}
            max={slides}
            step={1}
            value={(value?.currentSlide || 0) + 1}
            onChange={(e: number) => onChange?.({ ...value, currentSlide: Number(e) - 1 || 0 })}
          />
        </Form.Item>
        <Form.Item>
          <Checkbox checked={value?.autoplay} onChange={e => onChange?.({ ...value, autoplay: e.target.checked })}>
            {formatMessage(craftMessages.CarouselSettings.autoplay)}
          </Checkbox>
        </Form.Item>
        {value?.autoplay && (
          <Form.Item label={formatMessage(craftMessages.CarouselSettings.autoplaySpeed)}>
            <StyledInputNumber
              min={1}
              value={value?.autoplaySpeed}
              onChange={v => onChange?.({ ...value, autoplaySpeed: Number(v) || 3000 })}
            />
          </Form.Item>
        )}
        <Form.Item>
          <Checkbox checked={value?.infinite} onChange={e => onChange?.({ ...value, infinite: e.target.checked })}>
            {formatMessage(craftMessages.CarouselSettings.infinite)}
          </Checkbox>
        </Form.Item>
        <Form.Item label={formatMessage(craftMessages.CarouselSettings.slideToShow)}>
          <StyledInputNumber
            min={1}
            value={value?.slidesToShow || 1}
            onChange={v => onChange?.({ ...value, slidesToShow: Number(v) || 1 })}
          />
        </Form.Item>
        <Form.Item label={formatMessage(craftMessages.CarouselSettings.slideToScroll)}>
          <StyledInputNumber
            min={1}
            value={value?.slidesToScroll || 1}
            onChange={v => onChange?.({ ...value, slidesToScroll: Number(v) || 1 })}
          />
        </Form.Item>
        <Form.Item>
          <Checkbox
            checked={value?.centerMode}
            onChange={e =>
              onChange?.({
                ...value,
                centerMode: e.target.checked,
                centerPadding: e.target.checked ? '60px' : undefined,
              })
            }
          >
            {formatMessage(craftMessages.CarouselSettings.centerMode)}
          </Checkbox>
        </Form.Item>
        {value?.centerMode && (
          <Form.Item label={formatMessage(craftMessages.CarouselSettings.centerPadding)}>
            <CraftSlider
              min={10}
              max={200}
              tipFormatter={v => v + 'px'}
              value={Number(value.centerPadding?.replace('px', ''))}
              onChange={(v: Number) =>
                onChange?.({
                  ...value,
                  centerPadding: v + 'px',
                })
              }
            />
          </Form.Item>
        )}
      </StyledCollapsePanel>
      <StyledCollapsePanel
        key="style"
        header={<AdminHeaderTitle>{formatMessage(craftMessages.CarouselSettings.carouselStyle)}</AdminHeaderTitle>}
      >
        <Form.Item label={formatMessage(craftMessages.CarouselSettings.height)}>
          <InputNumber
            min={100}
            value={Number(value?.customStyle?.height?.toString().replace('px', ''))}
            onChange={v => onChange?.({ ...value, customStyle: { ...value?.customStyle, height: Number(v) + 'px' } })}
          />
        </Form.Item>
        <Form.Item>
          <SpaceStyleInput
            value={value?.customStyle}
            onChange={v => onChange?.({ ...value, customStyle: { ...value?.customStyle, ...v } })}
          />
        </Form.Item>
        <Form.Item>
          <Checkbox
            checked={value?.arrows === undefined ? true : value?.arrows}
            onChange={e => onChange?.({ ...value, arrows: e.target.checked })}
          >
            {formatMessage(craftMessages.CarouselSettings.arrows)}
          </Checkbox>
        </Form.Item>
        {(value?.arrows === undefined || value?.arrows) && (
          <>
            <Form.Item label={formatMessage(craftMessages.CarouselSettings.arrowsVerticalPosition)}>
              <CraftSlider
                min={0}
                max={100}
                tipFormatter={v => v + '%'}
                value={Number(arrowStyle.top?.toString().replace('%', ''))}
                onChange={(v: Number) =>
                  onChange?.({
                    ...value,
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
                  onChange?.({
                    ...value,
                    customStyle: {
                      ...value?.customStyle,
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
                  onChange?.({
                    ...value,
                    customStyle: {
                      ...value?.customStyle,
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
                  onChange?.({
                    ...value,
                    customStyle: {
                      ...value?.customStyle,
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
                  onChange?.({
                    ...value,
                    customStyle: {
                      ...value?.customStyle,
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
            checked={value?.dots === undefined ? true : value?.dots}
            onChange={e => onChange?.({ ...value, dots: e.target.checked })}
          >
            {formatMessage(craftMessages.CarouselSettings.dots)}
          </Checkbox>
        </Form.Item>
        {(value?.dots === undefined || value?.dots) && (
          <>
            <Form.Item label={formatMessage(craftMessages.CarouselSettings.dotsPosition)}>
              <CraftSlider
                min={-100}
                max={100}
                step={1}
                value={-Number(dotsStyle.bottom?.toString().replace('px', ''))}
                onChange={(v: Number) =>
                  onChange?.({
                    ...value,
                    customStyle: {
                      ...value?.customStyle,
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
                  onChange?.({
                    ...value,
                    customStyle: {
                      ...value?.customStyle,
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
                value={Number(((dotsStyle['button::before'] || {}) as CSSObject).height?.toString().replace('px', ''))}
                onChange={(v: number) =>
                  onChange?.({
                    ...value,
                    customStyle: {
                      ...value?.customStyle,
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
                  onChange?.({
                    ...value,
                    customStyle: {
                      ...value?.customStyle,
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
                  onChange?.({
                    ...value,
                    customStyle: {
                      ...value?.customStyle,
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
  )
}

export default CarouselSettingGroup
