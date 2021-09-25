import { useNode } from '@craftjs/core'
import { Button, Checkbox, Collapse, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { CraftCarouselProps } from 'lodestar-app-element/src/components/craft/CraftCarousel'
import React, { Fragment, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { handleError, uploadFile } from '../../helpers/index'
import { craftPageMessages } from '../../helpers/translation'
import { ReactComponent as PlusIcon } from '../../images/icon/plus.svg'
import { ReactComponent as TrashOIcon } from '../../images/icon/trash-o.svg'
import { CraftTextStyleProps } from '../../types/craft'
import ImageUploader from '../common/ImageUploader'
import { formatBoxModelValue } from './BoxModelInput'
import { AdminHeaderTitle, CraftSettingLabel, StyledCollapsePanel, StyledUnderLineInput } from './styled'
import TextStyleBlock from './TextStyleBlock'

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
  titleStyle?: Pick<CraftTextStyleProps, 'fontSize' | 'textAlign' | 'fontWeight' | 'color'> & {
    margin: string
  }
  paragraphStyle?: Pick<CraftTextStyleProps, 'fontSize' | 'lineHeight' | 'textAlign' | 'fontWeight' | 'color'> & {
    margin: string
  }
}

const CarouselSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const [form] = useForm<FieldProps>()
  const { authToken } = useAuth()
  const { id: appId } = useApp()

  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props as CraftCarouselProps,
  }))
  const [desktopCover, setDesktopCover] = useState<File[]>([])
  const [mobileCover, setMobileCover] = useState<File[]>([])

  const handleChange = () => {
    form
      .validateFields()
      .then(values => {
        const titleMargin = formatBoxModelValue(values.titleStyle?.margin)
        const paragraphMargin = formatBoxModelValue(values.paragraphStyle?.margin)

        setProp(props => {
          props.covers = values.covers
          props.titleStyle = {
            fontSize: values.titleStyle?.fontSize,
            margin: {
              mt: titleMargin?.[0] || '0',
              mr: titleMargin?.[1] || '0',
              mb: titleMargin?.[2] || '0',
              ml: titleMargin?.[3] || '0',
            },
            textAlign: values.titleStyle?.textAlign,
            fontWeight: values.titleStyle?.fontWeight,
            color: values.titleStyle?.color,
          }
          props.paragraphStyle = {
            fontSize: values.paragraphStyle?.fontSize,
            lineHeight: values.paragraphStyle?.lineHeight,
            margin: {
              mt: paragraphMargin?.[0] || '0',
              mr: paragraphMargin?.[1] || '0',
              mb: paragraphMargin?.[2] || '0',
              ml: paragraphMargin?.[3] || '0',
            },
            textAlign: values.paragraphStyle?.textAlign,
            fontWeight: values.paragraphStyle?.fontWeight,
            color: values.paragraphStyle?.color,
          }
        })
      })
      .catch(() => {})
  }
  const handleImageUpload: (responsiveType: 'mobile' | 'desktop', coverIndex: number, file?: File) => void = (
    responsiveType,
    coverIndex,
    file,
  ) => {
    if (file) {
      const imagePropConvert = { desktop: 'desktopCoverUrl', mobile: 'mobileCoverUrl' }
      const imageSetConvert = { desktop: setDesktopCover, mobile: setMobileCover }
      setLoading(true)
      const uniqImageId = uuid()
      uploadFile(`images/${appId}/craft/${uniqImageId}`, file, authToken)
        .then(() => {
          imageSetConvert[responsiveType](cover => {
            const coverClone = cover.slice()
            coverClone[coverIndex] = file
            return coverClone
          })
          setProp(props => {
            props.covers[coverIndex][
              imagePropConvert[responsiveType]
            ] = `https://${process.env.REACT_APP_S3_BUCKET}/images/${appId}/craft/${uniqImageId}`
          })
        })
        .catch(handleError)
        .finally(() => setLoading(false))
    }
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
          margin: `${props.titleStyle?.margin?.mt || 0};${props.titleStyle?.margin?.mr || 0};${
            props.titleStyle?.margin?.mb || 0
          };${props.titleStyle?.margin?.ml || 0}`,
          textAlign: props.titleStyle?.textAlign || 'center',
          fontWeight: props.titleStyle?.fontWeight || 'bold',
          color: props.titleStyle?.color || '#585858',
        },
        paragraphStyle: {
          fontSize: props.paragraphStyle?.fontSize || 16,
          margin: `${props.paragraphStyle?.margin?.mt || 0};${props.paragraphStyle?.margin?.mr || 0};${
            props.paragraphStyle?.margin?.mb || 0
          };${props.paragraphStyle?.margin?.ml || 0}`,
          lineHeight: props.paragraphStyle?.lineHeight || 1,
          textAlign: props.paragraphStyle?.textAlign || 'center',
          fontWeight: props.paragraphStyle?.fontWeight || 'bold',
          color: props.paragraphStyle?.color || '#585858',
        },
      }}
      colon={false}
      onValuesChange={handleChange}
    >
      <Form.List name="covers">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, index) => (
              <Fragment key={field.fieldKey}>
                <Collapse
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
                        <StyledAddButton
                          type="link"
                          icon={<PlusIcon />}
                          className="p-0 mr-1"
                          onClick={() =>
                            add({
                              paragraph: '',
                              title: '',
                              desktopCoverUrl: '',
                              link: '',
                              mobileCoverUrl: '',
                              openNewTab: false,
                            })
                          }
                        />
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
                          label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.title)}</CraftSettingLabel>}
                        >
                          <Input />
                        </Form.Item>

                        <Form.Item
                          className="mb-3"
                          name={[field.name, 'paragraph']}
                          fieldKey={[field.fieldKey, 'paragraph']}
                          label={
                            <CraftSettingLabel>{formatMessage(craftPageMessages.label.content)}</CraftSettingLabel>
                          }
                        >
                          <Input.TextArea rows={5} />
                        </Form.Item>
                      </>
                    )}

                    <Form.Item
                      className="mb-3"
                      name={[field.name, 'desktopCoverUrl']}
                      fieldKey={[field.fieldKey, 'desktopCoverUrl']}
                      label={
                        <CraftSettingLabel>{formatMessage(craftPageMessages.label.desktopDisplay)}</CraftSettingLabel>
                      }
                    >
                      <ImageUploader
                        uploading={loading}
                        file={desktopCover[index] || null}
                        initialCoverUrl={props.covers[index]?.desktopCoverUrl || ''}
                        onChange={file => {
                          handleImageUpload('desktop', index, file)
                        }}
                      />
                    </Form.Item>
                    <Form.Item
                      className="mb-3"
                      name={[field.name, 'mobileCoverUrl']}
                      fieldKey={[field.fieldKey, 'mobileCoverUrl']}
                      label={
                        <CraftSettingLabel>{formatMessage(craftPageMessages.label.mobileDisplay)}</CraftSettingLabel>
                      }
                    >
                      <ImageUploader
                        uploading={loading}
                        file={mobileCover[index] || null}
                        initialCoverUrl={props.covers[index]?.mobileCoverUrl || ''}
                        onChange={file => {
                          handleImageUpload('mobile', index, file)
                        }}
                      />
                    </Form.Item>

                    <StyledLinkFormItem
                      className="mb-2"
                      name={[field.name, 'link']}
                      fieldKey={[field.fieldKey, 'link']}
                      label={<CraftSettingLabel>{formatMessage(craftPageMessages.label.link)}</CraftSettingLabel>}
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
            <TextStyleBlock type="title" title={formatMessage(craftPageMessages.label.titleStyle)} />
          </Form.Item>
          <Form.Item name="paragraphStyle">
            <TextStyleBlock type="paragraph" title={formatMessage(craftPageMessages.label.paragraphStyle)} />
          </Form.Item>
        </>
      )}
    </Form>
  )
}

export default CarouselSettings
