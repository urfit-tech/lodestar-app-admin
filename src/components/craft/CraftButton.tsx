import { useNode, UserComponent } from '@craftjs/core'
import { Button, Checkbox, Input, Radio, Space } from 'antd'
import Collapse, { CollapseProps } from 'antd/lib/collapse'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { CraftButtonProps } from '../../types/craft'
import {
  AdminHeaderTitle,
  StyleCircleColorInput,
  StyledCollapsePanel,
  StyledCraftSettingLabel,
  StyledSketchPicker,
  StyledUnderLineInput,
} from '../admin'

const CraftButton: UserComponent<CraftButtonProps & { setActiveKey: React.Dispatch<React.SetStateAction<string>> }> = ({
  title,
  link,
  openNewTab,
  size,
  block,
  variant,
  color,
  setActiveKey,
  children,
}) => {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div ref={ref => ref && connect(drag(ref))} onClick={() => setActiveKey('settings')}>
      {children}
    </div>
  )
}

const TitleSettings: React.VFC<CollapseProps> = ({ ...collapseProps }) => {
  const { formatMessage } = useIntl()
  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props as CraftButtonProps,
  }))

  const [button, setButton] = useState<CraftButtonProps>({
    title: props.title || '',
    link: props.link,
    openNewTab: props.openNewTab || false,
    size: props.size || 'md',
    block: props.block || false,
    variant: props.variant || 'solid',
    color: props.color || '#585858',
  })

  return (
    <>
      <Collapse
        {...collapseProps}
        className="mt-2 p-0"
        bordered={false}
        expandIconPosition="right"
        ghost
        defaultActiveKey={['buttonSetting']}
      >
        <StyledCollapsePanel
          key="buttonSetting"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.buttonSetting)}</AdminHeaderTitle>}
        >
          <div className="mb-3">
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.title)}</StyledCraftSettingLabel>
            <Input
              className="mt-2"
              value={button.title}
              onChange={e => setButton({ ...button, title: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.link)}</StyledCraftSettingLabel>
            <StyledUnderLineInput
              className="mb-2"
              value={button.link}
              placeholder="https://"
              onChange={e => setButton({ ...button, link: e.target.value })}
            />
            <Checkbox
              checked={button.openNewTab}
              onChange={e => setButton({ ...button, openNewTab: e.target.checked })}
            >
              {formatMessage(craftPageMessages.label.openNewTab)}
            </Checkbox>
          </div>
        </StyledCollapsePanel>
      </Collapse>

      <Collapse
        {...collapseProps}
        className="mt-4 p-0"
        bordered={false}
        expandIconPosition="right"
        ghost
        defaultActiveKey={['buttonStyle']}
      >
        <StyledCollapsePanel
          key="buttonStyle"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.buttonStyle)}</AdminHeaderTitle>}
        >
          <div>
            <StyledCraftSettingLabel className="mb-2">
              {formatMessage(craftPageMessages.label.textAlign)}
            </StyledCraftSettingLabel>
            <div>
              <Radio.Group value={button.size} onChange={value => setButton({ ...button, size: value.target.value })}>
                <Space direction="vertical">
                  <Radio value="large">{formatMessage(craftPageMessages.label.large)}</Radio>
                  <Radio value="middle">{formatMessage(craftPageMessages.label.middle)}</Radio>
                  <Radio value="small">{formatMessage(craftPageMessages.label.small)}</Radio>
                </Space>
              </Radio.Group>
            </div>

            <Checkbox checked={button.block} onChange={e => setButton({ ...button, block: e.target.checked })}>
              {formatMessage(craftPageMessages.label.width)}
            </Checkbox>

            <div className="">
              <StyledCraftSettingLabel className="mb-2">
                {formatMessage(craftPageMessages.label.variant)}
              </StyledCraftSettingLabel>
              <div>
                <Radio.Group
                  value={button.variant}
                  onChange={value => setButton({ ...button, variant: value.target.value })}
                >
                  <Space direction="vertical">
                    <Radio value="text">{formatMessage(craftPageMessages.label.plainText)}</Radio>
                    <Radio value="solid">{formatMessage(craftPageMessages.label.coloring)}</Radio>
                    <Radio value="outline">{formatMessage(craftPageMessages.label.outline)}</Radio>
                  </Space>
                </Radio.Group>
              </div>
            </div>
          </div>
          <>
            <StyledCraftSettingLabel className="mb-2">
              {formatMessage(craftPageMessages.label.color)}
            </StyledCraftSettingLabel>
            <StyledUnderLineInput
              className="mb-3"
              bordered={false}
              value={button.color}
              onChange={e => setButton({ ...button, color: e.target.value })}
            />
            <div className="d-flex mb-3">
              <StyleCircleColorInput background="#e1614b" onClick={() => setButton({ ...button, color: '#e1614b' })} />
              <StyleCircleColorInput
                className="ml-2"
                background="#585858"
                onClick={() => setButton({ ...button, color: '#585858' })}
              />
              <StyleCircleColorInput
                className="ml-2"
                background="#ffffff"
                onClick={() => setButton({ ...button, color: '#ffffff' })}
              />
            </div>
            <StyledSketchPicker
              className="mb-3"
              color={button.color}
              onChange={e => setButton({ ...button, color: e.hex })}
            />
          </>
        </StyledCollapsePanel>
      </Collapse>
      <Button
        className="mb-3"
        type="primary"
        block
        onClick={() => {
          //   setProp((props: CraftButtonProps) => {
          //     props.titleContent = titleContent
          //     props.fontSize = titleStyle.fontSize
          //     props.padding = titleStyle.padding
          //     props.textAlign = titleStyle.textAlign
          //     props.fontWeight = titleStyle.fontWeight
          //     props.color = titleStyle.color
          //   })
        }}
      >
        {formatMessage(commonMessages.ui.save)}
      </Button>
    </>
  )
}

CraftButton.craft = {
  related: {
    settings: TitleSettings,
  },
  custom: {
    button: {
      label: 'deleteBlock',
    },
  },
}

export default CraftButton
