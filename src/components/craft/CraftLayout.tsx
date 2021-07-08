import { useNode, UserComponent } from '@craftjs/core'
import { Button, Collapse, Input, InputNumber, Select, Slider } from 'antd'
import { CollapseProps } from 'antd/lib/collapse'
import { replace, split } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import {
  AdminHeaderTitle,
  StyledCollapsePanel,
  StyledCraftSettingLabel,
  StyledFullWidthSelect,
  StyledInputNumber,
} from '../admin'

type layoutProps = {
  padding: number
  columnAmount: number
  columnRatio: number[]
  displayAmount: number
}

type CraftLayoutProps = {
  mobile: layoutProps
  desktop: layoutProps
}

const CraftLayout: UserComponent<CraftLayoutProps & { setActiveKey: React.Dispatch<React.SetStateAction<string>> }> = ({
  mobile,
  desktop,
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

const LayoutSettings: React.VFC<CollapseProps> = ({ ...collapseProps }) => {
  const { formatMessage } = useIntl()
  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props as CraftLayoutProps,
  }))

  const [desktopSetting, setDesktopSetting] = useState({
    padding: props.desktop?.padding || 0,
    columnAmount: props.desktop?.columnAmount || 0,
    columnRatio: props.desktop?.columnRatio || [],
    displayAmount: props.desktop?.displayAmount || 0,
  })
  const [mobileSetting, setMobileSetting] = useState({
    padding: props.mobile?.padding || 0,
    columnAmount: props.mobile?.columnAmount || 0,
    columnRatio: props.mobile?.columnRatio || [],
    displayAmount: props.mobile?.displayAmount || 0,
  })

  return (
    <>
      <Collapse
        {...collapseProps}
        className="mt-2 p-0"
        bordered={false}
        expandIconPosition="right"
        ghost
        defaultActiveKey={['desktopLayoutComponent']}
      >
        <StyledCollapsePanel
          key="desktopLayoutComponent"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.desktopLayoutComponent)}</AdminHeaderTitle>}
        >
          <>
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.padding)}</StyledCraftSettingLabel>
            <div className="col-12 mb-3 p-0 d-flex justify-content-center align-items-center ">
              <div className="col-8 p-0">
                <Slider
                  value={typeof desktopSetting.padding === 'number' ? desktopSetting.padding : 0}
                  onChange={(value: number) => setDesktopSetting({ ...desktopSetting, padding: value })}
                />
              </div>
              <InputNumber
                className="col-4"
                value={desktopSetting.padding || 0}
                onChange={value => setDesktopSetting({ ...desktopSetting, padding: Number(value) })}
              />
            </div>
          </>
          <div className="mb-3">
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.columnAmount)}</StyledCraftSettingLabel>
            <StyledFullWidthSelect
              className="mt-2"
              value={desktopSetting.columnAmount || 3}
              onChange={value => setDesktopSetting({ ...desktopSetting, columnAmount: Number(value) })}
            >
              <Select.Option key="1" value="1">
                1
              </Select.Option>
              <Select.Option key="2" value="2">
                2
              </Select.Option>
              <Select.Option key="3" value="3">
                3
              </Select.Option>
              <Select.Option key="4" value="4">
                4
              </Select.Option>
              <Select.Option key="6" value="6">
                6
              </Select.Option>
              <Select.Option key="12" value="12">
                12
              </Select.Option>
            </StyledFullWidthSelect>
          </div>
          <div className="mb-3">
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.ratio)}</StyledCraftSettingLabel>
            <Input
              className="mt-2"
              defaultValue={replace(/,/g, ':', desktopSetting.columnRatio.toString() || '3,3,3')}
              onChange={e =>
                setDesktopSetting({
                  ...desktopSetting,
                  columnRatio: split(':', e.target.value).map(v => parseInt(v)),
                })
              }
            />
          </div>
          <div className="mb-3">
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.displayAmount)}</StyledCraftSettingLabel>
            <div>
              <StyledInputNumber
                className="mt-2"
                value={desktopSetting.displayAmount}
                onChange={value => setDesktopSetting({ ...desktopSetting, displayAmount: Number(value) })}
              />
            </div>
          </div>
        </StyledCollapsePanel>
      </Collapse>

      <Collapse
        {...collapseProps}
        className="mt-4 p-0"
        bordered={false}
        expandIconPosition="right"
        ghost
        defaultActiveKey={['mobileLayoutComponent']}
      >
        <StyledCollapsePanel
          key="mobileLayoutComponent"
          header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.mobileLayoutComponent)}</AdminHeaderTitle>}
        >
          <>
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.padding)}</StyledCraftSettingLabel>
            <div className="col-12 mb-3 p-0 d-flex justify-content-center align-items-center">
              <div className="col-8 p-0">
                <Slider
                  value={typeof mobileSetting.padding === 'number' ? mobileSetting.padding : 0}
                  onChange={(value: number) => setMobileSetting({ ...mobileSetting, padding: value })}
                />
              </div>
              <InputNumber
                className="col-4"
                value={mobileSetting.padding}
                onChange={value => setMobileSetting({ ...mobileSetting, padding: Number(value) })}
              />
            </div>
          </>
          <div className="mb-3">
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.columnAmount)}</StyledCraftSettingLabel>
            <StyledFullWidthSelect
              className="mt-2"
              value={mobileSetting.columnAmount || 3}
              onChange={value => setMobileSetting({ ...mobileSetting, columnAmount: Number(value) })}
            >
              <Select.Option key="1" value="1">
                1
              </Select.Option>
              <Select.Option key="2" value="2">
                2
              </Select.Option>
              <Select.Option key="3" value="3">
                3
              </Select.Option>
              <Select.Option key="4" value="4">
                4
              </Select.Option>
              <Select.Option key="6" value="16">
                6
              </Select.Option>
              <Select.Option key="12" value="12">
                12
              </Select.Option>
            </StyledFullWidthSelect>
          </div>
          <div className="mb-3">
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.ratio)}</StyledCraftSettingLabel>
            <Input
              className="mt-2"
              value={replace(/,/g, ':', desktopSetting.columnRatio.toString() || '3,3,3')}
              onChange={e =>
                setMobileSetting({
                  ...mobileSetting,
                  columnRatio: split(':', e.target.value).map(v => parseInt(v)),
                })
              }
            />
          </div>
          <div className="mb-3">
            <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.displayAmount)}</StyledCraftSettingLabel>
            <div>
              <StyledInputNumber
                className="mt-2"
                value={mobileSetting.displayAmount || 0}
                onChange={value => setMobileSetting({ ...mobileSetting, displayAmount: Number(value) })}
              />
            </div>
          </div>
        </StyledCollapsePanel>
      </Collapse>
      <Button
        className="mt-3"
        type="primary"
        block
        onClick={() => {
          setProp((props: CraftLayoutProps) => (props.desktop = desktopSetting))
          setProp((props: CraftLayoutProps) => (props.mobile = mobileSetting))
        }}
      >
        {formatMessage(commonMessages.ui.save)}
      </Button>
      <div>1</div>
    </>
  )
}

CraftLayout.craft = {
  related: {
    settings: LayoutSettings,
  },
}

export default CraftLayout
