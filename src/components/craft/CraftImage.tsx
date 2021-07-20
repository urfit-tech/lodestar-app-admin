import { useNode, UserComponent } from '@craftjs/core'
import { Button, Collapse } from 'antd'
import { CollapseProps } from 'antd/lib/collapse'
import Form from 'antd/lib/form/'
import { useForm } from 'antd/lib/form/Form'
import StyledImage from 'lodestar-app-element/src/components/Image'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { CraftBoxModelProps, CraftImageProps } from '../../types/craft'
import { AdminHeaderTitle, StyledCollapsePanel, StyledSettingButtonWrapper } from '../admin'
import ImageUploader from '../common/ImageUploader'
import CraftBoxModelBlock from './CraftBoxModelBlock'

type FieldProps = CraftImageProps & { boxModel: CraftBoxModelProps }

const CraftImage: UserComponent<
  CraftImageProps &
    CraftBoxModelProps & { coverUrl: string; setActiveKey: React.Dispatch<React.SetStateAction<string>> }
> = ({ coverUrl, margin, padding, setActiveKey, children }) => {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <StyledImage
      ref={ref => ref && connect(drag(ref))}
      customStyle={{
        m: margin.m,
        mt: margin.mt,
        mr: margin.mr,
        mb: margin.mb,
        ml: margin.ml,
        p: padding,
      }}
      src={coverUrl}
      style={{ cursor: 'pointer' }}
      onClick={() => setActiveKey('settings')}
    />
  )
}

const ImageSettings: React.VFC<CollapseProps> = ({ ...collapseProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const {
    actions: { setProp },
    props,
    selected,
  } = useNode(node => ({
    props: node.data.props as CraftImageProps & CraftBoxModelProps,
    selected: node.events.selected,
  }))
  const [coverImage, setCoverImage] = useState<File | null>(null)

  const handleSubmit = (values: FieldProps) => {
    setProp(props => {
      props.type = values.type
      props.padding = values.boxModel.padding
      props.margin = {
        m: values.boxModel.margin.m,
        mt: values.boxModel.margin.mt,
        mr: values.boxModel.margin.mr,
        mb: values.boxModel.margin.mb,
        ml: values.boxModel.margin.ml,
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
        coverImage: props.coverUrl,
        boxModel: {
          padding: props.padding,
          margin: {
            m: props.margin.m,
            mt: props.margin.mt,
            mr: props.margin.mr,
            mb: props.margin.mb,
            ml: props.margin.ml,
          },
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
          <Form.Item name="coverImage">
            <ImageUploader
              file={coverImage}
              initialCoverUrl={props.coverUrl}
              onChange={file => {
                setCoverImage(file)
              }}
            />
          </Form.Item>
        </StyledCollapsePanel>
      </Collapse>
      <Form.Item name="boxModel">
        <CraftBoxModelBlock />
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

CraftImage.craft = {
  related: {
    settings: ImageSettings,
  },
}

export default CraftImage
