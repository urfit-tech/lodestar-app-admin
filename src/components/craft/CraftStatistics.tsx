import { useNode, UserComponent } from '@craftjs/core'
import { Button, Collapse, Form, Radio } from 'antd'
import { CollapseProps } from 'antd/lib/collapse'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import {
  CraftBoxModelProps,
  CraftImageProps,
  CraftParagraphProps,
  CraftTextStyleProps,
  CraftTitleProps,
} from '../../types/craft'
import { AdminHeaderTitle, StyledCollapsePanel, StyledSettingButtonWrapper } from '../admin'
import ImageUploader from '../common/ImageUploader'
import CraftBoxModelBlock from './CraftBoxModelBlock'
import CraftTextStyleBlock from './CraftTextStyleBlock'
import CraftTitleContentBlock from './CraftTitleContentBlock'

type FieldProps = {
  type: string
  boxModel: CraftBoxModelProps
  titleContent: string
  titleStyle: CraftTextStyleProps
  paragraphContent: string
  paragraphStyle: CraftTextStyleProps
}
type CraftStatisticsProps = CraftImageProps &
  CraftBoxModelProps & { title: CraftTitleProps; paragraph: CraftParagraphProps }

const CraftStatistics: UserComponent<
  CraftStatisticsProps & { setActiveKey: React.Dispatch<React.SetStateAction<string>> }
> = ({ title, paragraph, padding, margin, coverUrl, setActiveKey, children }) => {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div
      ref={ref => ref && connect(drag(ref))}
      style={{
        padding: `${padding}px`,
        margin: margin.m ? margin.m : `${margin.mt}px ${margin.mr}px ${margin.mb}px ${margin.ml}px`,
        cursor: 'pointer',
      }}
      onClick={() => setActiveKey('settings')}
    >
      <div>{title.titleContent}</div>
    </div>
  )
}

const StatisticsSettings: React.VFC<CraftStatisticsProps & CollapseProps> = ({ ...collapseProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const {
    actions: { setProp },
    props,
    selected,
  } = useNode(node => ({
    props: node.data.props as CraftStatisticsProps,
    selected: node.events.selected,
  }))
  const [coverImage, setCoverImage] = useState<File | null>(null)

  const handleSubmit = (values: FieldProps) => {
    setProp(props => {
      props.type = values.type
      props.coverImage = coverImage
      props.padding = values.boxModel.padding
      props.margin = values.boxModel.margin
      props.title = {
        titleContent: values.titleContent,
        fontSize: values.titleStyle.fontSize,
        padding: values.titleStyle.padding,
        textAlign: values.titleStyle.textAlign,
        fontWeight: values.titleStyle.fontWeight,
        color: values.titleStyle.color,
      }
      props.paragraph = {
        content: values.paragraphContent,
        fontSize: values.paragraphStyle.fontSize,
        padding: values.paragraphStyle.padding,
        textAlign: values.paragraphStyle.textAlign,
        fontWeight: values.paragraphStyle.fontWeight,
        color: values.paragraphStyle.color,
      }
    })
    //TODO: upload image
  }

  return (
    <Form
      form={form}
      layout="vertical"
      colon={false}
      requiredMark={false}
      initialValues={{
        type: props.type || 'image',
        coverImage: props.coverUrl,
        boxModel: {
          padding: props.padding,
          margin: props.margin,
        },
        titleContent: props.title.titleContent || '',
        titleStyle: {
          fontSize: props.title.fontSize || 16,
          padding: props.title.padding || 0,
          textAlign: props.title.textAlign || 'left',
          fontWeight: props.title.fontWeight || 'normal',
          color: props.title.color || '#585858',
        },
        paragraphContent: props.paragraph.paragraphContent || '',
        paragraphStyle: {
          fontSize: props.paragraph.fontSize || 16,
          lineHeight: props.paragraph.lineHeight || 1,
          padding: props.paragraph.padding || 0,
          textAlign: props.paragraph.textAlign || 'left',
          fontWeight: props.paragraph.fontWeight || 'normal',
          color: props.paragraph.color || '#585858',
        },
      }}
      onFinish={handleSubmit}
    >
      <Collapse
        {...collapseProps}
        className="mt-2 p-0"
        bordered={false}
        expandIconPosition="right"
        ghost
        defaultActiveKey={['imageSetting']}
      >
        <StyledCollapsePanel
          key="imageSetting"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.imageSetting)}</AdminHeaderTitle>}
        >
          <Form.Item name="type">
            <Radio.Group buttonStyle="solid">
              <Radio.Button
                value="empty"
                onChange={() =>
                  setProp((props: CraftStatisticsProps) => {
                    props.type = 'empty'
                  })
                }
              >
                {formatMessage(craftPageMessages.ui.empty)}
              </Radio.Button>
              <Radio.Button
                value="image"
                onChange={() =>
                  setProp((props: CraftStatisticsProps) => {
                    props.type = 'image'
                  })
                }
              >
                {formatMessage(craftPageMessages.ui.image)}
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
          {props.type === 'image' && (
            <Form.Item name="coverImage">
              <ImageUploader
                file={coverImage}
                initialCoverUrl={props.coverUrl}
                onChange={file => {
                  setCoverImage(file)
                }}
              />
            </Form.Item>
          )}
        </StyledCollapsePanel>
      </Collapse>
      {props.type === 'image' && (
        <Form.Item name="boxModel">
          <CraftBoxModelBlock />
        </Form.Item>
      )}
      <Form.Item name="titleContent">
        <CraftTitleContentBlock />
      </Form.Item>
      <Form.Item name="titleStyle">
        <CraftTextStyleBlock type="title" title={formatMessage(craftPageMessages.label.titleStyle)} />
      </Form.Item>
      <Form.Item name="paragraphContent">
        <CraftTitleContentBlock />
      </Form.Item>
      <Form.Item name="paragraphStyle">
        <CraftTextStyleBlock type="paragraph" title={formatMessage(craftPageMessages.label.paragraphStyle)} />
      </Form.Item>
      {selected && (
        <StyledSettingButtonWrapper>
          <Button className="mb-3" type="primary" block htmlType="submit">
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </StyledSettingButtonWrapper>
      )}
    </Form>
  )
}

CraftStatistics.craft = {
  related: {
    settings: StatisticsSettings,
  },
}

export default CraftStatistics
