import { useNode, UserComponent } from '@craftjs/core'
import { Button, Checkbox, Collapse, Form, Input } from 'antd'
import { CollapseProps } from 'antd/lib/collapse'
import { useForm } from 'antd/lib/form/Form'
import Carousel from 'lodestar-app-element/src/components/Carousel'
import React, { Fragment, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { ReactComponent as PlusIcon } from '../../images/icon/plus.svg'
import { ReactComponent as TrashOIcon } from '../../images/icon/trash-o.svg'
import { CraftTextStyleProps } from '../../types/craft'
import {
  AdminHeaderTitle,
  StyledCollapsePanel,
  StyledCraftSettingLabel,
  StyledSettingButtonWrapper,
  StyledUnderLineInput,
} from '../admin'
import ImageUploader from '../common/ImageUploader'
import { BREAK_POINT } from '../common/Responsive'
import CraftTextStyleBlock from './CraftTextStyleBlock'

const StyledDeleteButton = styled(Button)`
  width: 25px;
  height: 25px;
  svg {
    font-size: 16px;
  }
`
const StyledAddButton = styled(Button)`
  width: 25px;
  height: 25px;
  svg {
    font-size: 16px;
  }
`
const StyledLinkFormItem = styled(Form.Item)`
  .ant-form-item-label {
    padding-bottom: 0px;
  }
`
const StyledCraftCarouselWrapper = styled.div<{
  titleStyle: CraftTextStyleProps
  paragraphStyle: CraftTextStyleProps
}>`
  @media (min-width: ${BREAK_POINT}px) {
  }
`
const StyledCraftCarousel = styled.div<{ desktopCoverUrl: string; mobileCoverUrl: string }>`
  @media (min-width: ${BREAK_POINT}px) {
  }
`
const StyledTitle = styled.div<{ customStyle: CraftTextStyleProps }>`
  font-size: ${props => `${props.customStyle.fontSize}px`};
  padding: ${props => `${props.customStyle.padding}px`};
  line-height: ${props => props.customStyle.fontSize};
  text-align: ${props => props.customStyle.textAlign};
  font-weight: ${props => props.customStyle.fontWeight};
  color: ${props => props.customStyle.color};
`

type FieldProps = {
  type: 'normal' | 'simply'
  covers: {
    title?: string
    paragraph?: string
    desktopCoverUrl: string
    mobileCoverUrl: string
    link: string
    openNewTab: boolean
  }[]
  titleStyle?: CraftTextStyleProps
  paragraphStyle?: CraftTextStyleProps
}

const CraftCarousel: UserComponent<FieldProps & { setActiveKey: React.Dispatch<React.SetStateAction<string>> }> = ({
  covers,
  titleStyle,
  paragraphStyle,
  setActiveKey,
}) => {
  const {
    connectors: { connect, drag },
  } = useNode()

  if (!!titleStyle && !!paragraphStyle) {
    return (
      <>
        <StyledCraftCarouselWrapper
          ref={ref => ref && connect(drag(ref))}
          titleStyle={titleStyle}
          paragraphStyle={paragraphStyle}
          onClick={() => setActiveKey('settings')}
        >
          <Carousel dots infinite arrows={false} autoplay autoplaySpeed={5000} variant="cover">
            {covers.map(cover => (
              <StyledCraftCarousel desktopCoverUrl={cover.desktopCoverUrl} mobileCoverUrl={cover.mobileCoverUrl}>
                <StyledTitle customStyle={titleStyle}>{cover.title}</StyledTitle>
              </StyledCraftCarousel>
            ))}
          </Carousel>
        </StyledCraftCarouselWrapper>
      </>
    )
  }
  return (
    <div ref={ref => ref && connect(drag(ref))} onClick={() => setActiveKey('settings')}>
      {covers.map(cover => (
        <StyledCraftCarousel
          key={cover.title}
          desktopCoverUrl={cover.desktopCoverUrl}
          mobileCoverUrl={cover.mobileCoverUrl}
        />
      ))}
    </div>
  )
}

const CarouselSettings: React.VFC<FieldProps & CollapseProps> = ({ ...collapseProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const {
    actions: { setProp },
    props,
    selected,
  } = useNode(node => ({
    props: node.data.props as FieldProps,
    selected: node.events.selected,
  }))

  const [desktopCover, setDesktopCover] = useState<File[]>([])
  const [mobileCover, setMobileCover] = useState<File[]>([])

  const handleSubmit = (values: FieldProps) => {
    setProp(props => {
      props.covers = values.covers
      props.titleStyle = values.titleStyle
      props.paragraphStyle = values.paragraphStyle
    })
    //TODO: upload cover to s3
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        covers: props.covers.map(cover => ({
          title: cover.title || '',
          paragraph: cover.paragraph || '',
          desktopCoverUrl: cover.desktopCoverUrl || '',
          mobileCoverUrl: cover.mobileCoverUrl || '',
          link: cover.link || '',
          openNewTab: cover.openNewTab || false,
        })),
        titleStyle: {
          fontSize: props.titleStyle?.fontSize || 16,
          padding: props.titleStyle?.padding || 0,
          textAlign: props.titleStyle?.textAlign || 'center',
          fontWeight: props.titleStyle?.fontWeight || 'bold',
          color: props.titleStyle?.color || '#585858',
        },
        paragraphStyle: {
          fontSize: props.paragraphStyle?.fontSize || 16,
          padding: props.paragraphStyle?.padding || 0,
          lineHeight: props.paragraphStyle?.lineHeight || 1,
          textAlign: props.paragraphStyle?.textAlign || 'center',
          fontWeight: props.paragraphStyle?.fontWeight || 'bold',
          color: props.paragraphStyle?.color || '#585858',
        },
      }}
      colon={false}
      onFinish={handleSubmit}
    >
      <Form.List name="covers">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Fragment key={field.fieldKey}>
                <Collapse
                  {...collapseProps}
                  className="mt-2 p-0"
                  bordered={false}
                  expandIconPosition="right"
                  ghost
                  defaultActiveKey={['carousel']}
                >
                  <StyledCollapsePanel
                    key="carousel"
                    header={
                      <div className="d-flex">
                        <AdminHeaderTitle>{formatMessage(craftPageMessages.label.carouselSetting)}</AdminHeaderTitle>
                        <StyledAddButton type="link" icon={<PlusIcon />} className="p-0 mr-1" onClick={() => add()} />
                        <StyledDeleteButton
                          type="link"
                          icon={<TrashOIcon />}
                          className="p-0"
                          onClick={() => remove(field.name)}
                        />
                      </div>
                    }
                  >
                    {props.type === 'normal' && (
                      <>
                        <Form.Item
                          className="mb-3"
                          name={[field.name, 'title']}
                          fieldKey={[field.fieldKey, 'title']}
                          label={
                            <StyledCraftSettingLabel>
                              {formatMessage(craftPageMessages.label.title)}
                            </StyledCraftSettingLabel>
                          }
                        >
                          <Input />
                        </Form.Item>

                        <Form.Item
                          className="mb-3"
                          name={[field.name, 'content']}
                          fieldKey={[field.fieldKey, 'content']}
                          label={
                            <StyledCraftSettingLabel>
                              {formatMessage(craftPageMessages.label.content)}
                            </StyledCraftSettingLabel>
                          }
                        >
                          <Input.TextArea rows={5} />
                        </Form.Item>
                      </>
                    )}

                    <Form.Item
                      className="mb-3"
                      name={[field.name, 'desktopCover']}
                      fieldKey={[field.fieldKey, 'desktopCover']}
                      label={
                        <StyledCraftSettingLabel>
                          {formatMessage(craftPageMessages.label.desktopDisplay)}
                        </StyledCraftSettingLabel>
                      }
                    >
                      <ImageUploader
                        file={desktopCover ? desktopCover[index] : null}
                        initialCoverUrl={''}
                        onChange={file => {
                          setDesktopCover([...desktopCover.slice(0, index), file, ...desktopCover.slice(index + 1)])
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      className="mb-3"
                      name={[field.name, 'mobileCover']}
                      fieldKey={[field.fieldKey, 'mobileCover']}
                      label={
                        <StyledCraftSettingLabel>
                          {formatMessage(craftPageMessages.label.mobileDisplay)}
                        </StyledCraftSettingLabel>
                      }
                    >
                      <ImageUploader
                        file={mobileCover ? mobileCover[index] : null}
                        initialCoverUrl={''}
                        onChange={file => {
                          setMobileCover([...mobileCover.slice(0, index), file, ...mobileCover.slice(index + 1)])
                        }}
                      />
                    </Form.Item>

                    <StyledLinkFormItem
                      className="mb-2"
                      name={[field.name, 'link']}
                      fieldKey={[field.fieldKey, 'link']}
                      label={
                        <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.link)}</StyledCraftSettingLabel>
                      }
                    >
                      <StyledUnderLineInput placeholder="https://" />
                    </StyledLinkFormItem>

                    <Form.Item
                      className="mb-1"
                      name={[field.name, 'openNewTab']}
                      fieldKey={[field.fieldKey, 'openNewTab']}
                      valuePropName="checked"
                    >
                      <Checkbox>{formatMessage(craftPageMessages.label.openNewTab)}</Checkbox>
                    </Form.Item>
                  </StyledCollapsePanel>
                </Collapse>
              </Fragment>
            ))}
          </>
        )}
      </Form.List>
      {props.type === 'normal' && (
        <>
          <Form.Item name="titleStyle">
            <CraftTextStyleBlock type="title" title={formatMessage(craftPageMessages.label.titleStyle)} />
          </Form.Item>
          <Form.Item name="paragraphStyle">
            <CraftTextStyleBlock type="paragraph" title={formatMessage(craftPageMessages.label.paragraphStyle)} />
          </Form.Item>
        </>
      )}
      {selected && (
        <StyledSettingButtonWrapper>
          <Button className="mb-3" type="primary" htmlType="submit" block>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </StyledSettingButtonWrapper>
      )}
    </Form>
  )
}

CraftCarousel.craft = {
  related: {
    settings: CarouselSettings,
  },
  custom: {
    button: {
      label: 'deleteAllBlock',
    },
  },
}

export default CraftCarousel
