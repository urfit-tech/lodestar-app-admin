import { useNode } from '@craftjs/core'
import { Collapse, Form, Input, Slider, Tabs } from 'antd'
import { PropsWithCraft } from 'lodestar-app-element/src/components/common/Craftize'
import React from 'react'
import styled from 'styled-components'
import BackgroundStyleInput from '../inputs/BackgroundStyleInput'
import BorderStyleInput from '../inputs/BorderStyleInput'
import BoxModelInput from '../inputs/BoxModelInput'
import SpaceStyleInput from '../inputs/SpaceStyleInput'

export type CraftSettings<P> = React.ElementType<{
  props: PropsWithCraft<P>
  onPropsChange?: (props: PropsWithCraft<P>) => void
}>
export const withResponsive = <P extends object>(WrappedSettings: CraftSettings<P>) => {
  const ResponsiveSettings: React.VFC = () => {
    const {
      actions: { setProp },
      props,
    } = useNode(node => ({
      props: node.data.props as PropsWithCraft<P>,
      selected: node.events.selected,
    }))
    return (
      <Tabs defaultActiveKey="desktop">
        <Tabs.TabPane tab="desktop" key="desktop">
          <WrappedSettings
            props={props}
            onPropsChange={changedProps =>
              setProp((currentProps: PropsWithCraft<P>) => {
                currentProps.responsive = { ...changedProps.responsive, ...changedProps.responsive?.desktop }
              })
            }
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="tablet" key="tablet">
          <WrappedSettings
            props={props}
            onPropsChange={changedProps =>
              setProp((currentProps: PropsWithCraft<P>) => {
                currentProps.responsive = { ...changedProps.responsive, ...changedProps.responsive?.tablet }
              })
            }
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="mobile" key="mobile">
          <WrappedSettings
            props={props}
            onPropsChange={changedProps =>
              setProp((currentProps: P) => {
                currentProps = changedProps
              })
            }
          />
        </Tabs.TabPane>
      </Tabs>
    )
  }
  return ResponsiveSettings
}

export const AdminHeaderTitle = styled.div`
  flex-grow: 1;
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
export const CraftSettingLabel = styled.span`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
  font-weight: 500;
`
export const CraftSlider = styled(Slider)`
  .ant-slider-track {
    background-color: ${props => props.theme['@primary-color'] || '#4c5b8f'};
  }
`
export const StyledCollapsePanel = styled(Collapse.Panel)`
  .ant-collapse-header {
    padding-left: 0px !important;
  }
  .ant-collapse-content-box {
    padding: 0px !important;
  }
`
export const StyledSettingButtonWrapper = styled.div`
  position: absolute;
  top: 0.5em;
  right: 0.5em;
`
export const StyledUnderLineInput = styled(Input)`
  border-color: #d8d8d8;
  border-style: solid;
  border-top-width: 0px;
  border-right-width: 0px;
  border-bottom-width: 1px;
  border-left-width: 0px;
  :hover {
    border-right-width: 0px !important;
    border-color: #d8d8d8;
  }
`
export const StyledCraftSettingLabel = styled.span`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
  font-weight: 500;
`

type SettingProps = {
  title: string
  label?: string
  value?: string
  onChange?: (value: string) => void
}

export const CraftCollapseSetting: React.VFC<
  (
    | {
        variant: 'textarea'
        placeholder?: string
      }
    | {
        variant: 'slider'
        placeholder?: never
      }
  ) &
    SettingProps
> = ({ variant, placeholder, title, label, value, onChange }) => {
  return (
    <Collapse className="mt-2 p-0" bordered={false} expandIconPosition="right" ghost defaultActiveKey={['key']}>
      <StyledCollapsePanel key="key" header={<AdminHeaderTitle>{title}</AdminHeaderTitle>}>
        <div className="mb-2">
          {variant === 'textarea' && (
            <>
              {label && <CraftSettingLabel>{label}</CraftSettingLabel>}
              <Input.TextArea
                className="mt-2"
                rows={5}
                placeholder={placeholder}
                defaultValue={value}
                onChange={e => onChange?.(e.target.value)}
              />
            </>
          )}
          {variant === 'slider' && <BoxModelInput title={label} value={value} onChange={onChange} />}
        </div>
      </StyledCollapsePanel>
    </Collapse>
  )
}

export const TextSettingsPanel: React.VFC<{ title: string; key: string }> = ({ title, key }) => {
  return (
    <StyledCollapsePanel key={key} header={<AdminHeaderTitle>{title}</AdminHeaderTitle>}>
      <Form.Item name={`${key}.spaceStyle`}>
        <SpaceStyleInput />
      </Form.Item>
      <Form.Item name={`${key}.borderStyle`}>
        <BorderStyleInput />
      </Form.Item>
      <Form.Item name={`${key}.backgroundStyle`}>
        <BackgroundStyleInput />
      </Form.Item>
    </StyledCollapsePanel>
  )
}
