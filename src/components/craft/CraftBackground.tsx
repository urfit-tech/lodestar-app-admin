import { useNode, UserComponent } from '@craftjs/core'
import { Button, Collapse, Radio } from 'antd'
import { CollapseProps } from 'antd/lib/collapse'
import Form from 'antd/lib/form/'
import { useForm } from 'antd/lib/form/Form'
import StyledSection from 'lodestar-app-element/src/components/BackgroundSection'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { CraftMarginProps } from '../../types/craft'
import { AdminHeaderTitle, StyledCollapsePanel, StyledSettingButtonWrapper } from '../admin'
import ImageUploader from '../common/ImageUploader'
import CraftBoxModelBlock from './CraftBoxModelBlock'
import CraftColorPickerBlock from './CraftColorPickerBlock'

type FieldProps = {
  backgroundType: 'none' | 'solidColor' | 'backgroundImage'
  solidColor?: string
  backgroundImageUrl?: string
  boxModel: {
    padding: number
    margin: CraftMarginProps
  }
}

type CraftBackgroundProps = {
  backgroundType: 'none' | 'solidColor' | 'backgroundImage'
  solidColor?: string
  coverUrl?: string
  padding: number
  margin: CraftMarginProps
}

const CraftBackground: UserComponent<
  { setActiveKey: React.Dispatch<React.SetStateAction<string>> } & CraftBackgroundProps
> = ({ backgroundType, solidColor, padding, margin, coverUrl, setActiveKey, children }) => {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <StyledSection
      ref={ref => ref && connect(drag(ref))}
      customStyle={{
        m: margin.m,
        mt: margin.mt,
        mr: margin.mr,
        mb: margin.mb,
        ml: margin.ml,
        p: padding,
      }}
      background-image={coverUrl}
      onClick={() => setActiveKey('settings')}
    >
      背景
    </StyledSection>
  )
}

const BackgroundSettings: React.VFC<CollapseProps> = ({ ...collapseProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const {
    actions: { setProp },
    props,
    selected,
  } = useNode(node => ({
    props: node.data.props as CraftBackgroundProps,
    selected: node.events.selected,
  }))
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null)

  const handleSubmit = (values: FieldProps) => {
    setProp(props => {
      props.backgroundType = values.backgroundType
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
        backgroundType: props.backgroundType || 'none',
        solidColor: props.solidColor || '#cccccc',
        backgroundImage: props.coverUrl || '',
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
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.blockSetting)}</AdminHeaderTitle>}
        >
          <Form.Item name="backgroundType" label={formatMessage(craftPageMessages.label.background)}>
            <Radio.Group buttonStyle="solid">
              <Radio.Button
                value="none"
                onChange={() =>
                  setProp((props: FieldProps) => {
                    props.backgroundType = 'none'
                  })
                }
              >
                {formatMessage(craftPageMessages.ui.empty)}
              </Radio.Button>
              <Radio.Button
                value="solidColor"
                onChange={() =>
                  setProp((props: FieldProps) => {
                    props.backgroundType = 'solidColor'
                  })
                }
              >
                {formatMessage(craftPageMessages.ui.solidColor)}
              </Radio.Button>
              <Radio.Button
                value="backgroundImage"
                onChange={() =>
                  setProp((props: FieldProps) => {
                    props.backgroundType = 'backgroundImage'
                  })
                }
              >
                {formatMessage(craftPageMessages.ui.image)}
              </Radio.Button>
            </Radio.Group>
          </Form.Item>

          {props.backgroundType === 'solidColor' && (
            <Form.Item name="solidColor">
              <CraftColorPickerBlock />
            </Form.Item>
          )}

          {props.backgroundType === 'backgroundImage' && (
            <Form.Item name="backgroundImage">
              <ImageUploader
                file={backgroundImage}
                initialCoverUrl={props.coverUrl}
                onChange={file => {
                  setBackgroundImage(file)
                }}
              />
            </Form.Item>
          )}
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

CraftBackground.craft = {
  related: {
    settings: BackgroundSettings,
  },
}

export default CraftBackground
